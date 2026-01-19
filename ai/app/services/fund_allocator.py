"""
Fund Distribution Service
Rule-based AI for transparent fund allocation

Algorithm:
weighted_damage = damage_score × damaged_area_ha
allocation = (weighted_damage / sum_of_all_weighted) × total_fund

Example:
Region A: damage=0.8, area=100ha → weighted=80
Region B: damage=0.5, area=50ha → weighted=25
Total weighted = 105

If total_fund = 100,000:
Region A gets: (80/105) × 100,000 = 76,190
Region B gets: (25/105) × 100,000 = 23,810
"""

from typing import List, Dict
import logging

logger = logging.getLogger(__name__)


class FundAllocator:
    """Handles fund distribution across damaged regions"""
    
    def calculate_weighted_damage(self, damage_score: float, area_ha: float) -> float:
        """
        Calculate damage weight for allocation
        
        Args:
            damage_score: Damage score (0-1)
            area_ha: Damaged area in hectares
            
        Returns:
            Weighted damage value
            
        Raises:
            ValueError: If inputs are negative
        """
        if damage_score < 0 or area_ha < 0:
            raise ValueError("damage_score and area_ha must be >= 0")
        
        return damage_score * area_ha
    
    def distribute(self, total_fund: float, regions: List[Dict]) -> List[Dict]:
        """
        Allocate funds proportionally to damage
        
        Args:
            total_fund: Total amount to distribute
            regions: List of {region_id, damage_score, damaged_area_ha}
            
        Returns:
            List of {region_id, amount, percentage} allocations
            
        Raises:
            ValueError: If inputs are invalid
        """
        # Validate inputs
        if total_fund <= 0:
            raise ValueError("total_fund must be > 0")
        
        if not regions:
            raise ValueError("regions list cannot be empty")
        
        # Calculate weighted damage for each region
        weighted_damages = []
        for region in regions:
            weighted = self.calculate_weighted_damage(
                region["damage_score"],
                region["damaged_area_ha"]
            )
            weighted_damages.append({
                "region_id": region["region_id"],
                "weighted_damage": weighted
            })
        
        # Calculate total weighted damage
        total_weighted = sum(item["weighted_damage"] for item in weighted_damages)
        
        # Handle edge case: no damage
        if total_weighted == 0:
            logger.warning("Total weighted damage is 0, returning empty allocations")
            return []
        
        logger.info(f"Total weighted damage: {total_weighted:.2f}")
        
        # Calculate allocations
        allocations = []
        for item in weighted_damages:
            # Calculate proportional amount
            amount = (item["weighted_damage"] / total_weighted) * total_fund
            percentage = (amount / total_fund) * 100
            
            # Round to 2 decimal places
            amount = round(amount, 2)
            percentage = round(percentage, 2)
            
            allocations.append({
                "region_id": item["region_id"],
                "amount": amount,
                "percentage": percentage
            })
            
            logger.info(
                f"Allocated {amount:.2f} ({percentage:.2f}%) to {item['region_id']}"
            )
        
        # Verify sum of amounts equals total_fund (handle rounding errors)
        total_allocated = sum(alloc["amount"] for alloc in allocations)
        difference = total_fund - total_allocated
        
        # If there's a rounding difference, adjust the largest allocation
        if abs(difference) > 0.01:
            # Find allocation with largest amount
            largest = max(allocations, key=lambda x: x["amount"])
            largest["amount"] = round(largest["amount"] + difference, 2)
            largest["percentage"] = round((largest["amount"] / total_fund) * 100, 2)
            
            logger.info(
                f"Adjusted {largest['region_id']} by {difference:.2f} "
                f"to match total_fund"
            )
        
        # Sort by amount (highest first)
        allocations.sort(key=lambda x: x["amount"], reverse=True)
        
        return allocations


def distribute_funds(total_fund: float, regions: List[Dict]) -> List[Dict]:
    """
    Module-level convenience function for fund distribution
    
    Args:
        total_fund: Total amount to distribute
        regions: List of region dictionaries with damage data
        
    Returns:
        List of allocation dictionaries
    """
    allocator = FundAllocator()
    return allocator.distribute(total_fund, regions)
