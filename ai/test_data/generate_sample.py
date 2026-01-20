"""
Generate Synthetic NDVI GeoTIFF Files for Testing
Creates realistic before/after flood scenario for Quang Tri region
"""

import numpy as np
import rasterio
from rasterio.transform import from_bounds
import os

# Quang Tri province bounds (approximate)
BOUNDS = (106.9, 16.5, 107.3, 16.9)  # (west, south, east, north)
IMAGE_SIZE = 512  # 512x512 pixels


def generate_ndvi_tif(filename: str, ndvi_values: np.ndarray, bounds: tuple):
    """
    Save numpy array as GeoTIFF
    
    Args:
        filename: Output path
        ndvi_values: 2D numpy array of NDVI values
        bounds: (west, south, east, north) coordinates
    """
    height, width = ndvi_values.shape
    
    # Calculate transform from bounds and array shape
    transform = from_bounds(
        bounds[0], bounds[1], bounds[2], bounds[3],
        width, height
    )
    
    # Create GeoTIFF
    with rasterio.open(
        filename,
        'w',
        driver='GTiff',
        height=height,
        width=width,
        count=1,
        dtype=rasterio.float32,
        crs='EPSG:4326',  # WGS84
        transform=transform,
    ) as dst:
        dst.write(ndvi_values.astype(rasterio.float32), 1)
    
    print(f"✅ Created: {filename}")
    print(f"   Shape: {ndvi_values.shape}")
    print(f"   NDVI range: [{ndvi_values.min():.3f}, {ndvi_values.max():.3f}]")
    print(f"   Mean NDVI: {ndvi_values.mean():.3f}")


def generate_test_data():
    """
    Create before/after NDVI pair for Quang Tri region
    Simulates flood damage scenario
    """
    print("🌍 Generating synthetic NDVI test data for Quang Tri region...")
    print("-" * 60)
    
    # Create output directory
    os.makedirs("test_data", exist_ok=True)
    
    # ===== BEFORE FLOOD (Healthy vegetation) =====
    print("\n📷 Generating pre-flood NDVI (healthy vegetation)...")
    
    # Create base array with healthy vegetation (0.65-0.85)
    np.random.seed(42)  # Reproducible
    before = np.random.uniform(0.65, 0.85, (IMAGE_SIZE, IMAGE_SIZE))
    
    # Add some water bodies (rivers, lakes): NDVI 0.1-0.2
    # Create 3 random water patches
    for i in range(3):
        x = np.random.randint(0, IMAGE_SIZE - 50)
        y = np.random.randint(0, IMAGE_SIZE - 50)
        size_x = np.random.randint(30, 60)
        size_y = np.random.randint(30, 60)
        before[y:y+size_y, x:x+size_x] = np.random.uniform(0.1, 0.2, (size_y, size_x))
    
    # Add some urban areas: NDVI 0.3-0.5
    for i in range(2):
        x = np.random.randint(0, IMAGE_SIZE - 40)
        y = np.random.randint(0, IMAGE_SIZE - 40)
        size = 40
        before[y:y+size, x:x+size] = np.random.uniform(0.3, 0.5, (size, size))
    
    # Save before image
    before_path = os.path.join("test_data", "quang_tri_before.tif")
    generate_ndvi_tif(before_path, before, BOUNDS)
    
    # ===== AFTER FLOOD (Damaged vegetation) =====
    print("\n💧 Generating post-flood NDVI (flood damage)...")
    
    # Start with "before" array
    after = before.copy()
    
    # Simulate flood damage in central region (40% of area)
    # Severely damaged crops: reduce NDVI by 0.3-0.5
    center_y = IMAGE_SIZE // 2
    center_x = IMAGE_SIZE // 2
    damage_radius = 150
    
    for y in range(max(0, center_y - damage_radius), min(IMAGE_SIZE, center_y + damage_radius)):
        for x in range(max(0, center_x - damage_radius), min(IMAGE_SIZE, center_x + damage_radius)):
            # Calculate distance from center
            dist = np.sqrt((y - center_y)**2 + (x - center_x)**2)
            
            if dist < damage_radius:
                # Damage intensity decreases with distance from center
                damage_factor = 1 - (dist / damage_radius)
                
                if damage_factor > 0.7:
                    # Severe damage (center): ΔNDVI ≈ -0.4
                    reduction = np.random.uniform(0.35, 0.50)
                elif damage_factor > 0.4:
                    # Moderate damage: ΔNDVI ≈ -0.15
                    reduction = np.random.uniform(0.12, 0.18)
                else:
                    # Minor damage: ΔNDVI ≈ -0.05
                    reduction = np.random.uniform(0.03, 0.08)
                
                after[y, x] = max(-1.0, after[y, x] - reduction)
    
    # Expand water bodies (flooding)
    # Add 5 new flooded areas
    for i in range(5):
        x = np.random.randint(0, IMAGE_SIZE - 70)
        y = np.random.randint(0, IMAGE_SIZE - 70)
        size_x = np.random.randint(40, 80)
        size_y = np.random.randint(40, 80)
        after[y:y+size_y, x:x+size_x] = np.random.uniform(0.0, 0.15, (size_y, size_x))
    
    # Save after image
    after_path = os.path.join("test_data", "quang_tri_after.tif")
    generate_ndvi_tif(after_path, after, BOUNDS)
    
    # ===== CALCULATE EXPECTED RESULTS =====
    print("\n📊 Expected Analysis Results:")
    print("-" * 60)
    
    delta = after - before
    
    severe_mask = delta <= -0.20
    moderate_mask = (delta > -0.20) & (delta < -0.10)
    minor_mask = delta >= -0.10
    
    PIXEL_AREA_HA = 0.01  # 10m × 10m
    severe_ha = np.sum(severe_mask) * PIXEL_AREA_HA
    moderate_ha = np.sum(moderate_mask) * PIXEL_AREA_HA
    minor_ha = np.sum(minor_mask) * PIXEL_AREA_HA
    
    total_area = delta.size * PIXEL_AREA_HA
    damage_score = (severe_ha * 1.0 + moderate_ha * 0.5) / total_area
    damage_score = min(damage_score, 1.0)
    
    if damage_score >= 0.6:
        severity = "high"
    elif damage_score >= 0.3:
        severity = "medium"
    else:
        severity = "low"
    
    print(f"Severe damage: {severe_ha:.2f} ha")
    print(f"Moderate damage: {moderate_ha:.2f} ha")
    print(f"Minor damage: {minor_ha:.2f} ha")
    print(f"Damage score: {damage_score:.3f}")
    print(f"Severity: {severity}")
    print(f"ΔNDVI mean: {delta.mean():.3f}")
    print(f"ΔNDVI min: {delta.min():.3f}")
    print(f"ΔNDVI max: {delta.max():.3f}")
    
    print("\n" + "=" * 60)
    print("✅ Test data generation complete!")
    print("=" * 60)
    print("\nTest these files with:")
    print('  python test_local.py')
    print('  uvicorn app.main:app --reload --port 8000')


if __name__ == "__main__":
    generate_test_data()
