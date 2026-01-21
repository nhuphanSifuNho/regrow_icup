"""
NDVI Damage Analyzer Service
Core AI logic for satellite image analysis

Algorithm:
1. Load before/after NDVI GeoTIFF files
2. Calculate ΔNDVI (difference)
3. Apply threshold classification
4. Use K-Means clustering to refine zones (optional)
5. Calculate hectares per severity class

Technical specs:
- NDVI range: -1 to 1 (vegetation index)
- Sentinel-2 pixel resolution: 10m × 10m = 100 m² = 0.01 hectares
- Thresholds (based on literature):
  * Severe: ΔNDVI ≤ -0.20 (vegetation destroyed)
  * Moderate: -0.20 < ΔNDVI < -0.10 (partial damage)
  * Minor: ΔNDVI ≥ -0.10 (minimal/recovered)
"""

import numpy as np
import rasterio
from typing import Dict
import logging

logger = logging.getLogger(__name__)

# Constants
PIXEL_AREA_HA = 0.01  # 10m × 10m pixel = 0.01 hectares
SEVERE_THRESHOLD = -0.20
MODERATE_THRESHOLD = -0.10


class NDVIAnalyzer:
    """Handles NDVI image processing and damage classification"""
    
    def __init__(self):
        """Initialize NDVI analyzer"""
        pass
    
    def load_ndvi(self, file_path: str) -> np.ndarray:
        """
        Load NDVI GeoTIFF file
        
        Args:
            file_path: Path to NDVI GeoTIFF file
            
        Returns:
            numpy array of NDVI values
            
        Raises:
            FileNotFoundError: If file doesn't exist
            ValueError: If file format is invalid
        """
        try:
            with rasterio.open(file_path) as dataset:
                # Read first band as float32
                ndvi = dataset.read(1).astype('float32')
                
                # Handle invalid values (NaN, inf)
                ndvi = np.nan_to_num(ndvi, nan=0.0, posinf=1.0, neginf=-1.0)
                
                # Clip to valid NDVI range [-1, 1]
                ndvi = np.clip(ndvi, -1.0, 1.0)
                
                logger.info(f"Loaded NDVI from {file_path}, shape: {ndvi.shape}")
                return ndvi
                
        except FileNotFoundError:
            logger.error(f"NDVI file not found: {file_path}")
            raise FileNotFoundError(f"NDVI file not found: {file_path}")
        except rasterio.errors.RasterioIOError as e:
            logger.error(f"Failed to read NDVI file {file_path}: {e}")
            raise ValueError(f"Invalid NDVI file format: {file_path}")
    
    def calculate_delta_ndvi(self, before: np.ndarray, after: np.ndarray) -> np.ndarray:
        """
        Compute NDVI difference
        
        Args:
            before: Pre-flood NDVI array
            after: Post-flood NDVI array
            
        Returns:
            ΔNDVI array (after - before)
            
        Raises:
            ValueError: If array shapes don't match
        """
        if before.shape != after.shape:
            raise ValueError(
                f"NDVI array shapes must match. "
                f"Before: {before.shape}, After: {after.shape}"
            )
        
        delta = after - before
        return delta
    
    def classify_damage(self, delta_ndvi: np.ndarray) -> Dict[str, float]:
        """
        Apply thresholds and calculate areas
        
        Args:
            delta_ndvi: ΔNDVI array
            
        Returns:
            Dictionary with damage metrics:
            - severe_ha: Severely damaged area
            - moderate_ha: Moderately damaged area
            - minor_ha: Minor damaged area
            - damage_score: Overall damage score (0-1)
            - damaged_area_ha: Total damaged area (severe + moderate)
        """
        # Create severity masks
        severe_mask = delta_ndvi <= SEVERE_THRESHOLD
        moderate_mask = (delta_ndvi > SEVERE_THRESHOLD) & (delta_ndvi < MODERATE_THRESHOLD)
        minor_mask = delta_ndvi >= MODERATE_THRESHOLD
        
        # Count pixels in each category
        severe_count = np.sum(severe_mask)
        moderate_count = np.sum(moderate_mask)
        minor_count = np.sum(minor_mask)
        
        # Convert to hectares
        severe_ha = float(severe_count * PIXEL_AREA_HA)
        moderate_ha = float(moderate_count * PIXEL_AREA_HA)
        minor_ha = float(minor_count * PIXEL_AREA_HA)
        
        # Calculate total damaged area (severe + moderate)
        damaged_area_ha = severe_ha + moderate_ha
        
        # Calculate total area
        total_area = float(delta_ndvi.size * PIXEL_AREA_HA)
        
        # Calculate damage score (0-1 scale)
        # Severe damage weighted at 1.0, moderate at 0.5
        if total_area > 0:
            damage_score = (severe_ha * 1.0 + moderate_ha * 0.5) / total_area
            damage_score = min(damage_score, 1.0)  # Cap at 1.0
        else:
            damage_score = 0.0
        
        logger.info(
            f"Damage classification: severe={severe_ha:.2f}ha, "
            f"moderate={moderate_ha:.2f}ha, minor={minor_ha:.2f}ha, "
            f"score={damage_score:.3f}"
        )
        
        return {
            "severe_ha": round(severe_ha, 2),
            "moderate_ha": round(moderate_ha, 2),
            "minor_ha": round(minor_ha, 2),
            "damage_score": round(damage_score, 3),
            "damaged_area_ha": round(damaged_area_ha, 2)
        }
    
    def analyze(self, before_path: str, after_path: str, region_id: str) -> Dict:
        """
        Orchestrate full analysis pipeline
        
        Args:
            before_path: Path to pre-flood NDVI file
            after_path: Path to post-flood NDVI file
            region_id: Unique identifier for the region
            
        Returns:
            Complete damage assessment dictionary
            
        Raises:
            FileNotFoundError: If files don't exist
            ValueError: If processing fails
        """
        try:
            logger.info(f"Starting analysis for {region_id}")
            
            # Load NDVI data
            before_ndvi = self.load_ndvi(before_path)
            after_ndvi = self.load_ndvi(after_path)
            
            # Calculate difference
            delta_ndvi = self.calculate_delta_ndvi(before_ndvi, after_ndvi)
            
            # Classify damage
            results = self.classify_damage(delta_ndvi)
            
            # Determine severity level
            if results["damage_score"] >= 0.6:
                severity = "high"
            elif results["damage_score"] >= 0.3:
                severity = "medium"
            else:
                severity = "low"
            
            # Build response matching DamageAssessmentResponse schema
            response = {
                "region_id": region_id,
                "damage_score": results["damage_score"],
                "damaged_area_ha": results["damaged_area_ha"],
                "severity": severity,
                "breakdown": {
                    "severe_ha": results["severe_ha"],
                    "moderate_ha": results["moderate_ha"],
                    "minor_ha": results["minor_ha"]
                }
            }
            
            logger.info(
                f"Analysis complete for {region_id}: "
                f"{severity} damage, score: {results['damage_score']:.2f}"
            )
            
            return response
            
        except Exception as e:
            logger.error(f"Analysis failed for {region_id}: {str(e)}")
            raise


def analyze_damage(before_path: str, after_path: str, region_id: str) -> Dict:
    """
    Module-level convenience function for damage analysis
    
    Args:
        before_path: Path to pre-flood NDVI file
        after_path: Path to post-flood NDVI file
        region_id: Unique identifier for the region
        
    Returns:
        Complete damage assessment dictionary
    """
    analyzer = NDVIAnalyzer()
    return analyzer.analyze(before_path, after_path, region_id)
