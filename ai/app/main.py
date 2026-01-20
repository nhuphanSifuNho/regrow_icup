"""
REGROW AI Service - Main Application
FastAPI server for NDVI damage analysis and fund distribution

Run with: uvicorn app.main:app --reload --port 8000

Endpoints:
- GET /health - Health check
- POST /ai/analyze-damage - NDVI analysis
- POST /ai/distribute-funds - Fund allocation

CORS: Allows requests from http://localhost:3000 (Node.js backend)
"""

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.routes import damage, fund
import logging
import os
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

# Configure logging
logging.basicConfig(
    level=os.getenv("LOG_LEVEL", "INFO"),
    format="%(asctime)s - %(name)s - %(levelname)s - %(message)s"
)

logger = logging.getLogger(__name__)

# Create FastAPI app
app = FastAPI(
    title="REGROW AI Service",
    description="AI-powered NDVI damage assessment and fund distribution for agricultural recovery",
    version="1.0.0",
    docs_url="/docs",
    redoc_url="/redoc"
)

# Configure CORS middleware
allowed_origins = [
    os.getenv("BACKEND_URL", "http://localhost:3000"),
    "http://localhost:3000",
    "http://localhost:3001",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=allowed_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(damage.router)
app.include_router(fund.router)


@app.get(
    "/health",
    tags=["health"],
    summary="Health check endpoint",
    description="Returns service health status"
)
async def health_check():
    """
    Health check endpoint
    
    Returns:
        Service status and metadata
    """
    return {
        "status": "healthy",
        "service": "regrow-ai",
        "version": "1.0.0"
    }


@app.on_event("startup")
async def startup():
    """Startup event handler"""
    logger.info("🚀 REGROW AI Service started on port 8000")
    logger.info(f"📚 API docs available at: http://localhost:8000/docs")
    logger.info(f"🌐 CORS enabled for: {allowed_origins}")


@app.on_event("shutdown")
async def shutdown():
    """Shutdown event handler"""
    logger.info("👋 REGROW AI Service shutting down")


if __name__ == "__main__":
    import uvicorn
    
    port = int(os.getenv("PORT", 8000))
    host = os.getenv("HOST", "0.0.0.0")
    debug = os.getenv("DEBUG", "true").lower() == "true"
    
    uvicorn.run(
        "app.main:app",
        host=host,
        port=port,
        reload=debug,
        log_level="info"
    )
