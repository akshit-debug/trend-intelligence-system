import pytest
from scraper.engine import TrendScraper

def test_clean_keyword():
    scraper = TrendScraper()
    # 5 words should trigger the truncation to 3 words
    assert scraper._clean_keyword("Apple releases new iPhone today") == "Apple releases new"
    assert scraper._clean_keyword("Short title") == "Short title"

def test_generate_history():
    scraper = TrendScraper()
    history = scraper.generate_history(1000)
    assert len(history) == 6
    # The last factor has a +/- 0.05 random jitter around 1.0.
    assert 950 <= history[-1]["mentions"] <= 1050
    # the exact value might be slightly different due to random jitter, but it's close.
