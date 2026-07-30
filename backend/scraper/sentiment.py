"""
sentiment.py — Production-grade NLP sentiment analysis using VADER.

VADER (Valence Aware Dictionary and sEntiment Reasoner) is a lexicon and
rule-based sentiment analysis tool specifically attuned to sentiments expressed
in social media and news. Published: Hutto & Gilbert, ICWSM 2014.

Replaces TextBlob throughout the codebase for accurate, research-backed results.
"""

from vaderSentiment.vaderSentiment import SentimentIntensityAnalyzer
from typing import Dict
import asyncio

# Singleton analyzer — initialise once, reuse across all calls
_analyzer = SentimentIntensityAnalyzer()


def analyze_sentiment(text: str) -> Dict:
    """
    Run VADER sentiment analysis on a piece of text.

    Returns a dict compatible with the frontend SentimentModel:
        {
          "positive": float,   # 0–100
          "neutral":  float,   # 0–100
          "negative": float,   # 0–100
          "score":    float,   # 0–10 overall positivity score
        }
    """
    if not text or not text.strip():
        return {"positive": 33.3, "neutral": 33.3, "negative": 33.3, "score": 5.0}

    scores = _analyzer.polarity_scores(text)

    # VADER gives: neg, neu, pos (each 0–1) and compound (-1 to 1)
    positive  = round(scores["pos"] * 100, 1)
    neutral   = round(scores["neu"] * 100, 1)
    negative  = round(scores["neg"] * 100, 1)

    # Map compound (-1..1) → score (0..10)
    score = round((scores["compound"] + 1) * 5, 1)

    return {
        "positive": positive,
        "neutral":  neutral,
        "negative": negative,
        "score":    score,
    }


async def analyze_sentiment_async(text: str) -> Dict:
    """Async wrapper — runs VADER in executor so it never blocks the event loop."""
    loop = asyncio.get_event_loop()
    return await loop.run_in_executor(None, analyze_sentiment, text)


def batch_analyze(texts: list[str]) -> list[Dict]:
    """Analyse a list of texts in one pass (all synchronous, but fast)."""
    return [analyze_sentiment(t) for t in texts]
