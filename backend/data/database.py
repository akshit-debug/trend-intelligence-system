"""
database.py — Async SQLite persistence layer for the Trend Intelligence Platform.

Tables:
  - trends        : current snapshot of each scraped trend
  - trend_history : time-series mention data per trend per refresh
  - insights      : AI-generated business insights
"""

import aiosqlite
import json
import os
from datetime import datetime
from typing import List, Dict, Optional

DB_PATH = os.path.join(os.path.dirname(__file__), "trenddb.sqlite3")


async def init_db():
    """Create all tables if they do not yet exist."""
    async with aiosqlite.connect(DB_PATH) as db:
        await db.execute("""
            CREATE TABLE IF NOT EXISTS trends (
                id              INTEGER PRIMARY KEY,
                keyword         TEXT    NOT NULL,
                mentions        INTEGER NOT NULL,
                growth          REAL    NOT NULL DEFAULT 0.0,
                status          TEXT    NOT NULL DEFAULT 'Rising',
                sentiment_json  TEXT    NOT NULL DEFAULT '{}',
                source          TEXT    NOT NULL DEFAULT 'unknown',
                scraped_at      TEXT    NOT NULL
            )
        """)

        await db.execute("""
            CREATE TABLE IF NOT EXISTS trend_history (
                id          INTEGER PRIMARY KEY AUTOINCREMENT,
                trend_id    INTEGER NOT NULL,
                date        TEXT    NOT NULL,
                mentions    INTEGER NOT NULL,
                FOREIGN KEY (trend_id) REFERENCES trends(id)
            )
        """)

        await db.execute("""
            CREATE TABLE IF NOT EXISTS insights (
                id                  INTEGER PRIMARY KEY AUTOINCREMENT,
                title               TEXT NOT NULL,
                description         TEXT NOT NULL,
                severity            TEXT NOT NULL,
                related_keyword     TEXT NOT NULL,
                created_at          TEXT NOT NULL
            )
        """)

        await db.commit()
    print("DB: Tables initialised.")


async def save_trends(trends: List[Dict]):
    """
    Upsert a fresh batch of trends into the DB.
    Also archives historical_data rows for each trend.
    """
    if not trends:
        return

    now = datetime.now().isoformat()

    async with aiosqlite.connect(DB_PATH) as db:
        for trend in trends:
            trend_id = trend.get("id")
            sentiment_json = json.dumps(trend.get("sentiment", {}))

            # Upsert the trend snapshot
            await db.execute("""
                INSERT INTO trends (id, keyword, mentions, growth, status, sentiment_json, source, scraped_at)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?)
                ON CONFLICT(id) DO UPDATE SET
                    keyword         = excluded.keyword,
                    mentions        = excluded.mentions,
                    growth          = excluded.growth,
                    status          = excluded.status,
                    sentiment_json  = excluded.sentiment_json,
                    source          = excluded.source,
                    scraped_at      = excluded.scraped_at
            """, (
                trend_id,
                trend.get("keyword", ""),
                trend.get("mentions", 0),
                trend.get("growth", 0.0),
                trend.get("status", "Rising"),
                sentiment_json,
                trend.get("source", "scraped"),
                now,
            ))

            # Store historical data points
            for h in trend.get("historical_data", []):
                # Avoid duplicates: only insert if (trend_id, date) not yet present
                await db.execute("""
                    INSERT INTO trend_history (trend_id, date, mentions)
                    SELECT ?, ?, ?
                    WHERE NOT EXISTS (
                        SELECT 1 FROM trend_history WHERE trend_id = ? AND date = ?
                    )
                """, (trend_id, h["date"], h["mentions"], trend_id, h["date"]))

        await db.commit()

    print(f"DB: Saved {len(trends)} trends.")


async def get_trends() -> List[Dict]:
    """Load all trends from the DB, enriched with historical data."""
    async with aiosqlite.connect(DB_PATH) as db:
        db.row_factory = aiosqlite.Row
        async with db.execute(
            "SELECT * FROM trends ORDER BY mentions DESC"
        ) as cursor:
            rows = await cursor.fetchall()

        trends = []
        for row in rows:
            trend = dict(row)
            trend["sentiment"] = json.loads(trend.pop("sentiment_json", "{}"))

            # Fetch history for this trend
            async with db.execute(
                "SELECT date, mentions FROM trend_history WHERE trend_id = ? ORDER BY date ASC",
                (trend["id"],)
            ) as h_cursor:
                history = [dict(h) for h in await h_cursor.fetchall()]

            trend["historical_data"] = history
            trends.append(trend)

    return trends


async def save_insights(insights: List[Dict]):
    """Replace the insights table with a fresh batch."""
    if not insights:
        return

    now = datetime.now().isoformat()

    async with aiosqlite.connect(DB_PATH) as db:
        await db.execute("DELETE FROM insights")
        for ins in insights:
            await db.execute("""
                INSERT INTO insights (title, description, severity, related_keyword, created_at)
                VALUES (?, ?, ?, ?, ?)
            """, (
                ins.get("title", ""),
                ins.get("description", ""),
                ins.get("severity", "medium"),
                ins.get("related_keyword", ""),
                now,
            ))
        await db.commit()

    print(f"DB: Saved {len(insights)} insights.")


async def get_insights() -> List[Dict]:
    """Load all insights from the DB."""
    async with aiosqlite.connect(DB_PATH) as db:
        db.row_factory = aiosqlite.Row
        async with db.execute(
            "SELECT rowid as id, * FROM insights ORDER BY rowid ASC"
        ) as cursor:
            rows = await cursor.fetchall()
        return [dict(r) for r in rows]


async def get_trend_history(keyword: str) -> List[Dict]:
    """Return the full historical data for a specific keyword."""
    async with aiosqlite.connect(DB_PATH) as db:
        db.row_factory = aiosqlite.Row
        async with db.execute(
            """
            SELECT th.date, th.mentions
            FROM trend_history th
            JOIN trends t ON th.trend_id = t.id
            WHERE LOWER(t.keyword) = LOWER(?)
            ORDER BY th.date ASC
            """,
            (keyword,)
        ) as cursor:
            rows = await cursor.fetchall()
        return [dict(r) for r in rows]
