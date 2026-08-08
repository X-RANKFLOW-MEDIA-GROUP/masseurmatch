#!/usr/bin/env python3
"""Collect state-scoped city demand signals and populate Demand Radar.

Google Trends values are relative sampled indices, not absolute search counts.
"""

from __future__ import annotations

import argparse
import json
import logging
import math
import os
from datetime import UTC, date, datetime, timedelta
from pathlib import Path
import statistics
import sys
import time
from typing import Any, Sequence
from uuid import uuid4

ANCHOR = "massage near me"
METHOD = "demand-radar-v2"
SOURCE = "google-trends-pytrends"
LOG = logging.getLogger("demand-radar")


def clamp(value: float) -> float:
    return max(0.0, min(100.0, value))


def avg(values: Sequence[float]) -> float:
    return statistics.fmean(values) if values else 0.0


def week_start(value: date | None = None) -> str:
    value = value or datetime.now(UTC).date()
    return (value - timedelta(days=value.weekday())).isoformat()


def normalize(target: float, anchor: float) -> float:
    return clamp(100.0 * target / max(target + anchor, 1.0))


def confidence(values: Sequence[float], anchors: Sequence[float]) -> int:
    if not values:
        return 0
    coverage = clamp(100 * len(values) / 35)
    nonzero = clamp(100 * sum(v > 0 for v in values) / len(values))
    anchor_coverage = clamp(100 * sum(v > 0 for v in anchors) / max(len(anchors), 1))
    recent = list(values[-28:])
    recent_avg = avg(recent)
    consistency = 35.0
    if len(recent) > 1 and recent_avg > 0:
        consistency = clamp(100 - (statistics.pstdev(recent) / recent_avg) * 55)
    raw = 0.35 * coverage + 0.30 * nonzero + 0.20 * anchor_coverage + 0.15 * consistency
    return round(clamp(min(raw, 35 + 0.65 * coverage)))


def spike_metrics(values: Sequence[float], anchors: Sequence[float]) -> dict[str, Any]:
    clean = [float(v) for v in values if math.isfinite(float(v))]
    clean_anchors = [float(v) for v in anchors if math.isfinite(float(v))]
    conf = confidence(clean, clean_anchors)
    if len(clean) < 8:
        current = round(avg(clean[-7:])) if clean else 0
        return {
            "current_index": current,
            "baseline_index": current,
            "spike_score": round(conf * 0.10),
            "growth_pct": 0.0,
            "velocity_score": 0,
            "persistence_score": 0,
            "confidence": conf,
            "trend": "stable",
            "components": {"confidence": conf, "sample_size": len(clean), "insufficient_history": True},
        }

    recent = clean[-7:]
    baseline = clean[max(0, len(clean) - 35) : -7] or clean[:-7]
    current_avg = avg(recent)
    baseline_avg = avg(baseline)
    baseline_std = statistics.pstdev(baseline) if len(baseline) > 1 else 0.0

    z_score = (current_avg - baseline_avg) / max(baseline_std, 5.0)
    anomaly = clamp((z_score + 1) * 25)
    growth_pct = ((current_avg / baseline_avg) - 1) * 100 if baseline_avg >= 1 else 0.0
    growth = clamp((growth_pct + 20) / 1.2)
    early, late = avg(recent[:3]), avg(recent[-3:])
    velocity_pct = ((late / early) - 1) * 100 if early >= 1 else 0.0
    velocity = clamp(max(0.0, velocity_pct) * 4)
    threshold = baseline_avg + 0.25 * baseline_std
    persistence = clamp(100 * sum(v > threshold for v in recent) / len(recent))
    spike = round(clamp(0.30 * anomaly + 0.25 * growth + 0.20 * velocity + 0.15 * persistence + 0.10 * conf))

    trend = "stable"
    if spike >= 60 or growth_pct >= 20:
        trend = "rising"
    elif growth_pct <= -20 and spike < 35:
        trend = "falling"

    return {
        "current_index": round(clamp(current_avg)),
        "baseline_index": round(clamp(baseline_avg)),
        "spike_score": spike,
        "growth_pct": round(growth_pct, 2),
        "velocity_score": round(velocity),
        "persistence_score": round(persistence),
        "confidence": conf,
        "trend": trend,
        "components": {
            "anomaly": round(anomaly, 2),
            "growth": round(growth, 2),
            "velocity": round(velocity, 2),
            "persistence": round(persistence, 2),
            "confidence": conf,
            "z_score": round(z_score, 3),
            "growth_pct": round(growth_pct, 2),
            "velocity_pct": round(velocity_pct, 2),
            "current_mean": round(current_avg, 2),
            "baseline_mean": round(baseline_avg, 2),
            "baseline_std": round(baseline_std, 2),
            "sample_size": len(clean),
        },
    }


def intent_keywords(city: str) -> list[str]:
    city = city.lower().strip()
    return [f"gay massage {city}", f"male massage {city}", f"gay masseur {city}", f"mobile massage {city}"]


def load_markets(path: Path) -> list[dict[str, Any]]:
    data = json.loads(path.read_text(encoding="utf-8"))
    markets = data.get("markets") if isinstance(data, dict) else None
    if not isinstance(markets, list):
        raise ValueError("Market config must contain a markets array")
    seen: set[tuple[str, str]] = set()
    result: list[dict[str, Any]] = []
    for item in markets:
        if not isinstance(item, dict):
            raise ValueError("Every market must be an object")
        market = {
            "city": str(item.get("city", "")).strip(),
            "state": str(item.get("state", "")).strip().upper(),
            "region_code": str(item.get("region_code", "")).strip().upper(),
            "region_name": str(item.get("region_name", "")).strip(),
            "competition_index": int(item.get("competition_index", 50)),
        }
        key = (market["city"].lower(), market["state"])
        if not market["city"] or len(market["state"]) != 2 or not market["region_code"].startswith("US-"):
            raise ValueError(f"Invalid market: {item}")
        if key in seen or not 0 <= market["competition_index"] <= 100:
            raise ValueError(f"Duplicate or invalid market: {item}")
        seen.add(key)
        result.append(market)
    return result


def trends_client() -> Any:
    try:
        from pytrends.request import TrendReq
    except ImportError as exc:
        raise RuntimeError("Install pytrends before running the collector") from exc
    return TrendReq(hl="en-US", tz=360, timeout=(10, 30))


def request_series(client: Any, market: dict[str, Any], timeframe: str) -> tuple[list[float], list[float], list[str]]:
    targets = intent_keywords(market["city"])
    keywords = [ANCHOR, *targets]
    last_error: Exception | None = None
    for attempt in range(1, 4):
        try:
            client.build_payload(keywords, timeframe=timeframe, geo=market["region_code"])
            frame = client.interest_over_time()
            if frame is None or frame.empty:
                raise RuntimeError("Google Trends returned no rows")
            if "isPartial" in frame.columns:
                frame = frame.loc[~frame["isPartial"].astype(bool)].drop(columns=["isPartial"])
            missing = [k for k in keywords if k not in frame.columns]
            if missing:
                raise RuntimeError(f"Missing Trends columns: {', '.join(missing)}")
            anchor_values = frame[ANCHOR].astype(float).tolist()
            target_values = frame[targets].astype(float).mean(axis=1).tolist()
            normalized = [normalize(target, anchor) for target, anchor in zip(target_values, anchor_values)]
            dates = [index.date().isoformat() for index in frame.index]
            return normalized, anchor_values, dates
        except Exception as exc:
            last_error = exc
            if attempt < 3:
                wait = 3 * (3 ** (attempt - 1))
                LOG.warning("Attempt %s failed for %s, %s: %s. Retrying in %ss", attempt, market["city"], market["state"], exc, wait)
                time.sleep(wait)
    raise RuntimeError(f"Collection failed for {market['city']}, {market['state']}: {last_error}")


def collect_market(client: Any, market: dict[str, Any], timeframe: str, run_id: str) -> dict[str, Any]:
    values, anchors, dates = request_series(client, market, timeframe)
    metrics = spike_metrics(values, anchors)
    collected = datetime.now(UTC)
    demand = round(clamp(0.65 * metrics["current_index"] + 0.25 * metrics["spike_score"] + 0.10 * metrics["confidence"]))
    return {
        **market,
        "neighborhood": None,
        "score": demand,
        "trend": metrics["trend"],
        "search_volume_index": metrics["current_index"],
        "spike_score": metrics["spike_score"],
        "baseline_index": metrics["baseline_index"],
        "growth_pct": metrics["growth_pct"],
        "velocity_score": metrics["velocity_score"],
        "persistence_score": metrics["persistence_score"],
        "confidence": metrics["confidence"],
        "sample_size": len(values),
        "score_components": {**metrics["components"], "anchor_keyword": ANCHOR, "intent_keywords": intent_keywords(market["city"]), "first_sample_date": dates[0] if dates else None, "last_sample_date": dates[-1] if dates else None},
        "source": SOURCE,
        "methodology_version": METHOD,
        "week_start": week_start(collected.date()),
        "collected_at": collected.isoformat(),
        "expires_at": (collected + timedelta(hours=72)).isoformat(),
        "run_id": run_id,
    }


def post_payload(url: str, key: str, payload: dict[str, Any]) -> dict[str, Any]:
    try:
        import requests
    except ImportError as exc:
        raise RuntimeError("Install requests before running the collector") from exc
    response = requests.post(
        f"{url.rstrip('/')}/api/internal/demand-scores",
        json=payload,
        headers={"x-internal-api-key": key, "user-agent": "masseurmatch-demand-radar/2.0"},
        timeout=60,
    )
    if not response.ok:
        raise RuntimeError(f"Ingestion HTTP {response.status_code}: {response.text[:500]}")
    parsed = response.json()
    return parsed if isinstance(parsed, dict) else {"response": parsed}


def write_artifact(path: Path, payload: dict[str, Any]) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)
    path.write_text(json.dumps(payload, indent=2, sort_keys=True), encoding="utf-8")


def configure_logging(path: Path) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)
    formatter = logging.Formatter("%(asctime)s %(levelname)s %(message)s")
    handlers: list[logging.Handler] = [logging.StreamHandler(sys.stdout), logging.FileHandler(path, encoding="utf-8")]
    for handler in handlers:
        handler.setFormatter(formatter)
    logging.basicConfig(level=logging.INFO, handlers=handlers, force=True)


def parser() -> argparse.ArgumentParser:
    value = argparse.ArgumentParser(description=__doc__)
    value.add_argument("--config", type=Path, default=Path(__file__).with_name("demand_radar_markets.json"))
    value.add_argument("--output", type=Path, default=Path("artifacts/demand-radar-run.json"))
    value.add_argument("--log-file", type=Path, default=Path("artifacts/demand-radar.log"))
    value.add_argument("--timeframe", default="today 3-m")
    value.add_argument("--market-limit", type=int, default=0)
    value.add_argument("--dry-run", action="store_true")
    return value


def main() -> int:
    args = parser().parse_args()
    configure_logging(args.log_file)
    started = datetime.now(UTC)
    run_id = str(uuid4())
    rows: list[dict[str, Any]] = []
    errors: list[dict[str, str]] = []
    markets: list[dict[str, Any]] = []
    try:
        markets = load_markets(args.config)
        if args.market_limit > 0:
            markets = markets[: args.market_limit]
        if not markets:
            raise RuntimeError("No markets selected")
        client = trends_client()
        delay = max(float(os.getenv("DEMAND_RADAR_MARKET_DELAY_SECONDS", "1.5")), 0.0)
        for index, market in enumerate(markets, start=1):
            try:
                LOG.info("Collecting %s/%s: %s, %s", index, len(markets), market["city"], market["state"])
                rows.append(collect_market(client, market, args.timeframe, run_id))
            except Exception as exc:
                LOG.exception("Market collection failed for %s, %s", market["city"], market["state"])
                errors.append({"city": market["city"], "state": market["state"], "error": str(exc)[:500]})
            if delay and index < len(markets):
                time.sleep(delay)

        status = "completed" if rows and not errors else "partial" if rows else "failed"
        payload = {
            "run": {
                "run_id": run_id,
                "status": status,
                "started_at": started.isoformat(),
                "completed_at": datetime.now(UTC).isoformat(),
                "markets_requested": len(markets),
                "markets_succeeded": len(rows),
                "markets_failed": len(errors),
                "error_summary": errors,
                "metadata": {"anchor_keyword": ANCHOR, "timeframe": args.timeframe, "methodology_version": METHOD, "source": SOURCE, "dry_run": args.dry_run},
            },
            "rows": rows,
        }
        api_response = None
        if not args.dry_run:
            url = os.getenv("DEMAND_RADAR_APP_URL") or os.getenv("NEXT_PUBLIC_APP_URL") or ""
            key = os.getenv("INTERNAL_API_KEY") or ""
            if not url or not key:
                raise RuntimeError("DEMAND_RADAR_APP_URL and INTERNAL_API_KEY are required")
            api_response = post_payload(url, key, payload)
        write_artifact(args.output, {**payload, "api_response": api_response})
        return 0 if status == "completed" else 2
    except Exception as exc:
        LOG.exception("Demand Radar run failed")
        errors.append({"scope": "run", "error": str(exc)[:1000]})
        payload = {
            "run": {
                "run_id": run_id,
                "status": "failed",
                "started_at": started.isoformat(),
                "completed_at": datetime.now(UTC).isoformat(),
                "markets_requested": len(markets),
                "markets_succeeded": len(rows),
                "markets_failed": max(len(errors), 1),
                "error_summary": errors,
                "metadata": {"methodology_version": METHOD, "source": SOURCE, "dry_run": args.dry_run},
            },
            "rows": rows,
        }
        write_artifact(args.output, payload)
        if not args.dry_run:
            url = os.getenv("DEMAND_RADAR_APP_URL") or os.getenv("NEXT_PUBLIC_APP_URL") or ""
            key = os.getenv("INTERNAL_API_KEY") or ""
            if url and key:
                try:
                    post_payload(url, key, payload)
                except Exception:
                    LOG.exception("Failed to persist failed run")
        return 1


if __name__ == "__main__":
    raise SystemExit(main())
