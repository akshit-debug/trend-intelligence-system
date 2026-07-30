import pytest
from fastapi.testclient import TestClient
from main import app

client = TestClient(app)

def test_read_root():
    response = client.get("/")
    assert response.status_code == 200
    assert "message" in response.json()

def test_get_status():
    response = client.get("/api/status")
    assert response.status_code == 200
    data = response.json()
    assert "count" in data
    assert "last_updated" in data
