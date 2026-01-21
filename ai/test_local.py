"""
Local Testing Script (Before Starting Server)
Tests core logic without HTTP layer
"""

import sys
import os

# Add parent directory to path for imports
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from app.services.ndvi_analyzer import NDVIAnalyzer
from app.services.fund_allocator import FundAllocator


def test_ndvi_analyzer():
    """Test NDVI analyzer with generated test data"""
    print("🧪 Testing NDVI Analyzer...")
    print("-" * 60)
    
    analyzer = NDVIAnalyzer()
    
    # Paths to test data
    before_path = "test_data/quang_tri_before.tif"
    after_path = "test_data/quang_tri_after.tif"
    
    # Check files exist
    if not os.path.exists(before_path):
        print(f"❌ Test file not found: {before_path}")
        print("Run: python test_data/generate_sample.py")
        return False
    
    if not os.path.exists(after_path):
        print(f"❌ Test file not found: {after_path}")
        print("Run: python test_data/generate_sample.py")
        return False
    
    try:
        # Run analysis
        result = analyzer.analyze(
            before_path=before_path,
            after_path=after_path,
            region_id="test_quang_tri"
        )
        
        print("\n✅ Analysis completed successfully!")
        print(f"   Region: {result['region_id']}")
        print(f"   Damage Score: {result['damage_score']:.3f}")
        print(f"   Severity: {result['severity']}")
        print(f"   Damaged Area: {result['damaged_area_ha']:.2f} ha")
        print(f"   Breakdown:")
        print(f"     - Severe: {result['breakdown']['severe_ha']:.2f} ha")
        print(f"     - Moderate: {result['breakdown']['moderate_ha']:.2f} ha")
        print(f"     - Minor: {result['breakdown']['minor_ha']:.2f} ha")
        
        # Assertions
        assert 0 <= result['damage_score'] <= 1, "Damage score must be 0-1"
        assert result['severity'] in ['high', 'medium', 'low'], "Invalid severity"
        assert result['damaged_area_ha'] >= 0, "Damaged area must be >= 0"
        
        print("\n✅ All assertions passed!")
        return True
        
    except Exception as e:
        print(f"\n❌ Test failed: {str(e)}")
        import traceback
        traceback.print_exc()
        return False


def test_fund_allocator():
    """Test fund allocator with sample data"""
    print("\n🧪 Testing Fund Allocator...")
    print("-" * 60)
    
    allocator = FundAllocator()
    
    # Sample regions
    regions = [
        {
            "region_id": "central_vietnam_01",
            "damage_score": 0.8,
            "damaged_area_ha": 100.0
        },
        {
            "region_id": "central_vietnam_02",
            "damage_score": 0.5,
            "damaged_area_ha": 50.0
        },
        {
            "region_id": "central_vietnam_03",
            "damage_score": 0.3,
            "damaged_area_ha": 30.0
        }
    ]
    
    total_fund = 100000.0
    
    try:
        # Run distribution
        allocations = allocator.distribute(
            total_fund=total_fund,
            regions=regions
        )
        
        print("\n✅ Distribution completed successfully!")
        print(f"   Total Fund: {total_fund:,.2f} VND")
        print(f"   Regions: {len(regions)}")
        print("\n   Allocations:")
        
        for alloc in allocations:
            print(f"     {alloc['region_id']}: "
                  f"{alloc['amount']:,.2f} VND ({alloc['percentage']:.2f}%)")
        
        # Assertions
        total_allocated = sum(a['amount'] for a in allocations)
        total_percentage = sum(a['percentage'] for a in allocations)
        
        assert abs(total_allocated - total_fund) < 0.01, \
            f"Total allocated ({total_allocated}) != total fund ({total_fund})"
        
        assert abs(total_percentage - 100.0) < 0.1, \
            f"Total percentage ({total_percentage}) != 100%"
        
        assert allocations[0]['amount'] > allocations[1]['amount'], \
            "Highest damage region should get most funds"
        
        assert len(allocations) == len(regions), \
            "Should have allocation for each region"
        
        print("\n✅ All assertions passed!")
        print(f"   Total allocated: {total_allocated:,.2f} VND")
        print(f"   Total percentage: {total_percentage:.2f}%")
        return True
        
    except Exception as e:
        print(f"\n❌ Test failed: {str(e)}")
        import traceback
        traceback.print_exc()
        return False


def main():
    """Run all tests"""
    print("\n" + "=" * 60)
    print("🚀 REGROW AI Service - Local Tests")
    print("=" * 60)
    
    results = []
    
    # Test 1: NDVI Analyzer
    results.append(("NDVI Analyzer", test_ndvi_analyzer()))
    
    # Test 2: Fund Allocator
    results.append(("Fund Allocator", test_fund_allocator()))
    
    # Summary
    print("\n" + "=" * 60)
    print("📊 Test Summary")
    print("=" * 60)
    
    for test_name, passed in results:
        status = "✅ PASSED" if passed else "❌ FAILED"
        print(f"{status} - {test_name}")
    
    all_passed = all(r[1] for r in results)
    
    if all_passed:
        print("\n🎉 All tests passed!")
        print("\nNext steps:")
        print("1. Start server: uvicorn app.main:app --reload --port 8000")
        print("2. Test API: pytest tests/test_api.py -v")
        print("3. View docs: http://localhost:8000/docs")
        return 0
    else:
        print("\n⚠️  Some tests failed. Please fix issues before proceeding.")
        return 1


if __name__ == "__main__":
    sys.exit(main())
