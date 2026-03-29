MOCK_TRENDS = [
    {
        "id": 1,
        "keyword": "Artificial Intelligence",
        "mentions": 1250000,
        "growth": 45.2,
        "status": "Rising",
        "historical_data": [
            {"date": "2026-03-24", "mentions": 850000},
            {"date": "2026-03-25", "mentions": 920000},
            {"date": "2026-03-26", "mentions": 1050000},
            {"date": "2026-03-27", "mentions": 1180000},
            {"date": "2026-03-28", "mentions": 1250000},
        ],
        "sentiment": {"positive": 75, "neutral": 15, "negative": 10, "score": 8.2}
    },
    {
        "id": 2,
        "keyword": "Quantum Computing",
        "mentions": 340000,
        "growth": 82.5,
        "status": "Rising",
        "historical_data": [
            {"date": "2026-03-24", "mentions": 180000},
            {"date": "2026-03-25", "mentions": 210000},
            {"date": "2026-03-26", "mentions": 250000},
            {"date": "2026-03-27", "mentions": 290000},
            {"date": "2026-03-28", "mentions": 340000},
        ],
        "sentiment": {"positive": 60, "neutral": 30, "negative": 10, "score": 7.5}
    },
    {
        "id": 3,
        "keyword": "Sustainable Aviation Fuel",
        "mentions": 85000,
        "growth": -12.4,
        "status": "Falling",
        "historical_data": [
            {"date": "2026-03-24", "mentions": 97000},
            {"date": "2026-03-25", "mentions": 95000},
            {"date": "2026-03-26", "mentions": 90000},
            {"date": "2026-03-27", "mentions": 88000},
            {"date": "2026-03-28", "mentions": 85000},
        ],
        "sentiment": {"positive": 45, "neutral": 40, "negative": 15, "score": 6.1}
    },
    {
        "id": 4,
        "keyword": "Space Tourism",
        "mentions": 520000,
        "growth": 15.8,
        "status": "Rising",
        "historical_data": [
            {"date": "2026-03-24", "mentions": 450000},
            {"date": "2026-03-25", "mentions": 465000},
            {"date": "2026-03-26", "mentions": 490000},
            {"date": "2026-03-27", "mentions": 505000},
            {"date": "2026-03-28", "mentions": 520000},
        ],
        "sentiment": {"positive": 55, "neutral": 20, "negative": 25, "score": 6.8}
    },
    {
        "id": 5,
        "keyword": "Synthetic Biology",
        "mentions": 210000,
        "growth": 34.6,
        "status": "Rising",
        "historical_data": [
            {"date": "2026-03-24", "mentions": 156000},
            {"date": "2026-03-25", "mentions": 168000},
            {"date": "2026-03-26", "mentions": 182000},
            {"date": "2026-03-27", "mentions": 195000},
            {"date": "2026-03-28", "mentions": 210000},
        ],
        "sentiment": {"positive": 68, "neutral": 22, "negative": 10, "score": 7.9}
    }
]

MOCK_INSIGHTS = [
    {
        "id": 1,
        "title": "Quantum Computing Spike",
        "description": "Mentions of Quantum Computing surged by 82.5% this week. Companies in the cryptography sector should assess potential immediate disruption risks.",
        "severity": "high",
        "related_keyword": "Quantum Computing"
    },
    {
        "id": 2,
        "title": "AI Sentiment Remains Strong",
        "description": "Despite regulatory concerns, Artificial Intelligence maintains a strong positive sentiment score of 8.2, driven by new multimodal model releases.",
        "severity": "medium",
        "related_keyword": "Artificial Intelligence"
    },
    {
        "id": 3,
        "title": "SAF Interest Cooling",
        "description": "Sustainable Aviation Fuel is seeing a -12.4% drop in mentions, likely due to recent pricing concerns masking long-term policy tailwinds.",
        "severity": "low",
        "related_keyword": "Sustainable Aviation Fuel"
    }
]
