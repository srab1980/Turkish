from fastapi import FastAPI, HTTPException, UploadFile, File, Depends
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
import uvicorn
import os
from dotenv import load_dotenv

from app.routers import lesson_generation, speech_processing, conversation, adaptive_learning, curriculum_builder, practice_generator, teacher_tools
# from app.routers import content_extraction  # Temporarily disabled due to PyPDF2 dependency
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
# app.include_router(content_extraction.router, prefix="/api/v1/content", tags=["Content Extraction"])  # Temporarily disabled
app.include_router(lesson_generation.router, prefix="/api/v1/lessons", tags=["Lesson Generation"])
app.include_router(speech_processing.router, prefix="/api/v1/speech", tags=["Speech Processing"])
app.include_router(conversation.router, prefix="/api/v1/conversation", tags=["Conversation Practice"])

# New enhanced routers
app.include_router(adaptive_learning.router, prefix="/api/v1/adaptive", tags=["Adaptive Learning"])
app.include_router(curriculum_builder.router, prefix="/api/v1/curriculum", tags=["Curriculum Builder"])
app.include_router(practice_generator.router, prefix="/api/v1/practice", tags=["Practice Generator"])
app.include_router(teacher_tools.router, prefix="/api/v1/teacher", tags=["Teacher Tools"])

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
