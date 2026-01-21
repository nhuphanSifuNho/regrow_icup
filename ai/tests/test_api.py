"""
API Integration Tests
Requires server to be running: uvicorn app.main:app --port 8000
"""

import pytest
import httpx
import os

BASE_URL = "http://localhost:8000"


@pytest.mark.asyncio
async def test_health_check():
    """Test health check endpoint"""
    async with httpx.AsyncClient() as client:
        response = await client.get(f"{BASE_URL}/health")
        
        assert response.status_code == 200
        data = response.json()
        assert data["status"] == "healthy"
        assert data["service"] == "regrow-ai"


@pytest.mark.asyncio
async def test_analyze_damage():
    """Test damage analysis endpoint with valid data"""
    # Check test files exist
    before_path = "./test_data/quang_tri_before.tif"
    after_path = "./test_data/quang_tri_after.tif"
    
    if not os.path.exists(before_path) or not os.path.exists(after_path):
        pytest.skip("Test data files not found. Run: python test_data/generate_sample.py")
    
    async with httpx.AsyncClient() as client:
        payload = {
            "region_id": "test_region_01",
            "ndvi_before_path": before_path,
            "ndvi_after_path": after_path
        }
        
        response = await client.post(
            f"{BASE_URL}/ai/analyze-damage",
            json=payload,
            timeout=30.0
        )
        
        assert response.status_code == 200
        data = response.json()
        
        # Validate response structure
        assert "region_id" in data
        assert "damage_score" in data
        assert "damaged_area_ha" in data
        assert "severity" in data
        assert "breakdown" in data
        
        # Validate values
        assert 0 <= data["damage_score"] <= 1
        assert data["severity"] in ["high", "medium", "low"]
        assert data["damaged_area_ha"] >= 0
        assert data["breakdown"]["severe_ha"] >= 0
        assert data["breakdown"]["moderate_ha"] >= 0
        assert data["breakdown"]["minor_ha"] >= 0


@pytest.mark.asyncio
async def test_analyze_damage_invalid_path():
    """Test damage analysis with non-existent file"""
    async with httpx.AsyncClient() as client:
        payload = {
            "region_id": "test_region_01",
            "ndvi_before_path": "./nonexistent_before.tif",
            "ndvi_after_path": "./nonexistent_after.tif"
        }
        
        response = await client.post(
            f"{BASE_URL}/ai/analyze-damage",
            json=payload
        )
        
        assert response.status_code == 400
        data = response.json()
        assert "detail" in data
        assert "not found" in data["detail"].lower()


@pytest.mark.asyncio
async def test_distribute_funds():
    """Test fund distribution endpoint"""
    async with httpx.AsyncClient() as client:
        payload = {
            "total_fund": 100000,
            "regions": [
                {
                    "region_id": "region_a",
                    "damage_score": 0.8,
                    "damaged_area_ha": 100.0
                },
                {
                    "region_id": "region_b",
                    "damage_score": 0.5,
                    "damaged_area_ha": 50.0
                }
            ]
        }
        
        response = await client.post(
            f"{BASE_URL}/ai/distribute-funds",
            json=payload
        )
        
        assert response.status_code == 200
        data = response.json()
        
        # Validate response structure
        assert "allocations" in data
        assert len(data["allocations"]) == 2
        
        # Validate allocation totals
        total_amount = sum(alloc["amount"] for alloc in data["allocations"])
        total_percentage = sum(alloc["percentage"] for alloc in data["allocations"])
        
        assert abs(total_amount - 100000) < 0.01  # Within rounding error
        assert abs(total_percentage - 100.0) < 0.1
        
        # Validate higher damage gets more funds
        allocations = {a["region_id"]: a["amount"] for a in data["allocations"]}
        assert allocations["region_a"] > allocations["region_b"]


@pytest.mark.asyncio
async def test_distribute_funds_zero_fund():
    """Test fund distribution with zero total fund (should fail)"""
    async with httpx.AsyncClient() as client:
        payload = {
            "total_fund": 0,
            "regions": [
                {
                    "region_id": "region_a",
                    "damage_score": 0.8,
                    "damaged_area_ha": 100.0
                }
            ]
        }
        
        response = await client.post(
            f"{BASE_URL}/ai/distribute-funds",
            json=payload
        )
        
        # Should return validation error
        assert response.status_code == 422


@pytest.mark.asyncio
async def test_distribute_funds_empty_regions():
    """Test fund distribution with empty regions list (should fail)"""
    async with httpx.AsyncClient() as client:
        payload = {
            "total_fund": 100000,
            "regions": []
        }
        
        response = await client.post(
            f"{BASE_URL}/ai/distribute-funds",
            json=payload
        )
        
        # Should return validation error
        assert response.status_code == 422


if __name__ == "__main__":
    pytest.main([__file__, "-v"])
