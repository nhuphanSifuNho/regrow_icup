"""
Damage Assessment API Route
Endpoint: POST /ai/analyze-damage

Receives satellite image paths and returns damage assessment results.
"""

from fastapi import APIRouter, HTTPException, status
from app.models.schemas import AnalyzeDamageRequest, DamageAssessmentResponse
from app.services.ndvi_analyzer import analyze_damage
import logging
import os

logger = logging.getLogger(__name__)
router = APIRouter(prefix="/ai", tags=["damage-assessment"])


@router.post(
    "/analyze-damage",
    response_model=DamageAssessmentResponse,
    status_code=status.HTTP_200_OK,
    summary="Analyze flood damage from NDVI satellite imagery",
    description="""
    Analyzes pre-flood and post-flood NDVI satellite imagery to assess agricultural damage.
    
    The analysis:
    1. Loads GeoTIFF files containing NDVI data
    2. Calculates ΔNDVI (post - pre)
    3. Classifies damage by severity (severe, moderate, minor)
    4. Computes damage score (0-1) and affected area (hectares)
    
    Returns detailed damage assessment with breakdown by severity level.
    """
)
async def analyze_damage_endpoint(
    request: AnalyzeDamageRequest
) -> DamageAssessmentResponse:
    """
    Analyze damage from satellite imagery
    
    Args:
        request: Analysis request with image paths
        
    Returns:
        Detailed damage assessment
        
    Raises:
        HTTPException 400: Invalid file path or image format
        HTTPException 500: Processing error
    """
    logger.info(f"Received analysis request for region: {request.region_id}")
    
    # Validate file paths exist
    if not os.path.exists(request.ndvi_before_path):
        logger.error(f"Before image not found: {request.ndvi_before_path}")
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Before image not found: {request.ndvi_before_path}"
        )
    
    if not os.path.exists(request.ndvi_after_path):
        logger.error(f"After image not found: {request.ndvi_after_path}")
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"After image not found: {request.ndvi_after_path}"
        )
    
    try:
        # Call NDVI analyzer service
        result = analyze_damage(
            before_path=request.ndvi_before_path,
            after_path=request.ndvi_after_path,
            region_id=request.region_id
        )
        
        # Build response
        response = DamageAssessmentResponse(**result)
        
        logger.info(
            f"Analysis completed for {request.region_id}: "
            f"{response.severity} severity, "
            f"score: {response.damage_score:.2f}, "
            f"area: {response.damaged_area_ha:.2f}ha"
        )
        
        return response
        
    except FileNotFoundError as e:
        # File not found (shouldn't happen after validation, but just in case)
        logger.error(f"File not found during analysis: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e)
        )
        
    except ValueError as e:
        # Invalid data (e.g., shape mismatch, invalid format)
        logger.error(f"Invalid data during analysis: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Invalid image data: {str(e)}"
        )
        
    except Exception as e:
        # Unexpected error
        logger.exception(f"Unexpected error during analysis: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Internal server error during analysis: {str(e)}"
        )
