from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import uvicorn
from api.routes import router
from data.store import store
import asyncio
import os
from apscheduler.schedulers.asyncio import AsyncIOScheduler

app = FastAPI(
    title="Trend Intelligence Platform API",
    description="Backend API providing real-time trend data and insights for the dashboard.",
    version="2.0.0"
)

# Allow frontend to communicate with backend
origins = ["*"] # Updated for broader dev compatibility

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(router, prefix="/api")

@app.on_event("startup")
async def startup_event():
    """Initializes the scraper engine on server startup."""
    print("TrendIntel: Application Startup - Initializing Scraper...")
    await store.refresh() # Block to ensure initial data is available
    print("TrendIntel: Startup Refresh Complete.")
    
    # Initialize Automated Background Scraping (Every 30 Minutes)
    scheduler = AsyncIOScheduler()
    scheduler.add_job(store.refresh, 'interval', minutes=30)
    scheduler.start()
    print("TrendIntel: Background Scraper Initialized (30m Interval).")

@app.get("/")
def read_root():
    return {"message": "Welcome to the REAL-TIME Trend Intelligence Platform API. /docs for schema."}

if __name__ == "__main__":
    port = int(os.environ.get("PORT", 8000))
    uvicorn.run("main:app", host="0.0.0.0", port=port, reload=False)
