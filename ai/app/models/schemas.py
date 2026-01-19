"""
Pydantic Schemas for API Request/Response Validation
These are the contracts between AI service and backend

All fields must match exactly what backend expects.
"""

from pydantic import BaseModel, Field, field_validator
from typing import List, Literal


class AnalyzeDamageRequest(BaseModel):
    """Request schema for damage analysis endpoint"""
    region_id: str = Field(min_length=1, description="Unique identifier for the region")
    ndvi_before_path: str = Field(description="Path to pre-flood NDVI GeoTIFF file")
    ndvi_after_path: str = Field(description="Path to post-flood NDVI GeoTIFF file")
    
    model_config = {
        "json_schema_extra": {
            "examples": [{
                "region_id": "central_vietnam_01",
                "ndvi_before_path": "./test_data/quang_tri_before.tif",
                "ndvi_after_path": "./test_data/quang_tri_after.tif"
            }]
        }
    }


class DamageBreakdown(BaseModel):
    """Breakdown of damage by severity level"""
    severe_ha: float = Field(ge=0, description="Severely damaged area in hectares")
    moderate_ha: float = Field(ge=0, description="Moderately damaged area in hectares")
    minor_ha: float = Field(ge=0, description="Minor damaged area in hectares")


class DamageAssessmentResponse(BaseModel):
    """Response schema for damage analysis"""
    region_id: str = Field(description="Region identifier")
    damage_score: float = Field(ge=0, le=1, description="Overall damage score (0-1)")
    damaged_area_ha: float = Field(ge=0, description="Total damaged area in hectares")
    severity: Literal["high", "medium", "low"] = Field(description="Damage severity classification")
    breakdown: DamageBreakdown = Field(description="Detailed breakdown by severity")
    
    @field_validator('severity', mode='before')
    @classmethod
    def calculate_severity(cls, v, info):
        """Auto-calculate severity from damage_score if not provided"""
        if v is not None:
            return v
        
        # Access damage_score from validation data
        damage_score = info.data.get('damage_score', 0)
        
        if damage_score >= 0.6:
            return "high"
        elif damage_score >= 0.3:
            return "medium"
        else:
            return "low"
    
    model_config = {
        "json_schema_extra": {
            "examples": [{
                "region_id": "central_vietnam_01",
                "damage_score": 0.67,
                "damaged_area_ha": 124.5,
                "severity": "high",
                "breakdown": {
                    "severe_ha": 80.0,
                    "moderate_ha": 44.5,
                    "minor_ha": 0.0
                }
            }]
        }
    }


class RegionInput(BaseModel):
    """Input schema for a single region in fund distribution"""
    region_id: str = Field(description="Unique identifier for the region")
    damage_score: float = Field(ge=0, le=1, description="Damage score from assessment")
    damaged_area_ha: float = Field(ge=0, description="Damaged area in hectares")


class DistributeFundsRequest(BaseModel):
    """Request schema for fund distribution endpoint"""
    total_fund: float = Field(gt=0, description="Total amount of funds to distribute")
    regions: List[RegionInput] = Field(min_length=1, description="List of regions to distribute funds to")
    
    model_config = {
        "json_schema_extra": {
            "examples": [{
                "total_fund": 100000,
                "regions": [
                    {
                        "region_id": "central_vietnam_01",
                        "damage_score": 0.67,
                        "damaged_area_ha": 124.5
                    },
                    {
                        "region_id": "central_vietnam_02",
                        "damage_score": 0.32,
                        "damaged_area_ha": 80.0
                    }
                ]
            }]
        }
    }


class AllocationItem(BaseModel):
    """Single allocation item in fund distribution response"""
    region_id: str = Field(description="Region identifier")
    amount: float = Field(ge=0, description="Allocated amount")
    percentage: float = Field(ge=0, le=100, description="Percentage of total fund")


class DistributeFundsResponse(BaseModel):
    """Response schema for fund distribution"""
    allocations: List[AllocationItem] = Field(description="List of fund allocations by region")
    
    @field_validator('allocations')
    @classmethod
    def validate_allocations(cls, v, info):
        """Ensure allocations are valid"""
        if not v:
            return v
        
        # Validate percentages sum to approximately 100
        total_percentage = sum(alloc.percentage for alloc in v)
        if abs(total_percentage - 100.0) > 0.1:  # Allow 0.1% tolerance for rounding
            raise ValueError(f"Allocation percentages must sum to 100%, got {total_percentage}%")
        
        return v
    
    model_config = {
        "json_schema_extra": {
            "examples": [{
                "allocations": [
                    {
                        "region_id": "central_vietnam_01",
                        "amount": 61000.00,
                        "percentage": 61.0
                    },
                    {
                        "region_id": "central_vietnam_02",
                        "amount": 39000.00,
                        "percentage": 39.0
                    }
                ]
            }]
        }
    }
