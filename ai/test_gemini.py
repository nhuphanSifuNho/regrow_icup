"""
Quick test script to verify Gemini API integration
Tests the satellite image analyzer with a simple test image
"""

import sys
import os
from pathlib import Path

# Add project to path
sys.path.insert(0, str(Path(__file__).parent))

from app.services.satellite_image_analyzer import SatelliteImageAnalyzer
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

def test_gemini_connection():
    """Test basic Gemini API connection"""
    print("=" * 60)
    print("Testing Google Gemini API Connection")
    print("=" * 60)
    
    # Check API key
    api_key = os.getenv("GOOGLE_GEMINI_API_KEY")
    if not api_key:
        print("❌ ERROR: GOOGLE_GEMINI_API_KEY not found in environment")
        return False
    
    print(f"✓ API Key found: {api_key[:20]}...")
    
    # Initialize analyzer
    try:
        analyzer = SatelliteImageAnalyzer(api_key=api_key)
        print("✓ SatelliteImageAnalyzer initialized successfully")
    except Exception as e:
        print(f"❌ Failed to initialize analyzer: {e}")
        return False
    
    # Create a simple test image (1x1 red pixel as base64)
    # This is a tiny PNG image for testing
    test_base64 = "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8/5+hHgAHggJ/PchI7wAAAABJRU5ErkJggg=="
    
    print("\n" + "=" * 60)
    print("Testing Image Analysis with Test Image")
    print("=" * 60)
    
    try:
        result = analyzer.analyze_image(
            zone_id="test_zone_001",
            image_data=test_base64,
            image_type="base64"
        )
        
        print("✓ Analysis completed successfully!")
        print("\nResults:")
        print(f"  Zone ID: {result['zone_id']}")
        print(f"  Severity: {result['severity']}")
        print(f"  Confidence: {result['confidence_score']:.2f}")
        print(f"  Damage Summary: {result['damage_summary'][:100]}...")
        if result.get('affected_features'):
            print(f"  Affected Features: {', '.join(result['affected_features'][:3])}")
        print(f"  Vegetation Status: {result.get('vegetation_status', 'N/A')}")
        print(f"  Water Presence: {result.get('water_presence', 'N/A')}")
        
        return True
        
    except Exception as e:
        print(f"❌ Analysis failed: {e}")
        import traceback
        traceback.print_exc()
        return False


if __name__ == "__main__":
    print("\n🚀 Starting Gemini API Integration Test\n")
    
    success = test_gemini_connection()
    
    print("\n" + "=" * 60)
    if success:
        print("✅ ALL TESTS PASSED - Gemini integration is working!")
    else:
        print("❌ TESTS FAILED - Please check errors above")
    print("=" * 60)
    
    sys.exit(0 if success else 1)
