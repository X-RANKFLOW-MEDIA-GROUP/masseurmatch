#!/usr/bin/env python3
"""
Google Trends Keyword Collector
Collects massage therapy keywords from Google Trends daily and stores in Supabase
Run daily via cron, Windows Task Scheduler, or Make.com webhook
"""

import os
import sys
import json
import asyncio
from datetime import datetime, timedelta
from typing import Optional
import logging

# Third-party imports
try:
    from pytrends.request import TrendReq
    import requests
except ImportError:
    print("❌ Missing dependencies. Install with:")
    print("   pip install pytrends requests")
    sys.exit(1)

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s - %(levelname)s - %(message)s",
    handlers=[
        logging.FileHandler("keyword_trends.log"),
        logging.StreamHandler(),
    ],
)
logger = logging.getLogger(__name__)

# Configuration
SUPABASE_URL = os.getenv("NEXT_PUBLIC_SUPABASE_URL")
SUPABASE_KEY = os.getenv("SUPABASE_SERVICE_ROLE_KEY")

# Keywords to track (50+ massage therapy keywords)
KEYWORDS = [
    # Top level
    "massage near me",
    "massage therapist",
    "massage therapist near me",
    # Specific to gay massage
    "gay massage",
    "gay massage therapist",
    "gay massage near me",
    "LGBTQ massage",
    "gay friendly massage",
    "gay-friendly massage therapist",
    # Session types
    "outcall massage",
    "incall massage",
    "hotel massage",
    "in-home massage",
    "mobile massage",
    # Techniques
    "deep tissue massage",
    "swedish massage",
    "therapeutic massage",
    "sports massage",
    "relaxation massage",
    "professional massage",
    "full body massage",
    "back massage",
    # By gender preference
    "massage for men",
    "male massage therapist",
    "male massage therapist near me",
    "massage by men",
    # Location modifiers
    "massage Dallas",
    "massage Houston",
    "massage Austin",
    "massage San Antonio",
    "massage Fort Worth",
    "massage DFW",
    # Premium/niche
    "premium massage",
    "luxury massage",
    "discreet massage",
    "confidential massage",
    # Booking/availability
    "book massage online",
    "schedule massage",
    "massage appointment",
    "same day massage",
    # Specific services
    "erotic massage",
    "tantric massage",
    "prostate massage",
    "sensual massage",
    # Certifications
    "licensed massage therapist",
    "certified massage therapist",
    # Time-based
    "evening massage",
    "weekend massage",
    "late night massage",
    # Additional volume keywords
    "massage services",
    "massage therapy",
    "body massage",
]

BATCH_SIZE = 5  # Google Trends rate limiting
WAIT_TIME = 2  # seconds between batches


def get_trends_data(keywords_batch: list[str]) -> Optional[dict]:
    """
    Fetch Google Trends data for a batch of keywords
    """
    try:
        pytrends = TrendReq(hl="en-US", tz=360)
        pytrends.build_payload(
            keywords_batch,
            cat=0,
            timeframe="today 1-m",  # Last month
            geo="US",
        )

        # Get interest by date
        data = pytrends.interest_by_date()
        logger.info(f"✅ Fetched trends for: {keywords_batch}")
        return data.to_dict()
    except Exception as e:
        logger.error(f"❌ Error fetching trends for {keywords_batch}: {e}")
        return None


def insert_into_supabase(trends_data: list[dict]) -> bool:
    """
    Insert keyword trends data into Supabase
    """
    if not SUPABASE_URL or not SUPABASE_KEY:
        logger.error("❌ SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY not set")
        return False

    try:
        headers = {
            "Authorization": f"Bearer {SUPABASE_KEY}",
            "apikey": SUPABASE_KEY,
            "Content-Type": "application/json",
        }

        url = f"{SUPABASE_URL}/rest/v1/keyword_trends"

        response = requests.post(url, json=trends_data, headers=headers)

        if response.status_code in [200, 201]:
            logger.info(f"✅ Inserted {len(trends_data)} records into Supabase")
            return True
        else:
            logger.error(f"❌ Supabase error: {response.status_code} - {response.text}")
            return False
    except Exception as e:
        logger.error(f"❌ Error inserting into Supabase: {e}")
        return False


def calculate_aggregates(scores: list) -> dict:
    """
    Calculate 7-day and 30-day averages
    """
    if not scores:
        return {}

    week_avg = sum(scores[:7]) / len(scores[:7]) if len(scores) >= 7 else sum(scores) / len(scores)
    month_avg = sum(scores) / len(scores) if scores else 0

    return {
        "week_avg": round(week_avg, 2),
        "month_avg": round(month_avg, 2),
    }


async def collect_keywords() -> bool:
    """
    Main function: collect, process, and store keyword trends
    """
    logger.info("=" * 60)
    logger.info("🚀 Starting Google Trends Keyword Collection")
    logger.info(f"📊 Keywords to track: {len(KEYWORDS)}")
    logger.info("=" * 60)

    today = datetime.now().date().isoformat()
    all_records = []
    success_count = 0
    error_count = 0

    # Batch collection
    for i in range(0, len(KEYWORDS), BATCH_SIZE):
        batch = KEYWORDS[i : i + BATCH_SIZE]
        logger.info(f"\n📈 Batch {i // BATCH_SIZE + 1}/{(len(KEYWORDS) - 1) // BATCH_SIZE + 1}: {batch}")

        trends_dict = get_trends_data(batch)

        if trends_dict:
            # Transform trends data for Supabase insert
            for keyword, values in trends_dict.items():
                latest_score = int(values[today]) if today in values else 0

                # Get all scores for this keyword
                scores = list(values.values())
                aggregates = calculate_aggregates(scores)

                # Detect peaks
                is_peak = latest_score > 90 or latest_score == max(scores)

                record = {
                    "keyword": keyword,
                    "score": latest_score,
                    "date": today,
                    "week_avg": aggregates.get("week_avg", latest_score),
                    "month_avg": aggregates.get("month_avg", latest_score),
                    "peak_detected": is_peak,
                    "data_source": "google_trends",
                }

                all_records.append(record)
                logger.info(
                    f"   • {keyword}: {latest_score}/100 "
                    f"(7d avg: {aggregates.get('week_avg', 'N/A')}, peak: {is_peak})"
                )

            success_count += len(batch)
        else:
            error_count += len(batch)

        # Rate limiting
        if i + BATCH_SIZE < len(KEYWORDS):
            logger.info(f"   ⏳ Waiting {WAIT_TIME}s before next batch...")
            await asyncio.sleep(WAIT_TIME)

    logger.info("\n" + "=" * 60)
    logger.info(f"📊 Collection Summary:")
    logger.info(f"   ✅ Success: {success_count} keywords")
    logger.info(f"   ❌ Errors: {error_count} keywords")
    logger.info(f"   📦 Total records to insert: {len(all_records)}")
    logger.info("=" * 60)

    # Insert into Supabase
    if all_records:
        logger.info("\n💾 Inserting into Supabase...")
        success = insert_into_supabase(all_records)

        if success:
            logger.info("✅ All data successfully stored!")
            return True
        else:
            logger.error("❌ Failed to insert data")
            return False
    else:
        logger.error("❌ No data to insert")
        return False


def main():
    """Entry point"""
    logger.info(f"Started at: {datetime.now()}")

    try:
        success = asyncio.run(collect_keywords())
        logger.info(f"Completed at: {datetime.now()}")
        logger.info(f"Result: {'✅ SUCCESS' if success else '❌ FAILED'}")
        return 0 if success else 1
    except KeyboardInterrupt:
        logger.info("⚠️ Interrupted by user")
        return 130
    except Exception as e:
        logger.error(f"❌ Fatal error: {e}", exc_info=True)
        return 1


if __name__ == "__main__":
    sys.exit(main())
