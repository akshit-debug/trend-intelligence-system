from scraper.sentiment import analyze_sentiment, analyze_sentiment_async, batch_analyze
import pytest

def test_analyze_sentiment_positive():
    result = analyze_sentiment("I absolutely love this amazing new product! It is fantastic.")
    assert result["positive"] > 50
    assert result["negative"] < 10
    assert result["score"] > 7.0

def test_analyze_sentiment_negative():
    result = analyze_sentiment("This is terrible and awful. I hate it.")
    assert result["negative"] > 50
    assert result["positive"] < 10
    assert result["score"] < 4.0

def test_analyze_sentiment_neutral():
    result = analyze_sentiment("The sky is blue today. A car just drove past.")
    assert result["neutral"] > 80
    assert 4.0 <= result["score"] <= 6.0

def test_analyze_sentiment_empty():
    result = analyze_sentiment("")
    assert result["score"] == 5.0
    assert result["positive"] == 33.3

@pytest.mark.asyncio
async def test_analyze_sentiment_async():
    result = await analyze_sentiment_async("Great stuff!")
    assert result["positive"] > 50

def test_batch_analyze():
    texts = ["Good", "Bad"]
    results = batch_analyze(texts)
    assert len(results) == 2
    assert results[0]["score"] > 6.0
    assert results[1]["score"] < 4.0
