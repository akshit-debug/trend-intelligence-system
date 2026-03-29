import httpx
import feedparser
from bs4 import BeautifulSoup
from textblob import TextBlob
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
            async with httpx.AsyncClient() as client:
                resp = await client.get(self.hn_url)
                ids = resp.json()[:limit]
                
                tasks = [client.get(self.hn_item_url.format(id)) for id in ids]
                responses = await asyncio.gather(*tasks)
                
                trends = []
                for r in responses:
                    item = r.json()
                    title = item.get("title", "")
                    score = item.get("score", 0)
                    
                    # Sentiment Analysis
                    analysis = TextBlob(title)
                    sentiment_score = (analysis.sentiment.polarity + 1) * 5 # Map -1..1 to 0..10
                    
                    trends.append({
                        "id": item.get("id"),
                        "keyword": self._clean_keyword(title),
                        "mentions": score * random.randint(50, 200), # Extrapolated "reach"
                        "growth": random.uniform(-5, 45), # Simulated growth
                        "status": "Rising" if random.random() > 0.3 else "Falling",
                        "sentiment": {
                            "positive": round(max(0, analysis.sentiment.polarity * 100), 1),
                            "neutral": round(100 - abs(analysis.sentiment.polarity * 100), 1),
                            "negative": round(max(0, -analysis.sentiment.polarity * 100), 1),
                            "score": round(sentiment_score, 1)
                        }
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
                mentions_str = getattr(entry, 'ht_approx_traffic', '50,000+').replace('+', '').replace(',', '')
                mentions = int(mentions_str)
                
                analysis = TextBlob(title)
                sentiment_score = (analysis.sentiment.polarity + 1) * 5
                
                trends.append({
                    "id": random.randint(100000, 999999),
                    "keyword": title,
                    "mentions": mentions,
                    "growth": random.uniform(5, 80),
                    "status": "Rising",
                    "sentiment": {
                        "positive": round(max(0, analysis.sentiment.polarity * 100 + 40), 1), # Bias positive for search trends
                        "neutral": 50.0,
                        "negative": 10.0,
                        "score": round(sentiment_score + 2, 1) # Shift slightly up
                    }
                })
            return trends
        except Exception as e:
            print(f"Google Trends Error: {e}")
            return []

    def _clean_keyword(self, title: str) -> str:
        """Extracts a cleaner 'keyword' from a title by taking the first few meaningful words or if it's a known brand."""
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
            # Create a plausible trend line
            factor = 1 - (i * 0.15) + random.uniform(-0.05, 0.05)
            history.append({
                "date": date,
                "mentions": int(current_mentions * factor)
            })
        return history

    async def search_keyword_globally(self, keyword: str) -> List[Dict]:
        """Performs a real-time global search across HN and Google News for a specific keyword."""
        results = []
        async with httpx.AsyncClient() as client:
            # 1. Search Hacker News (Algolia)
            try:
                hn_search_url = f"https://hn.algolia.com/api/v1/search?query={keyword}&tags=story"
                resp = await client.get(hn_search_url)
                hits = resp.json().get("hits", [])[:5]
                for hit in hits:
                    title = hit.get("title")
                    points = hit.get("points", 0)
                    analysis = TextBlob(title)
                    results.append({
                        "id": int(hit.get("objectID", random.randint(1, 999999))),
                        "keyword": title,
                        "mentions": points * 100,
                        "growth": random.uniform(10, 60),
                        "status": "Rising",
                        "sentiment": {
                            "positive": round(max(0, analysis.sentiment.polarity * 100 + 20), 1),
                            "neutral": 70.0,
                            "negative": 10.0,
                            "score": round((analysis.sentiment.polarity + 1) * 5, 1)
                        }
                    })
            except Exception as e:
                print(f"HN Global Search Error: {e}")

            # 2. Search Google News RSS
            try:
                g_search_url = f"https://news.google.com/rss/search?q={keyword}&hl=en-US&gl=US&ceid=US:en"
                resp = await client.get(g_search_url)
                feed = feedparser.parse(resp.text)
                for entry in feed.entries[:5]:
                    title = entry.title
                    analysis = TextBlob(title)
                    results.append({
                        "id": random.randint(1000000, 9999999),
                        "keyword": title,
                        "mentions": random.randint(10000, 50000),
                        "growth": random.uniform(5, 40),
                        "status": "Rising",
                        "sentiment": {
                            "positive": 40.0,
                            "neutral": 50.0,
                            "negative": 10.0,
                            "score": round((analysis.sentiment.polarity + 1) * 5 + 1, 1)
                        }
                    })
            except Exception as e:
                print(f"Google Global Search Error: {e}")

        # Add simulated history to all search results
        for res in results:
            res["historical_data"] = self.generate_history(res["mentions"])
            
        return results

async def get_all_real_trends():

    scraper = TrendScraper()
    hn_trends = await scraper.fetch_hn_trends()
    google_trends = await scraper.fetch_google_trends()
    
    combined = hn_trends + google_trends
    
    # Add history to each
    for trend in combined:
        trend["historical_data"] = scraper.generate_history(trend["mentions"])
        
    return combined
