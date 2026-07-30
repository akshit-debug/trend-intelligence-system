"""
store.py — In-memory + SQLite-backed data store for the Trend Intelligence Platform.

On startup: loads from SQLite (falls back to JSON cache if DB is empty).
On refresh: scrapes live data → saves to SQLite → updates in-memory cache.
"""

from typing import List, Dict, Optional
import asyncio
from scraper.engine import TrendScraper, get_all_real_trends
from data.database import init_db, save_trends, get_trends as db_get_trends
from data.database import save_insights, get_insights as db_get_insights
import json
import os
from datetime import datetime


class DataStore:
    def __init__(self):
        self.trends: List[Dict] = []
        self.insights: List[Dict] = []
        self.last_updated: Optional[str] = None
        self.scraper = TrendScraper()
        self._json_cache_path = os.path.join(os.path.dirname(__file__), "trends_cache.json")

    async def startup(self):
        """Must be called once at application startup (async-safe)."""
        await init_db()

        # Try loading from SQLite first
        db_trends = await db_get_trends()
        db_insights = await db_get_insights()

        if db_trends:
            self.trends = db_trends
            self.insights = db_insights
            self.last_updated = db_trends[0].get("scraped_at") if db_trends else None
            print(f"Store: Loaded {len(self.trends)} trends from SQLite DB.")
        else:
            # Fallback: load from legacy JSON cache
            self._load_from_json()

    async def refresh(self):
        """Triggers the real-time scraper, persists to SQLite, and updates in-memory cache."""
        print("Scraper: Fetching real-time updates...")
        fresh_trends = await get_all_real_trends()
        fresh_insights = self._generate_real_insights(fresh_trends)

        # Persist to SQLite
        await save_trends(fresh_trends)
        await save_insights(fresh_insights)

        # Update in-memory cache
        self.trends = fresh_trends
        self.insights = fresh_insights
        self.last_updated = datetime.now().isoformat()

        # Also keep the JSON cache for legacy fallback
        self._save_to_json()

        print(f"Scraper: Successfully ingested {len(self.trends)} trends.")

    # ------------------------------------------------------------------
    # Insight Generation
    # ------------------------------------------------------------------

    def _generate_real_insights(self, trends: List[Dict]) -> List[Dict]:
        """Dynamically generates insights from the top scraped trends."""
        if not trends:
            return []

        insights = []
        top_by_mentions = sorted(trends, key=lambda x: x["mentions"], reverse=True)
        top_by_growth   = sorted(trends, key=lambda x: x["growth"],   reverse=True)
        top_by_sentiment = sorted(trends, key=lambda x: x["sentiment"]["score"], reverse=True)

        if top_by_mentions:
            main = top_by_mentions[0]
            insights.append({
                "id": 1,
                "title": f"{main['keyword']} — Volume Dominance",
                "description": (
                    f"Currently dominating search volume with {main['mentions']:,} mentions. "
                    f"Sentiment score: {main['sentiment']['score']}/10. "
                    "This trend is generating significant market attention right now."
                ),
                "severity": "high",
                "related_keyword": main["keyword"],
            })

        if top_by_sentiment:
            sent = top_by_sentiment[0]
            insights.append({
                "id": 2,
                "title": "Positive Sentiment Alpha",
                "description": (
                    f"VADER NLP analysis scores '{sent['keyword']}' at {sent['sentiment']['score']}/10 positivity "
                    f"({sent['sentiment']['positive']}% positive tone). "
                    "Strong positive sentiment suggests favourable market alignment."
                ),
                "severity": "medium",
                "related_keyword": sent["keyword"],
            })

        if top_by_growth:
            spike = top_by_growth[0]
            insights.append({
                "id": 3,
                "title": "Velocity Spike Detected",
                "description": (
                    f"A rapid {spike['growth']:.1f}% growth spike detected in '{spike['keyword']}' "
                    f"(source: {spike.get('source', 'N/A')}). "
                    "Early breakout momentum — monitor closely for sustained traction."
                ),
                "severity": "medium",
                "related_keyword": spike["keyword"],
            })

        # Extra insight: negative sentiment watchlist
        high_neg = [t for t in trends if t["sentiment"]["negative"] > 30]
        if high_neg:
            worst = sorted(high_neg, key=lambda x: x["sentiment"]["negative"], reverse=True)[0]
            insights.append({
                "id": 4,
                "title": "Risk Signal — Negative Sentiment",
                "description": (
                    f"'{worst['keyword']}' is carrying elevated negative sentiment "
                    f"({worst['sentiment']['negative']}% negative). "
                    "NLP signals suggest public concern. Treat as a risk watchlist item."
                ),
                "severity": "low",
                "related_keyword": worst["keyword"],
            })

        return insights

    # ------------------------------------------------------------------
    # Accessors
    # ------------------------------------------------------------------

    def get_trends(self) -> List[Dict]:
        return self.trends

    def get_insights(self) -> List[Dict]:
        return self.insights

    async def search(self, keyword: str) -> List[Dict]:
        """Local filter + global live search for a keyword."""
        local = [t for t in self.trends if keyword.lower() in t["keyword"].lower()]
        remote = await self.scraper.search_keyword_globally(keyword)
        return local + remote

    # ------------------------------------------------------------------
    # JSON legacy helpers
    # ------------------------------------------------------------------

    def _save_to_json(self):
        try:
            with open(self._json_cache_path, "w") as f:
                json.dump({"trends": self.trends, "insights": self.insights,
                           "last_updated": self.last_updated}, f, indent=2)
        except Exception as e:
            print(f"Store: JSON save error: {e}")

    def _load_from_json(self):
        try:
            if os.path.exists(self._json_cache_path):
                with open(self._json_cache_path, "r") as f:
                    data = json.load(f)
                self.trends = data.get("trends", [])
                self.insights = data.get("insights", [])
                self.last_updated = data.get("last_updated")
                print(f"Store: Loaded {len(self.trends)} trends from JSON cache.")
            else:
                print("Store: No cache found, will fetch on first refresh.")
        except Exception as e:
            print(f"Store: JSON load error: {e}")


# Export singleton
store = DataStore()
