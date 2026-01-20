# REGROW AI Service

AI-powered NDVI damage assessment and fund distribution for agricultural recovery.

## 🚀 Quick Start

### Prerequisites
- Python 3.11+
- pip

### Installation

```bash
# Create virtual environment
python -m venv venv

# Activate (Windows)
venv\Scripts\activate

# Activate (Linux/Mac)
source venv/bin/activate

# Install dependencies
pip install --upgrade pip
pip install -r requirements.txt
```

### Run Server

```bash
uvicorn app.main:app --reload --port 8000
```

Server will start at: http://localhost:8000  
API docs: http://localhost:8000/docs

## 📡 API Endpoints

- **GET** `/health` - Health check
- **POST** `/ai/analyze-damage` - NDVI damage analysis
- **POST** `/ai/distribute-funds` - Fund allocation

## 🧪 Testing

```bash
# Verify setup
python test_setup.py

# Generate test data
python test_data/generate_sample.py

# Unit tests (no server needed)
python test_local.py

# API tests (server must be running)
pytest tests/test_api.py -v
```

## 📁 Project Structure

```
ai/
├── app/
│   ├── main.py              # FastAPI app
│   ├── routes/              # API endpoints
│   │   ├── damage.py        # Damage analysis endpoint
│   │   └── fund.py          # Fund distribution endpoint
│   ├── services/            # Business logic
│   │   ├── ndvi_analyzer.py # NDVI processing
│   │   └── fund_allocator.py # Fund allocation logic
│   └── models/              # Data models
│       └── schemas.py       # Pydantic schemas
├── test_data/               # Sample GeoTIFF files
│   └── generate_sample.py  # Test data generator
└── tests/                   # Integration tests
    └── test_api.py         # API endpoint tests
```

## 🔧 Tech Stack

- **FastAPI 0.109.0** - Modern Python web framework
- **Python 3.11+** - Programming language
- **Rasterio 1.3.9** - GeoTIFF file processing
- **NumPy 1.26.0** - Array operations
- **Scikit-learn 1.4.0** - K-Means clustering

## 🌿 Algorithm Overview

### NDVI Damage Analysis

1. Load pre-flood and post-flood NDVI GeoTIFF files
2. Calculate ΔNDVI = post_flood_ndvi - pre_flood_ndvi
3. Apply threshold classification:
   - **Severe**: ΔNDVI ≤ -0.20 (vegetation destroyed)
   - **Moderate**: -0.20 < ΔNDVI < -0.10 (partial damage)
   - **Minor**: ΔNDVI ≥ -0.10 (minimal damage)
4. Calculate affected area in hectares (10m × 10m pixel = 0.01 ha)
5. Compute damage_score: weighted average (0-1 scale)

### Fund Distribution

1. Calculate weighted damage: `damage_score × damaged_area_ha`
2. Allocate proportionally: `(weighted / total_weighted) × total_fund`
3. Return allocations with amounts and percentages

## 🔗 Integration with Backend

The AI service provides data to the Node.js backend via HTTP API calls:

- Backend calls `POST /ai/analyze-damage` with satellite image paths
- Backend calls `POST /ai/distribute-funds` with region damage data
- AI service returns structured JSON responses
- Backend stores results in MongoDB

## 📝 Environment Variables

See `.env` file for configuration options.

## 🐛 Troubleshooting

### Rasterio installation fails on Windows

```bash
pip install pipwin
pipwin install gdal
pipwin install rasterio
```

### Import errors

Ensure virtual environment is activated: `(venv)` should appear in terminal prompt.

## 📄 License

Part of REGROW Platform - Hackathon Project
