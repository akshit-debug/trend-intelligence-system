# 🌌 Trend Intelligence System (TrendIntel)

A production-grade, real-time market surveillance and intelligence platform that scrapes, processes, and visualizes global trend vectors.

![Dashboard Preview](https://via.placeholder.com/1200x600/09090b/0ea5e9?text=Trend+Intelligence+System+Dashboard)

## 🚀 Key Features

- **Real-Time Scraping**: Ingests data from Hacker News API and Google Trends RSS.
- **Sentiment Resonance**: Processes keyword sentiment using NLP (TextBlob) to detect market alignment.
- **Pulse Sync**: Automated background updates every 30 minutes with manual override support.
- **Persistence**: Local JSON-based caching ensures data is preserved across server restarts.
- **Geo-Intelligence UI**: A premium, dark-themed React dashboard with framed animations and glassmorphism.

## 🛠️ Technology Stack

- **Backend**: FastAPI (Python 3.9+), Uvicorn, APScheduler, TextBlob, HTTPX.
- **Frontend**: React 19, Vite, TailwindCSS, Framer Motion, Lucide React, Recharts.

## 🏁 Getting Started

### Prerequisites
- Python 3.9+ installed.
- Node.js & npm installed.

### Installation

1. **Clone the repository** (or navigate to the workspace).
2. **Setup Backend**:
   ```bash
   cd backend
   python -m venv venv
   .\venv\Scripts\activate
   pip install -r requirements.txt
   python main.py
   ```
3. **Setup Frontend**:
   ```bash
   cd frontend
   npm install
   npm run dev
   ```

## 📡 API Architecture

The backend exposes several endpoints under the `/api` prefix:
- `GET /trends`: Retrieve all current trends with sentiment and historical data.
- `GET /status`: Check the last time the scraper synchronized.
- `POST /refresh`: Manually trigger a new scrape across all sources.
- `GET /search?keyword=...`: Deep-dive into specific global trend vectors.

## ☁️ Deployment Notes

- **Frontend**: Optimized for Vercel/Netlify.
- **Backend**: Recommended for Render, Railway, or Fly.io with a persistent volume for `trends_cache.json`.
- **Database (Future)**: The current architecture supports easy migration from JSON files to PostgreSQL/MongoDB.

---

