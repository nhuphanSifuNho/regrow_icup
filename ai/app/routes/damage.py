"""
Damage Assessment API Routes
Endpoints:
- POST /ai/analyze-damage: NDVI-based damage analysis
- POST /ai/analyze-satellite-image: Gemini AI visual image analysis

Receives satellite image data and returns damage assessment results.
"""

from fastapi import APIRouter, HTTPException, status
from app.models.schemas import (
    AnalyzeDamageRequest, 
    DamageAssessmentResponse,
    SatelliteImageRequest,
    SatelliteImageAnalysis
)
from app.services.ndvi_analyzer import analyze_damage
from app.services.satellite_image_analyzer import SatelliteImageAnalyzer
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


@router.post(
    "/analyze-satellite-image",
    response_model=SatelliteImageAnalysis,
    status_code=status.HTTP_200_OK,
    summary="Analyze satellite image using Google Gemini AI",
    description="""
    Analyzes satellite images (RGB/visual) using Google Gemini Vision API to assess flood damage,
    vegetation health, and infrastructure impact.
    
    The analysis:
    1. Accepts images as base64, URL, or file path
    2. Uses Gemini 1.5 Flash model for visual analysis
    3. Identifies damage patterns, flooded areas, vegetation status
    4. Provides confidence scores and actionable recommendations
    
    Supports multiple image input formats:
    - base64: Base64-encoded image string
    - url: HTTP/HTTPS URL to image
    - file: Local file path (server-side only)
    
    Returns structured analysis with severity classification and detailed findings.
    """
)
async def analyze_satellite_image_endpoint(
    request: SatelliteImageRequest
) -> SatelliteImageAnalysis:
    """
    Analyze satellite image using Gemini AI
    
    Args:
        request: Analysis request with image data and type
        
    Returns:
        Detailed AI-powered damage assessment
        
    Raises:
        HTTPException 400: Invalid image data or format
        HTTPException 500: Processing error or API failure
    """
    logger.info(f"Received Gemini analysis request for zone: {request.zone_id}")
    
    try:
        # Initialize analyzer (lazy initialization with API key from env)
        analyzer = SatelliteImageAnalyzer()
        
        # Perform analysis
        result = analyzer.analyze_image(
            zone_id=request.zone_id,
            image_data=request.image_data,
            image_type=request.image_type
        )
        
        # Build response
        response = SatelliteImageAnalysis(**result)
        
        logger.info(
            f"Gemini analysis completed for {request.zone_id}: "
            f"{response.severity} severity, "
            f"confidence: {response.confidence_score:.2f}"
        )
        
        return response
        
    except ValueError as e:
        # Invalid data (image format, API key, etc.)
        logger.error(f"Invalid data during Gemini analysis: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Invalid image data or configuration: {str(e)}"
        )
        
    except Exception as e:
        # Unexpected error (API failure, network issues, etc.)
        logger.exception(f"Unexpected error during Gemini analysis: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Internal server error during analysis: {str(e)}"
        )
