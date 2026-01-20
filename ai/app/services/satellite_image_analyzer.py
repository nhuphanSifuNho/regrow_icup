"""
Satellite Image Analyzer Service using Google Gemini Vision API

This service analyzes satellite images to assess flood damage, vegetation health,
and infrastructure impact using Google's Gemini multimodal AI model.
"""

import os
import base64
import logging
from typing import Dict, Any, List
from pathlib import Path
import google.generativeai as genai
from PIL import Image
import io
import httpx

logger = logging.getLogger(__name__)


class SatelliteImageAnalyzer:
    """
    Analyzes satellite images using Google Gemini Vision API
    
    Supports multiple image input formats:
    - Base64 encoded strings
    - URLs (http/https)
    - Local file paths
    """
    
    def __init__(self, api_key: str = None):
        """
        Initialize the Gemini client
        
        Args:
            api_key: Google Gemini API key (defaults to GOOGLE_GEMINI_API_KEY env var)
        """
        self.api_key = api_key or os.getenv("GOOGLE_GEMINI_API_KEY")
        
        if not self.api_key:
            raise ValueError(
                "Google Gemini API key is required. "
                "Set GOOGLE_GEMINI_API_KEY environment variable or pass api_key parameter."
            )
        
        # Configure Gemini API
        genai.configure(api_key=self.api_key)
        
        # Use gemini-2.5-flash - stable multimodal model with image support
        # Fast and cost-effective for satellite image analysis
        self.model = genai.GenerativeModel('gemini-2.5-flash')
        
        logger.info("SatelliteImageAnalyzer initialized with Gemini 2.5 Flash model")
    
    def _load_image_from_base64(self, base64_string: str) -> Image.Image:
        """Load image from base64 encoded string"""
        try:
            # Remove data URL prefix if present (e.g., "data:image/jpeg;base64,")
            if ',' in base64_string:
                base64_string = base64_string.split(',', 1)[1]
            
            image_data = base64.b64decode(base64_string)
            image = Image.open(io.BytesIO(image_data))
            logger.info(f"Loaded image from base64: {image.size} px, mode={image.mode}")
            return image
        except Exception as e:
            logger.error(f"Failed to load image from base64: {str(e)}")
            raise ValueError(f"Invalid base64 image data: {str(e)}")
    
    def _load_image_from_url(self, url: str) -> Image.Image:
        """Load image from URL"""
        try:
            response = httpx.get(url, timeout=30.0)
            response.raise_for_status()
            
            image = Image.open(io.BytesIO(response.content))
            logger.info(f"Loaded image from URL: {url}, size={image.size} px")
            return image
        except Exception as e:
            logger.error(f"Failed to load image from URL {url}: {str(e)}")
            raise ValueError(f"Failed to download image from URL: {str(e)}")
    
    def _load_image_from_file(self, file_path: str) -> Image.Image:
        """Load image from local file path"""
        try:
            path = Path(file_path)
            if not path.exists():
                raise FileNotFoundError(f"Image file not found: {file_path}")
            
            image = Image.open(path)
            logger.info(f"Loaded image from file: {file_path}, size={image.size} px")
            return image
        except Exception as e:
            logger.error(f"Failed to load image from file {file_path}: {str(e)}")
            raise ValueError(f"Failed to load image file: {str(e)}")
    
    def _prepare_image(self, image_data: str, image_type: str) -> Image.Image:
        """
        Prepare image based on input type
        
        Args:
            image_data: Image data (base64, URL, or file path)
            image_type: Type of image data ("base64", "url", or "file")
        
        Returns:
            PIL Image object
        """
        if image_type == "base64":
            return self._load_image_from_base64(image_data)
        elif image_type == "url":
            return self._load_image_from_url(image_data)
        elif image_type == "file":
            return self._load_image_from_file(image_data)
        else:
            raise ValueError(f"Unsupported image_type: {image_type}")
    
    def _create_analysis_prompt(self) -> str:
        """
        Create structured prompt for Gemini to analyze satellite images
        
        Returns:
            Formatted prompt string requesting specific analysis outputs
        """
        prompt = """
Analyze this satellite image for flood damage and environmental impact. 
You are analyzing agricultural areas in Vietnam that have been affected by flooding.

Please provide a comprehensive analysis with the following information:

1. **Damage Summary**: Brief description of visible damage (2-3 sentences)

2. **Severity Assessment**: Classify overall damage as "high", "medium", or "low"
   - High: Extensive flooding, widespread vegetation loss, major infrastructure damage
   - Medium: Moderate flooding, partial vegetation damage, some infrastructure impact
   - Low: Minor flooding, limited vegetation stress, minimal infrastructure impact

3. **Confidence Score**: Your confidence in this assessment (0.0 to 1.0)

4. **Affected Features**: List of visible affected features (e.g., flooded_fields, damaged_crops, submerged_roads, eroded_soil, standing_water)

5. **Vegetation Status**: Description of vegetation health (healthy, stressed, severely_damaged, destroyed)

6. **Water Presence**: Description of water coverage (none, minimal, moderate, extensive, severe_flooding)

7. **Recommendations**: List of 2-4 actionable recommendations for recovery

Please structure your response in this exact JSON format:
{
  "damage_summary": "Brief description here",
  "severity": "high|medium|low",
  "confidence_score": 0.0-1.0,
  "affected_features": ["feature1", "feature2"],
  "vegetation_status": "description",
  "water_presence": "description",
  "recommendations": ["recommendation1", "recommendation2"]
}
"""
        return prompt.strip()
    
    def _parse_gemini_response(self, response_text: str) -> Dict[str, Any]:
        """
        Parse Gemini's response and extract structured data
        
        Args:
            response_text: Raw text response from Gemini
        
        Returns:
            Parsed dictionary with analysis results
        """
        import json
        import re
        
        try:
            # Try to extract JSON from response
            # Look for content between first { and last }
            json_match = re.search(r'\{.*\}', response_text, re.DOTALL)
            
            if json_match:
                json_str = json_match.group(0)
                parsed_data = json.loads(json_str)
                logger.info("Successfully parsed JSON from Gemini response")
                return parsed_data
            else:
                logger.warning("No JSON found in Gemini response, using fallback parsing")
                # Fallback: create structured response from unstructured text
                return self._fallback_parse(response_text)
                
        except json.JSONDecodeError as e:
            logger.warning(f"JSON parsing failed: {str(e)}, using fallback parsing")
            return self._fallback_parse(response_text)
    
    def _fallback_parse(self, response_text: str) -> Dict[str, Any]:
        """
        Fallback parser when JSON extraction fails
        
        Creates a best-effort structured response from unstructured text
        """
        # Default structure
        result = {
            "damage_summary": response_text[:300] + "..." if len(response_text) > 300 else response_text,
            "severity": "medium",  # Default to medium if unclear
            "confidence_score": 0.5,  # Low confidence for fallback
            "affected_features": ["unknown"],
            "vegetation_status": "unknown",
            "water_presence": "unknown",
            "recommendations": ["Conduct detailed ground survey", "Monitor recovery progress"]
        }
        
        # Try to extract severity from keywords
        text_lower = response_text.lower()
        if any(word in text_lower for word in ["severe", "extensive", "major", "critical", "high"]):
            result["severity"] = "high"
            result["confidence_score"] = 0.6
        elif any(word in text_lower for word in ["minor", "limited", "slight", "low"]):
            result["severity"] = "low"
            result["confidence_score"] = 0.6
        
        logger.info("Used fallback parser for Gemini response")
        return result
    
    def analyze_image(
        self,
        zone_id: str,
        image_data: str,
        image_type: str = "base64"
    ) -> Dict[str, Any]:
        """
        Analyze satellite image for flood damage assessment
        
        Args:
            zone_id: Unique identifier for the zone/region
            image_data: Image data (base64 string, URL, or file path)
            image_type: Type of image data ("base64", "url", or "file")
        
        Returns:
            Dictionary containing analysis results:
            - zone_id: Original zone identifier
            - damage_summary: Text description of damage
            - severity: Damage level (high/medium/low)
            - confidence_score: AI confidence (0.0-1.0)
            - affected_features: List of damaged features
            - vegetation_status: Vegetation health description
            - water_presence: Water coverage description
            - recommendations: List of recovery recommendations
        
        Raises:
            ValueError: If image data is invalid or analysis fails
        """
        logger.info(f"Starting analysis for zone_id={zone_id}, image_type={image_type}")
        
        try:
            # Load and prepare image
            image = self._prepare_image(image_data, image_type)
            
            # Create analysis prompt
            prompt = self._create_analysis_prompt()
            
            # Call Gemini API
            logger.info("Sending request to Gemini API...")
            response = self.model.generate_content([prompt, image])
            
            # Extract response text
            if not response.text:
                raise ValueError("Gemini returned empty response")
            
            logger.info(f"Received response from Gemini ({len(response.text)} chars)")
            
            # Parse response
            analysis_result = self._parse_gemini_response(response.text)
            
            # Add zone_id to result
            analysis_result["zone_id"] = zone_id
            
            # Validate required fields
            required_fields = ["damage_summary", "severity", "confidence_score"]
            missing_fields = [f for f in required_fields if f not in analysis_result]
            if missing_fields:
                logger.warning(f"Missing required fields: {missing_fields}, using defaults")
                if "damage_summary" not in analysis_result:
                    analysis_result["damage_summary"] = "Analysis completed"
                if "severity" not in analysis_result:
                    analysis_result["severity"] = "medium"
                if "confidence_score" not in analysis_result:
                    analysis_result["confidence_score"] = 0.5
            
            logger.info(
                f"Analysis complete for zone_id={zone_id}: "
                f"severity={analysis_result['severity']}, "
                f"confidence={analysis_result['confidence_score']:.2f}"
            )
            
            return analysis_result
            
        except Exception as e:
            logger.error(f"Analysis failed for zone_id={zone_id}: {str(e)}")
            raise ValueError(f"Image analysis failed: {str(e)}")
