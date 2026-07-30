from fastapi import APIRouter, Query, HTTPException
from fastapi.responses import StreamingResponse
from typing import Optional, List
from data.store import store
from scraper.news_feed import fetch_live_news
from pydantic import BaseModel
import asyncio
import json
import datetime

router = APIRouter()

# --- Pydantic Models for Response Documentation ---
class SentimentModel(BaseModel):
    positive: float
    neutral: float
    negative: float
    score: float

class StatusModel(BaseModel):
    last_updated: Optional[str]
    count: int

class HistDataModel(BaseModel):
    date: str
    mentions: int

class TrendModel(BaseModel):
    id: int
    keyword: str
    mentions: int
    growth: float
    status: str
    historical_data: List[HistDataModel]
    sentiment: SentimentModel

class InsightModel(BaseModel):
    id: int
    title: str
    description: str
    severity: str
    related_keyword: str

# --- Endpoints ---

@router.get("/trends", response_model=List[TrendModel])
def get_trends():
    """Returns all real-time trend data and associated metrics."""
    return store.get_trends()

@router.get("/search", response_model=List[TrendModel])
async def search_trends(keyword: str = Query(..., description="The keyword to search for")):
    """Returns real-time global trend data specifically matching the provided keyword."""
    return await store.search(keyword)

@router.get("/insights", response_model=List[InsightModel])
def get_insights():
    """Returns auto-generated business insights based on current real data."""
    return store.get_insights()

@router.post("/refresh")
async def refresh_trends():
    """Manually trigger a real-time data refresh."""
    await store.refresh()
    return {"message": "Data refreshed successfully", "count": len(store.get_trends())}

@router.get("/status", response_model=StatusModel)
def get_status():
    """Returns the current status of the intelligence engine."""
    return {
        "last_updated": store.last_updated,
        "count": len(store.get_trends())
    }

@router.get("/news")
async def get_live_news(limit: int = Query(60, ge=1, le=200)):
    """Returns the latest live news from all sources."""
    items = await fetch_live_news(limit=limit)
    return items

@router.get("/news/stream")
async def stream_news():
    """Server-Sent Events endpoint that pushes new articles every 30 seconds."""
    async def event_generator():
        seen_ids = set()
        while True:
            try:
                items = await fetch_live_news(limit=60)
                new_items = [i for i in items if i["id"] not in seen_ids]
                if new_items:
                    for item in new_items:
                        seen_ids.add(item["id"])
                    payload = json.dumps(new_items)
                    yield f"data: {payload}\n\n"
                else:
                    # heartbeat
                    yield f"data: []\n\n"
            except Exception as e:
                yield f"data: []\n\n"
            await asyncio.sleep(30)

    return StreamingResponse(
        event_generator(),
        media_type="text/event-stream",
        headers={
            "Cache-Control": "no-cache",
            "X-Accel-Buffering": "no",
        }
    )
