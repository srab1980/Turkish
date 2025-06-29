from fastapi import FastAPI, HTTPException, UploadFile, File, Depends
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
import uvicorn
import os
from dotenv import load_dotenv

from app.routers import content_extraction, lesson_generation, speech_processing
from app.api import conversation
from app.core.config import settings
# from app.core.database import init_db

# Load environment variables
load_dotenv()

# Create FastAPI app
app = FastAPI(
    title="Turkish Learning AI Service",
    description="AI-powered content extraction and lesson generation for Turkish language learning",
    version="1.0.0",
    docs_url="/docs",
    redoc_url="/redoc"
)

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(content_extraction.router, prefix="/api/v1/content", tags=["Content Extraction"])
app.include_router(lesson_generation.router, prefix="/api/v1/lessons", tags=["Lesson Generation"])
app.include_router(speech_processing.router, prefix="/api/v1/speech", tags=["Speech Processing"])
app.include_router(conversation.router, prefix="/api/v1", tags=["Conversation Practice"])

@app.on_event("startup")
async def startup_event():
    """Initialize services on startup"""
    # TODO: Initialize database when available
    print("AI Service started successfully")

@app.get("/")
async def root():
    return {"message": "Turkish Learning AI Service", "version": "1.0.0"}

@app.get("/health")
async def health_check():
    return {"status": "healthy", "service": "ai-service"}

if __name__ == "__main__":
    uvicorn.run(
        "main:app",
        host="0.0.0.0",
        port=int(os.getenv("PORT", 8000)),
        reload=True if os.getenv("ENVIRONMENT") == "development" else False
    )
