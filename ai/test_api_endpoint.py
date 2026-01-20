"""
Test the satellite image analysis API endpoint
"""

import httpx
import asyncio
import base64

# Small test image (1x1 pixel PNG)
TEST_IMAGE_BASE64 = "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8/5+hHgAHggJ/PchI7wAAAABJRU5ErkJggg=="

async def test_endpoint():
    """Test the /ai/analyze-satellite-image endpoint"""
    
    url = "http://localhost:8000/ai/analyze-satellite-image"
    
    payload = {
        "zone_id": "quang_tri_test_zone",
        "image_data": TEST_IMAGE_BASE64,
        "image_type": "base64"
    }
    
    print("=" * 60)
    print("Testing POST /ai/analyze-satellite-image")
    print("=" * 60)
    print(f"URL: {url}")
    print(f"Zone ID: {payload['zone_id']}")
    print(f"Image Type: {payload['image_type']}")
    print("\nSending request...")
    
    async with httpx.AsyncClient(timeout=30.0) as client:
        try:
            response = await client.post(url, json=payload)
            
            print(f"\nStatus Code: {response.status_code}")
            
            if response.status_code == 200:
                result = response.json()
                print("\n✅ SUCCESS!")
                print("\nResponse:")
                print(f"  Zone ID: {result['zone_id']}")
                print(f"  Severity: {result['severity']}")
                print(f"  Confidence: {result['confidence_score']:.2f}")
                print(f"  Damage Summary: {result['damage_summary'][:150]}...")
                if result.get('affected_features'):
                    print(f"  Affected Features: {', '.join(result['affected_features'][:3])}")
                print(f"  Vegetation Status: {result.get('vegetation_status', 'N/A')}")
                print(f"  Water Presence: {result.get('water_presence', 'N/A')}")
                if result.get('recommendations'):
                    print(f"  Recommendations ({len(result['recommendations'])}):")
                    for i, rec in enumerate(result['recommendations'][:2], 1):
                        print(f"    {i}. {rec}")
                
                return True
            else:
                print(f"\n❌ FAILED!")
                print(f"Error: {response.text}")
                return False
                
        except Exception as e:
            print(f"\n❌ ERROR: {e}")
            import traceback
            traceback.print_exc()
            return False

async def test_health():
    """Test the health check endpoint"""
    print("\n" + "=" * 60)
    print("Testing GET /health")
    print("=" * 60)
    
    url = "http://localhost:8000/health"
    
    async with httpx.AsyncClient() as client:
        try:
            response = await client.get(url)
            print(f"Status Code: {response.status_code}")
            print(f"Response: {response.json()}")
            return response.status_code == 200
        except Exception as e:
            print(f"❌ ERROR: {e}")
            return False

async def main():
    print("\n🧪 Starting API Endpoint Tests\n")
    
    # Test health endpoint first
    health_ok = await test_health()
    
    if not health_ok:
        print("\n❌ Health check failed. Is the server running?")
        print("Start server with: uvicorn app.main:app --reload")
        return
    
    # Test satellite image analysis endpoint
    test_ok = await test_endpoint()
    
    print("\n" + "=" * 60)
    if test_ok:
        print("✅ ALL API TESTS PASSED!")
    else:
        print("❌ SOME TESTS FAILED")
    print("=" * 60)

if __name__ == "__main__":
    asyncio.run(main())
