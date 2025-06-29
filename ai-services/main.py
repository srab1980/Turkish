"""
Turkish Language Learning AI Services
Main FastAPI application entry point
"""

import logging
import os
from contextlib import asynccontextmanager
from typing import AsyncGenerator

import uvicorn
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.middleware.gzip import GZipMiddleware
from fastapi.responses import JSONResponse
from prometheus_client import make_asgi_app
import structlog

from app.core.config import get_settings
from app.core.database import init_db
from app.core.logging import setup_logging
from app.api.v1.router import api_router
from app.core.exceptions import setup_exception_handlers
from app.core.middleware import setup_middleware

# Setup structured logging
setup_logging()
logger = structlog.get_logger(__name__)

settings = get_settings()


@asynccontextmanager
async def lifespan(app: FastAPI) -> AsyncGenerator[None, None]:
    """Application lifespan manager"""
    logger.info("Starting Turkish Learning AI Services")
    
    # Initialize database
    await init_db()
    
    # Load AI models
    from app.services.ai.model_manager import ModelManager
    model_manager = ModelManager()
    await model_manager.load_models()
    
    logger.info("AI Services started successfully")
    
    yield
    
    logger.info("Shutting down AI Services")
    
    # Cleanup resources
    await model_manager.cleanup()


def create_app() -> FastAPI:
    """Create and configure FastAPI application"""
    
    app = FastAPI(
        title="Turkish Learning AI Services",
        description="AI-powered microservices for Turkish language learning platform",
        version="1.0.0",
        docs_url="/docs" if settings.DEBUG else None,
        redoc_url="/redoc" if settings.DEBUG else None,
        openapi_url="/openapi.json" if settings.DEBUG else None,
        lifespan=lifespan,
    )
    
    # Setup middleware
    setup_middleware(app)
    
    # CORS middleware
    app.add_middleware(
        CORSMiddleware,
        allow_origins=settings.ALLOWED_HOSTS,
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )
    
    # Compression middleware
    app.add_middleware(GZipMiddleware, minimum_size=1000)
    
    # Setup exception handlers
    setup_exception_handlers(app)
    
    # Include API routes
    app.include_router(api_router, prefix="/api/v1")
    
    # Health check endpoint
    @app.get("/health")
    async def health_check():
        """Health check endpoint"""
        return {"status": "healthy", "service": "turkish-learning-ai"}
    
    # Metrics endpoint for Prometheus
    if settings.ENABLE_METRICS:
        metrics_app = make_asgi_app()
        app.mount("/metrics", metrics_app)
    
    return app


app = create_app()


if __name__ == "__main__":
    uvicorn.run(
        "main:app",
        host=settings.HOST,
        port=settings.PORT,
        reload=settings.DEBUG,
        log_config=None,  # Use our custom logging
        access_log=False,  # Disable default access log
    )
