"""
Fund Distribution API Route
Endpoint: POST /ai/distribute-funds

Receives region damage data and total fund amount, returns allocation breakdown.
"""

from fastapi import APIRouter, HTTPException, status
from app.models.schemas import (
    DistributeFundsRequest,
    DistributeFundsResponse,
    AllocationItem
)
from app.services.fund_allocator import distribute_funds
import logging

logger = logging.getLogger(__name__)
router = APIRouter(prefix="/ai", tags=["fund-distribution"])


@router.post(
    "/distribute-funds",
    response_model=DistributeFundsResponse,
    status_code=status.HTTP_200_OK,
    summary="Distribute recovery funds across damaged regions",
    description="""
    Allocates recovery funds proportionally based on damage severity and affected area.
    
    The algorithm:
    1. Calculates weighted damage: damage_score × damaged_area_ha
    2. Computes proportional allocation: (weighted / total_weighted) × total_fund
    3. Returns allocations sorted by amount (highest first)
    
    Ensures transparent, fair distribution based on actual damage metrics.
    """
)
async def distribute_funds_endpoint(
    request: DistributeFundsRequest
) -> DistributeFundsResponse:
    """
    Distribute funds across regions based on damage
    
    Args:
        request: Fund distribution request with regions and total amount
        
    Returns:
        Allocation breakdown by region
        
    Raises:
        HTTPException 400: Invalid input data
        HTTPException 500: Processing error
    """
    logger.info(
        f"Received fund distribution request: "
        f"total_fund={request.total_fund}, "
        f"regions={len(request.regions)}"
    )
    
    # Validate total_fund (Pydantic should handle, but double-check)
    if request.total_fund <= 0:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="total_fund must be greater than 0"
        )
    
    # Validate regions not empty (Pydantic should handle)
    if not request.regions:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="regions list cannot be empty"
        )
    
    try:
        # Convert Pydantic models to dicts for service
        regions_data = [
            {
                "region_id": region.region_id,
                "damage_score": region.damage_score,
                "damaged_area_ha": region.damaged_area_ha
            }
            for region in request.regions
        ]
        
        # Call fund allocator service
        allocations_data = distribute_funds(
            total_fund=request.total_fund,
            regions=regions_data
        )
        
        # Convert to Pydantic models
        allocations = [
            AllocationItem(**alloc)
            for alloc in allocations_data
        ]
        
        # Build response
        response = DistributeFundsResponse(allocations=allocations)
        
        logger.info(
            f"Distribution completed: {len(allocations)} allocations, "
            f"total: {sum(a.amount for a in allocations):.2f}"
        )
        
        return response
        
    except ValueError as e:
        # Invalid input data
        logger.error(f"Invalid data during fund distribution: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Invalid input data: {str(e)}"
        )
        
    except Exception as e:
        # Unexpected error
        logger.exception(f"Unexpected error during fund distribution: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Internal server error during fund distribution: {str(e)}"
        )
