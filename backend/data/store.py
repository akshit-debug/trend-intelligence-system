from typing import List, Dict, Optional
import asyncio
from scraper.engine import TrendScraper, get_all_real_trends
import random
import json
import os
from datetime import datetime

# Initializing a singleton-like store
class DataStore:
    def __init__(self):
        self.trends: List[Dict] = []
        self.insights: List[Dict] = []
        self.last_updated: Optional[str] = None
        self.scraper = TrendScraper()
        self.persistence_path = os.path.join(os.path.dirname(__file__), "trends_cache.json")
        self._load_from_disk()

    async def refresh(self):
        """Triggers the real-time scraper and updates the store."""
        print("Scraper: Fetching real-time updates...")
        self.trends = await get_all_real_trends()
        self.insights = self._generate_real_insights(self.trends)
        self.last_updated = datetime.now().isoformat()
        self._save_to_disk()
        print(f"Scraper: Successfully ingested {len(self.trends)} trends.")

    def _generate_real_insights(self, trends: List[Dict]) -> List[Dict]:
        """Dynamically generates insights based on the top-scraped trends."""
        insights = []
        if not trends: return []

        # Sort by mentions
        top_by_mentions = sorted(trends, key=lambda x: x["mentions"], reverse=True)
        top_by_growth = sorted(trends, key=lambda x: x["growth"], reverse=True)

        # Highlight top mention
        if top_by_mentions:
            main = top_by_mentions[0]
            insights.append({
                "id": 1,
                "title": f"{main['keyword']} Dominance",
                "description": f"Currently dominating search volume with {main['mentions']:,} mentions. This trend accounts for significant market noise right now.",
                "severity": "high",
                "related_keyword": main['keyword']
            })

        # Highlight sentiment shift
        top_sentiment = sorted(trends, key=lambda x: x["sentiment"]["score"], reverse=True)
        if top_sentiment:
            sent = top_sentiment[0]
            insights.append({
                "id": 2,
                "title": "Sentiment Alpha",
                "description": f"The community sentiment for {sent['keyword']} is exceptionally high ({sent['sentiment']['score']}/10), suggesting positive market alignment.",
                "severity": "medium",
                "related_keyword": sent['keyword']
            })

        # Sudden interest spike
        if top_by_growth:
            spike = top_by_growth[0]
            insights.append({
                "id": 3,
                "title": "Velocity Spike Detected",
                "description": f"A rapid {spike['growth']:.1f}% growth spike detected in {spike['keyword']}. Potential breakout momentum in early stages.",
                "severity": "medium",
                "related_keyword": spike['keyword']
            })

        return insights

    def _save_to_disk(self):
        """Persists the current store state to a local JSON file."""
        try:
            data = {
                "trends": self.trends,
                "insights": self.insights,
                "last_updated": self.last_updated
            }
            with open(self.persistence_path, "w") as f:
                json.dump(data, f, indent=2)
            print(f"Store: Persisted state to {self.persistence_path}")
        except Exception as e:
            print(f"Store: Save Error: {e}")

    def _load_from_disk(self):
        """Loads the store state from the local JSON file on startup."""
        try:
            if os.path.exists(self.persistence_path):
                with open(self.persistence_path, "r") as f:
                    data = json.load(f)
                    self.trends = data.get("trends", [])
                    self.insights = data.get("insights", [])
                    self.last_updated = data.get("last_updated")
                print(f"Store: Loaded {len(self.trends)} trends from cache.")
            else:
                print("Store: No cache found, starting fresh.")
        except Exception as e:
            print(f"Store: Load Error: {e}")
            self.trends = []
            self.insights = []

    def get_trends(self) -> List[Dict]:
        return self.trends

    def get_insights(self) -> List[Dict]:
        return self.insights

    async def search(self, keyword: str) -> List[Dict]:
        """Performs a global search across external sources for any keyword."""
        local_matches = [t for t in self.trends if keyword.lower() in t["keyword"].lower()]
        global_matches = await self.scraper.search_keyword_globally(keyword)
        return local_matches + global_matches

# Export a direct instance for use
store = DataStore()
