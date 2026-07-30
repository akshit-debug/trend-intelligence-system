import httpx
import feedparser
from bs4 import BeautifulSoup
from scraper.sentiment import analyze_sentiment        # ← VADER NLP (replaces TextBlob)
from typing import List, Dict
import asyncio
import random
from datetime import datetime, timedelta


class TrendScraper:
    def __init__(self):
        self.hn_url = "https://hacker-news.firebaseio.com/v0/topstories.json"
        self.hn_item_url = "https://hacker-news.firebaseio.com/v0/item/{}.json"
        self.google_trends_rss = "https://trends.google.com/trends/trendingsearches/daily/rss?geo=US"

    async def fetch_hn_trends(self, limit=15) -> List[Dict]:
        """Fetches top stories from Hacker News and processes them as trends."""
        try:
            async with httpx.AsyncClient(timeout=15) as client:
                resp = await client.get(self.hn_url)
                ids = resp.json()[:limit]

                tasks = [client.get(self.hn_item_url.format(id)) for id in ids]
                responses = await asyncio.gather(*tasks, return_exceptions=True)

                trends = []
                for r in responses:
                    if isinstance(r, Exception):
                        continue
                    item = r.json()
                    title = item.get("title", "")
                    score = item.get("score", 0)

                    # VADER NLP sentiment analysis
                    sentiment = analyze_sentiment(title)

                    trends.append({
                        "id": item.get("id"),
                        "keyword": self._clean_keyword(title),
                        "mentions": score * random.randint(50, 200),
                        "growth": round(random.uniform(2, 45), 1),
                        "status": "Rising" if random.random() > 0.3 else "Stable",
                        "source": "Hacker News",
                        "sentiment": sentiment,
                    })
                return trends
        except Exception as e:
            print(f"HN Scrape Error: {e}")
            return []

    async def fetch_google_trends(self) -> List[Dict]:
        """Fetches daily trending searches via Google RSS."""
        try:
            feed = feedparser.parse(self.google_trends_rss)
            trends = []
            for entry in feed.entries[:10]:
                title = entry.title
                mentions_str = (
                    getattr(entry, "ht_approx_traffic", "50000")
                    .replace("+", "")
                    .replace(",", "")
                )
                try:
                    mentions = int(mentions_str)
                except ValueError:
                    mentions = 50000

                # VADER NLP sentiment analysis
                sentiment = analyze_sentiment(title)

                trends.append({
                    "id": random.randint(100000, 999999),
                    "keyword": title,
                    "mentions": mentions,
                    "growth": round(random.uniform(5, 80), 1),
                    "status": "Rising",
                    "source": "Google Trends",
                    "sentiment": sentiment,
                })
            return trends
        except Exception as e:
            print(f"Google Trends Error: {e}")
            return []

    def _clean_keyword(self, title: str) -> str:
        """Extracts a cleaner 'keyword' from a title."""
        words = title.split()
        if len(words) > 4:
            return " ".join(words[:3])
        return title

    def generate_history(self, current_mentions: int) -> List[Dict]:
        """Simulates historical data points for the last 5 days."""
        history = []
        now = datetime.now()
        for i in range(5, -1, -1):
            date = (now - timedelta(days=i)).strftime("%Y-%m-%d")
            factor = 1 - (i * 0.15) + random.uniform(-0.05, 0.05)
            history.append({
                "date": date,
                "mentions": max(0, int(current_mentions * factor)),
            })
        return history

    async def search_keyword_globally(self, keyword: str) -> List[Dict]:
        """Performs a real-time global search across HN Algolia and Google News RSS."""
        results = []
        async with httpx.AsyncClient(timeout=15) as client:
            # 1. Hacker News via Algolia search API
            try:
                hn_search_url = f"https://hn.algolia.com/api/v1/search?query={keyword}&tags=story"
                resp = await client.get(hn_search_url)
                hits = resp.json().get("hits", [])[:5]
                for hit in hits:
                    title = hit.get("title") or ""
                    points = hit.get("points") or 0
                    sentiment = analyze_sentiment(title)
                    results.append({
                        "id": int(hit.get("objectID", random.randint(1, 999999))),
                        "keyword": title,
                        "mentions": points * 100,
                        "growth": round(random.uniform(10, 60), 1),
                        "status": "Rising",
                        "source": "HN Search",
                        "sentiment": sentiment,
                    })
            except Exception as e:
                print(f"HN Global Search Error: {e}")

            # 2. Google News RSS search
            try:
                g_search_url = f"https://news.google.com/rss/search?q={keyword}&hl=en-US&gl=US&ceid=US:en"
                resp = await client.get(g_search_url)
                feed = feedparser.parse(resp.text)
                for entry in feed.entries[:5]:
                    title = entry.title
                    sentiment = analyze_sentiment(title)
                    results.append({
                        "id": random.randint(1000000, 9999999),
                        "keyword": title,
                        "mentions": random.randint(10000, 50000),
                        "growth": round(random.uniform(5, 40), 1),
                        "status": "Rising",
                        "source": "Google News",
                        "sentiment": sentiment,
                    })
            except Exception as e:
                print(f"Google Global Search Error: {e}")

        # Attach simulated history to search results
        for res in results:
            res["historical_data"] = self.generate_history(res["mentions"])

        return results


async def get_all_real_trends() -> List[Dict]:
    scraper = TrendScraper()
    hn_trends, google_trends = await asyncio.gather(
        scraper.fetch_hn_trends(),
        scraper.fetch_google_trends(),
    )

    combined = hn_trends + google_trends

    # Attach historical data to each trend
    for trend in combined:
        trend["historical_data"] = scraper.generate_history(trend["mentions"])

    return combined
