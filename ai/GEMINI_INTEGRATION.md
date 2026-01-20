# Satellite Image Analysis with Google Gemini AI

## Overview

This feature adds AI-powered satellite image analysis using Google Gemini 2.5 Flash multimodal model to assess flood damage, vegetation health, and infrastructure impact from visual satellite imagery.

## What Was Implemented

### 1. New Dependencies
- **google-generativeai**: Official Google Gemini API client
- **pillow**: Image processing library

### 2. New Service: `SatelliteImageAnalyzer`
Location: [`ai/app/services/satellite_image_analyzer.py`](ai/app/services/satellite_image_analyzer.py)

**Features:**
- Supports multiple image input formats (base64, URL, file path)
- Uses Gemini 2.5 Flash model for fast multimodal analysis
- Structured prompt engineering for consistent JSON responses
- Robust error handling and fallback parsing
- Comprehensive logging

### 3. New Schemas
Location: [`ai/app/models/schemas.py`](ai/app/models/schemas.py)

**`SatelliteImageRequest`:**
```python
{
  "zone_id": "quang_tri_zone_01",
  "image_data": "base64_string OR url OR file_path",
  "image_type": "base64" | "url" | "file"
}
```

**`SatelliteImageAnalysis` (Response):**
```python
{
  "zone_id": "quang_tri_zone_01",
  "damage_summary": "Brief description...",
  "severity": "high" | "medium" | "low",
  "confidence_score": 0.85,
  "affected_features": ["flooded_fields", "damaged_crops", ...],
  "vegetation_status": "severely_damaged",
  "water_presence": "extensive",
  "recommendations": ["Action 1", "Action 2", ...]
}
```

### 4. New API Endpoint
**Endpoint:** `POST /ai/analyze-satellite-image`

Location: [`ai/app/routes/damage.py`](ai/app/routes/damage.py)

**Request Example:**
```bash
curl -X POST "http://localhost:8000/ai/analyze-satellite-image" \
  -H "Content-Type: application/json" \
  -d '{
    "zone_id": "test_zone_01",
    "image_data": "<base64_encoded_image>",
    "image_type": "base64"
  }'
```

## Configuration

### Environment Variables
Location: [`ai/.env`](ai/.env)

```env
# Google Gemini API Configuration
# Project: ReGrow
# Project Name: projects/818420499011
# Project Number: 818420499011
GOOGLE_GEMINI_API_KEY=AIzaSyCblluK23cd4VxCnEioZAu-_KCPL4DYIxo
```

## Testing

### Test Script
Run the integration test:
```bash
python ai/test_gemini.py
```

Expected output:
```
✅ ALL TESTS PASSED - Gemini integration is working!
```

## Usage Examples

### Example 1: Base64 Image Analysis
```python
from app.services.satellite_image_analyzer import SatelliteImageAnalyzer

analyzer = SatelliteImageAnalyzer()
result = analyzer.analyze_image(
    zone_id="quang_tri_01",
    image_data="iVBORw0KGgoAAAAN...",  # base64 string
    image_type="base64"
)

print(f"Severity: {result['severity']}")
print(f"Confidence: {result['confidence_score']:.2f}")
```

### Example 2: URL Image Analysis
```python
result = analyzer.analyze_image(
    zone_id="quang_tri_02",
    image_data="https://example.com/satellite.jpg",
    image_type="url"
)
```

### Example 3: API Request (JavaScript/TypeScript)
```typescript
const response = await fetch('http://localhost:8000/ai/analyze-satellite-image', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    zone_id: 'quang_tri_zone_01',
    image_data: base64ImageString,
    image_type: 'base64'
  })
});

const analysis = await response.json();
console.log(`Severity: ${analysis.severity}`);
console.log(`Recommendations:`, analysis.recommendations);
```

## Integration with Backend

### Option 1: Standalone Analysis
Call the endpoint independently whenever you have a satellite image to analyze:

```typescript
// In your Node.js backend
import axios from 'axios';

const analyzeImage = async (zoneId: string, imageData: string) => {
  const response = await axios.post('http://localhost:8000/ai/analyze-satellite-image', {
    zone_id: zoneId,
    image_data: imageData,
    image_type: 'base64'
  });
  
  return response.data;
};
```

### Option 2: Combined with NDVI Analysis
Create a workflow that runs both analyses:

```typescript
// Run both NDVI and Gemini analysis
const [ndviResult, geminiResult] = await Promise.all([
  analyzeNDVI(zoneId, beforePath, afterPath),
  analyzeSatelliteImage(zoneId, satelliteImage)
]);

// Store both results in DamageAssessment model
await DamageAssessment.create({
  zone_id: zoneId,
  ndvi_damage_score: ndviResult.damage_score,
  ai_damage_summary: geminiResult.damage_summary,
  severity: geminiResult.severity,
  confidence: geminiResult.confidence_score,
  // ... other fields
});
```

## API Comparison

| Feature | NDVI Analysis | Gemini AI Analysis |
|---------|---------------|-------------------|
| **Input** | GeoTIFF files (before/after) | RGB satellite images |
| **Method** | Rule-based thresholds | AI vision model |
| **Speed** | Very fast (~1s) | Fast (~2-5s) |
| **Output** | Quantitative metrics | Descriptive + metrics |
| **Strengths** | Precise, reproducible, area calculation | Understands context, identifies features, flexible |
| **Best For** | Vegetation damage, area measurement | Overall damage assessment, feature identification |

## Cost Considerations

### Gemini API Pricing (as of 2026)
- **Gemini 2.5 Flash**: Very low cost per request
- **Free tier**: Generous limits for development/testing
- **Estimated cost**: ~$0.001-0.01 per analysis (depending on image size)

## Error Handling

The service handles various error scenarios:

1. **Invalid API Key**: Returns 400 with clear error message
2. **Invalid Image Format**: Validates base64/URL/file before processing
3. **API Rate Limiting**: Logs error and returns 500 with details
4. **Network Issues**: Timeout handling with detailed error messages
5. **Parsing Failures**: Fallback parser ensures always returns structured data

## Future Enhancements

1. **Batch Processing**: Analyze multiple images in one request
2. **Caching**: Cache results to avoid re-analyzing same images
3. **Custom Prompts**: Allow users to customize analysis focus
4. **Model Selection**: Support switching between Gemini models (Flash/Pro)
5. **Confidence Thresholds**: Auto-flag low-confidence analyses for manual review
6. **Integration with NDVI**: Automatically combine both analyses
7. **Historical Comparison**: Track changes over time with multiple analyses

## Troubleshooting

### Issue: "API Key not found"
**Solution:** Ensure `GOOGLE_GEMINI_API_KEY` is set in `ai/.env`

### Issue: "Model not found"
**Solution:** Check available models with `python ai/list_models.py`

### Issue: "Invalid image data"
**Solution:** Verify base64 encoding or URL accessibility

### Issue: "Low confidence scores"
**Solution:** Use higher-resolution images or try Gemini Pro model

## Files Modified/Created

### Created:
- `ai/app/services/satellite_image_analyzer.py` - Main service class
- `ai/test_gemini.py` - Integration test script
- `ai/list_models.py` - Model availability checker

### Modified:
- `ai/requirements.txt` - Added google-generativeai, pillow
- `ai/.env` - Added GOOGLE_GEMINI_API_KEY
- `ai/app/models/schemas.py` - Added request/response schemas
- `ai/app/routes/damage.py` - Added new endpoint
- `ai/app/services/__init__.py` - Exported new service

## Success Criteria

✅ **All tasks completed:**
1. ✅ Dependencies installed
2. ✅ API key configured
3. ✅ Service implementation complete
4. ✅ Schemas defined
5. ✅ API endpoint added
6. ✅ Integration test passing

## Next Steps

1. **Test with Real Satellite Images**: Replace test image with actual satellite imagery
2. **Frontend Integration**: Build UI for uploading/analyzing images
3. **Backend Storage**: Save analysis results to MongoDB
4. **Monitoring**: Set up logging/monitoring for API usage and costs
5. **Production Deployment**: Deploy with proper API key management
