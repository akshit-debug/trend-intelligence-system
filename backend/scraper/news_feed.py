import feedparser
import httpx
from datetime import datetime, timezone
from typing import List, Dict
import asyncio
import hashlib

# Top live news RSS sources
NEWS_SOURCES = [
    {
        "name": "BBC News",
        "url": "http://feeds.bbci.co.uk/news/rss.xml",
        "category": "World",
        "color": "#e63946"
    },
    {
        "name": "Reuters",
        "url": "https://feeds.reuters.com/reuters/topNews",
        "category": "Business",
        "color": "#f4a261"
    },
    {
        "name": "TechCrunch",
        "url": "https://techcrunch.com/feed/",
        "category": "Tech",
        "color": "#06b6d4"
    },
    {
        "name": "The Verge",
        "url": "https://www.theverge.com/rss/index.xml",
        "category": "Tech",
        "color": "#8b5cf6"
    },
    {
        "name": "Hacker News",
        "url": "https://hnrss.org/frontpage",
        "category": "Tech",
        "color": "#f97316"
    },
    {
        "name": "Google News - Top",
        "url": "https://news.google.com/rss?hl=en-US&gl=US&ceid=US:en",
        "category": "World",
        "color": "#4ade80"
    },
    {
        "name": "Al Jazeera",
        "url": "https://www.aljazeera.com/xml/rss/all.xml",
        "category": "World",
        "color": "#facc15"
    },
    {
        "name": "Ars Technica",
        "url": "http://feeds.arstechnica.com/arstechnica/index",
        "category": "Tech",
        "color": "#a78bfa"
    },
    {
        "name": "Bloomberg",
        "url": "https://feeds.bloomberg.com/markets/news.rss",
        "category": "Finance",
        "color": "#34d399"
    },
    {
        "name": "CNBC",
        "url": "https://search.cnbc.com/rs/search/combinedcms/view.xml?partnerId=wrss01&id=100003114",
        "category": "Finance",
        "color": "#60a5fa"
    },
]

def _make_id(title: str, source: str) -> str:
    return hashlib.md5(f"{source}::{title}".encode()).hexdigest()[:12]

def _parse_date(entry) -> str:
    """Try to parse published date from feed entry."""
    for attr in ("published", "updated", "created"):
        val = getattr(entry, attr, None)
        if val:
            return val
    return datetime.now(timezone.utc).strftime("%a, %d %b %Y %H:%M:%S +0000")

def _fetch_source_sync(source: dict) -> List[Dict]:
    """Parse a single RSS feed synchronously (feedparser does its own HTTP)."""
    items = []
    try:
        feed = feedparser.parse(source["url"])
        for entry in feed.entries[:8]:  # max 8 per source
            title = getattr(entry, "title", "").strip()
            link = getattr(entry, "link", "#")
            summary = getattr(entry, "summary", "")
            # Strip HTML tags from summary
            import re
            summary = re.sub(r"<[^>]+>", "", summary).strip()[:200]
            pub_date = _parse_date(entry)
            if title:
                items.append({
                    "id": _make_id(title, source["name"]),
                    "title": title,
                    "summary": summary or "No summary available.",
                    "link": link,
                    "source": source["name"],
                    "category": source["category"],
                    "color": source["color"],
                    "published": pub_date,
                    "fetched_at": datetime.now(timezone.utc).isoformat()
                })
    except Exception as e:
        print(f"[NewsFeed] Error fetching {source['name']}: {e}")
    return items

async def fetch_live_news(limit: int = 60) -> List[Dict]:
    """Fetch live news from all sources concurrently, return sorted by recency."""
    loop = asyncio.get_event_loop()
    tasks = [
        loop.run_in_executor(None, _fetch_source_sync, source)
        for source in NEWS_SOURCES
    ]
    results = await asyncio.gather(*tasks)
    
    all_items = []
    for items in results:
        all_items.extend(items)
    
    # Sort by fetched_at desc, deduplicate by id
    seen = set()
    unique = []
    for item in all_items:
        if item["id"] not in seen:
            seen.add(item["id"])
            unique.append(item)
    
    # Most recently fetched first
    unique.sort(key=lambda x: x.get("fetched_at", ""), reverse=True)
    return unique[:limit]
