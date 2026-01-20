# Quick Start Guide - REGROW AI Service

## ✅ Implementation Complete!

All files have been created. Follow these steps to get started:

## 📋 Step 1: Install Python Dependencies

Open a **NEW terminal** in VS Code and run:

```bash
# Navigate to AI folder
cd "d:\OneDrive - RMIT University\Hack A Venture\third_round_code\regrow_icup\ai"

# Create virtual environment
python -m venv venv

# Activate virtual environment (Windows)
venv\Scripts\activate

# You should see (venv) in your terminal prompt now

# Upgrade pip
pip install --upgrade pip

# Install dependencies
pip install -r requirements.txt
```

**Note for Windows users:** If `rasterio` installation fails:
```bash
pip install pipwin
pipwin install gdal
pipwin install rasterio
```

## 🧪 Step 2: Verify Installation

```bash
# Still in ai/ folder with (venv) activated
python test_setup.py
```

Expected output: All packages should show ✅

## 📊 Step 3: Generate Test Data

```bash
python test_data/generate_sample.py
```

This creates synthetic satellite images:
- `test_data/quang_tri_before.tif` (pre-flood)
- `test_data/quang_tri_after.tif` (post-flood)

## 🧪 Step 4: Run Local Tests

```bash
python test_local.py
```

This tests the core logic WITHOUT starting the server.

Expected output:
- ✅ PASSED - NDVI Analyzer
- ✅ PASSED - Fund Allocator

## 🚀 Step 5: Start the Server

```bash
uvicorn app.main:app --reload --port 8000
```

Server will start at: http://localhost:8000

API docs: http://localhost:8000/docs

## 📡 Step 6: Test API Endpoints

**Option A: Use Swagger UI**

1. Open browser: http://localhost:8000/docs
2. Try the endpoints interactively

**Option B: Use pytest**

Open a **NEW terminal** (keep server running in first terminal):

```bash
cd "d:\OneDrive - RMIT University\Hack A Venture\third_round_code\regrow_icup\ai"
venv\Scripts\activate
pytest tests/test_api.py -v
```

**Option C: Use curl/httpx**

```bash
# Health check
curl http://localhost:8000/health

# Analyze damage
curl -X POST http://localhost:8000/ai/analyze-damage \
  -H "Content-Type: application/json" \
  -d "{\"region_id\":\"test_01\",\"ndvi_before_path\":\"./test_data/quang_tri_before.tif\",\"ndvi_after_path\":\"./test_data/quang_tri_after.tif\"}"

# Distribute funds
curl -X POST http://localhost:8000/ai/distribute-funds \
  -H "Content-Type: application/json" \
  -d "{\"total_fund\":100000,\"regions\":[{\"region_id\":\"region_a\",\"damage_score\":0.8,\"damaged_area_ha\":100},{\"region_id\":\"region_b\",\"damage_score\":0.5,\"damaged_area_ha\":50}]}"
```

## 📝 What You Have Now

### API Endpoints (Port 8000)

1. **GET /health** - Health check
   - Returns: `{"status": "healthy", "service": "regrow-ai"}`

2. **POST /ai/analyze-damage** - NDVI damage analysis
   - Input: `{region_id, ndvi_before_path, ndvi_after_path}`
   - Output: `{region_id, damage_score, damaged_area_ha, severity, breakdown}`

3. **POST /ai/distribute-funds** - Fund distribution
   - Input: `{total_fund, regions[]}`
   - Output: `{allocations[]}`

### Project Structure

```
ai/
├── app/
│   ├── main.py              ✅ FastAPI app with CORS
│   ├── routes/
│   │   ├── damage.py        ✅ Damage analysis endpoint
│   │   └── fund.py          ✅ Fund distribution endpoint
│   ├── services/
│   │   ├── ndvi_analyzer.py ✅ NDVI processing logic
│   │   └── fund_allocator.py ✅ Fund allocation logic
│   └── models/
│       └── schemas.py       ✅ Pydantic validation schemas
├── test_data/
│   ├── generate_sample.py   ✅ Test data generator
│   ├── quang_tri_before.tif ⏳ (will be created)
│   └── quang_tri_after.tif  ⏳ (will be created)
├── tests/
│   └── test_api.py          ✅ Integration tests
├── test_local.py            ✅ Local unit tests
├── test_setup.py            ✅ Verify installation
├── requirements.txt         ✅ Dependencies
├── .env                     ✅ Configuration
└── README.md                ✅ Documentation
```

## 🔗 Integration with Backend

Your backend (Node.js) can now call these endpoints:

```typescript
// Example: Analyze damage
const response = await fetch('http://localhost:8000/ai/analyze-damage', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    region_id: 'central_vietnam_01',
    ndvi_before_path: './test_data/quang_tri_before.tif',
    ndvi_after_path: './test_data/quang_tri_after.tif'
  })
});

const data = await response.json();
// { region_id, damage_score, damaged_area_ha, severity, breakdown }
```

## 🐛 Troubleshooting

### "Module not found" errors
- Make sure virtual environment is activated: `(venv)` should appear in prompt
- Re-run: `pip install -r requirements.txt`

### "Port 8000 already in use"
- Change port: `uvicorn app.main:app --reload --port 8001`
- Or kill existing process on port 8000

### Rasterio installation fails
```bash
pip install pipwin
pipwin install gdal
pipwin install rasterio
```

### CORS errors from backend
- Check `.env` file: `BACKEND_URL=http://localhost:3000`
- Verify backend is on port 3000

## 📚 Next Steps

1. ✅ Verify all tests pass
2. ✅ Test API endpoints via Swagger UI
3. 🔄 Coordinate with backend team on:
   - File path handling (where to store satellite images)
   - API authentication (if needed)
   - Response format validation
4. 🚀 Deploy to production when ready

## 🎯 Success Criteria

- [ ] `python test_setup.py` - All ✅
- [ ] `python test_data/generate_sample.py` - Creates .tif files
- [ ] `python test_local.py` - All tests pass
- [ ] `uvicorn app.main:app --port 8000` - Server starts
- [ ] http://localhost:8000/docs - Swagger UI loads
- [ ] `pytest tests/test_api.py -v` - All API tests pass

---

**You're all set! 🎉**

The AI service is ready to receive requests from your backend team.
