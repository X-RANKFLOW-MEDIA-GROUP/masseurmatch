#!/usr/bin/env python3
"""Resilient nationwide runner for Demand Radar.

Adds paced requests, jitter, a targeted second pass for HTTP 429 failures and a
single run envelope so partial collections never masquerade as full snapshots.
"""

from __future__ import annotations

import argparse
import json
import logging
import os
import random
import sys
import time
from datetime import UTC, datetime
from pathlib import Path
from typing import Any
from uuid import uuid4

from collect_google_trends import (
    ANCHOR,
    METHOD,
    SOURCE,
    collect_market,
    configure_logging,
    load_markets,
    post_payload,
    trends_client,
    write_artifact,
)

LOG = logging.getLogger("demand-radar-resilient")


def parser() -> argparse.ArgumentParser:
    value = argparse.ArgumentParser(description=__doc__)
    value.add_argument("--config", type=Path, default=Path(__file__).with_name("demand_radar_markets_national.json"))
    value.add_argument("--output", type=Path, default=Path("artifacts/demand-radar-run.json"))
    value.add_argument("--log-file", type=Path, default=Path("artifacts/demand-radar.log"))
    value.add_argument("--timeframe", default="today 3-m")
    value.add_argument("--market-limit", type=int, default=0)
    value.add_argument("--dry-run", action="store_true")
    return value


def is_rate_limited(error: object) -> bool:
    message = str(error).lower()
    return "429" in message or "too many requests" in message or "rate limit" in message


def sleep_between(delay: float, jitter: float) -> None:
    duration = delay + random.uniform(0.0, jitter)
    if duration > 0:
        time.sleep(duration)


def collect_pass(
    markets: list[dict[str, Any]],
    timeframe: str,
    run_id: str,
    delay: float,
    jitter: float,
    label: str,
) -> tuple[list[dict[str, Any]], list[dict[str, str]]]:
    rows: list[dict[str, Any]] = []
    errors: list[dict[str, str]] = []
    client = trends_client()
    for index, market in enumerate(markets, start=1):
        try:
            LOG.info("%s %s/%s: %s, %s", label, index, len(markets), market["city"], market["state"])
            rows.append(collect_market(client, market, timeframe, run_id))
        except Exception as exc:
            LOG.exception("%s failed for %s, %s", label, market["city"], market["state"])
            errors.append({"city": market["city"], "state": market["state"], "error": str(exc)[:500]})
            if is_rate_limited(exc):
                client = trends_client()
        if index < len(markets):
            sleep_between(delay, jitter)
    return rows, errors


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

        delay = max(float(os.getenv("DEMAND_RADAR_MARKET_DELAY_SECONDS", "6")), 0.0)
        jitter = max(float(os.getenv("DEMAND_RADAR_MARKET_JITTER_SECONDS", "3")), 0.0)
        cooldown = max(float(os.getenv("DEMAND_RADAR_SECOND_PASS_COOLDOWN_SECONDS", "120")), 0.0)
        retry_cap = max(int(os.getenv("DEMAND_RADAR_SECOND_PASS_MAX_MARKETS", "20")), 0)

        first_rows, first_errors = collect_pass(markets, args.timeframe, run_id, delay, jitter, "Primary pass")
        rows.extend(first_rows)
        errors = first_errors

        rate_limited = [item for item in errors if is_rate_limited(item.get("error", ""))]
        if rate_limited and 0 < len(errors) <= retry_cap:
            LOG.warning("%s markets failed. Cooling down %.0fs before targeted retry.", len(errors), cooldown)
            time.sleep(cooldown)
            market_map = {(market["city"], market["state"]): market for market in markets}
            retry_markets = [market_map[(item["city"], item["state"])] for item in errors if (item["city"], item["state"]) in market_map]
            retry_rows, retry_errors = collect_pass(retry_markets, args.timeframe, run_id, delay, jitter, "Retry pass")
            rows.extend(retry_rows)
            errors = retry_errors

        status = "completed" if rows and not errors else "partial" if rows else "failed"
        completed = datetime.now(UTC)
        payload = {
            "run": {
                "run_id": run_id,
                "status": status,
                "started_at": started.isoformat(),
                "completed_at": completed.isoformat(),
                "markets_requested": len(markets),
                "markets_succeeded": len(rows),
                "markets_failed": len(errors),
                "error_summary": errors,
                "metadata": {
                    "anchor_keyword": ANCHOR,
                    "timeframe": args.timeframe,
                    "methodology_version": METHOD,
                    "source": SOURCE,
                    "dry_run": args.dry_run,
                    "runner": "resilient-v1",
                    "pacing": {
                        "market_delay_seconds": delay,
                        "market_jitter_seconds": jitter,
                        "second_pass_cooldown_seconds": cooldown,
                        "second_pass_max_markets": retry_cap,
                    },
                },
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
        LOG.exception("Demand Radar resilient run failed")
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
                "metadata": {"methodology_version": METHOD, "source": SOURCE, "dry_run": args.dry_run, "runner": "resilient-v1"},
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
                    LOG.exception("Failed to persist failed resilient run")
        return 1


if __name__ == "__main__":
    raise SystemExit(main())
