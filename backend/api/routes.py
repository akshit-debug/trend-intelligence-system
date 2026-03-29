from fastapi import APIRouter, Query, HTTPException
from typing import Optional, List
from data.store import store
from pydantic import BaseModel

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
