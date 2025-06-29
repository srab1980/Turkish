from fastapi import APIRouter, UploadFile, File, HTTPException, Depends
from fastapi.responses import JSONResponse
import aiofiles
import os
import uuid
from typing import List

from app.models.content import (
    ContentExtractionRequest, 
    ContentExtractionResponse, 
    ContentType, 
    CEFRLevel
)
from app.services.content_extractor import ContentExtractor
from app.services.nlp_processor import NLPProcessor
from app.core.config import settings

router = APIRouter()

# Initialize services
content_extractor = ContentExtractor()
nlp_processor = NLPProcessor()

@router.post("/extract", response_model=ContentExtractionResponse)
async def extract_content_from_file(
    file: UploadFile = File(...),
    target_level: CEFRLevel = CEFRLevel.B1,
    extract_images: bool = True
):
    """Extract content from uploaded file and generate learning materials"""
    
    # Validate file type
    file_extension = os.path.splitext(file.filename)[1].lower()
    if file_extension not in settings.ALLOWED_EXTENSIONS:
        raise HTTPException(
            status_code=400, 
            detail=f"Unsupported file type. Allowed: {settings.ALLOWED_EXTENSIONS}"
        )
    
    # Validate file size
    if file.size > settings.MAX_FILE_SIZE:
        raise HTTPException(
            status_code=400,
            detail=f"File too large. Maximum size: {settings.MAX_FILE_SIZE} bytes"
        )
    
    try:
        # Save uploaded file temporarily
        file_id = str(uuid.uuid4())
        temp_filename = f"{file_id}{file_extension}"
        temp_path = os.path.join(settings.UPLOAD_DIR, temp_filename)
        
        # Ensure upload directory exists
        os.makedirs(settings.UPLOAD_DIR, exist_ok=True)
        
        # Save file
        async with aiofiles.open(temp_path, 'wb') as temp_file:
            content = await file.read()
            await temp_file.write(content)
        
        # Determine content type
        content_type_map = {
            '.pdf': ContentType.PDF,
            '.docx': ContentType.DOCX,
            '.epub': ContentType.EPUB,
            '.txt': ContentType.TXT
        }
        content_type = content_type_map[file_extension]
        
        # Extract content
        extracted_data = await content_extractor.extract_content(temp_path, content_type)
        extracted_text = extracted_data["text"]
        
        if not extracted_text.strip():
            raise HTTPException(status_code=400, detail="No text content found in file")
        
        # Analyze text difficulty
        detected_level, confidence = await nlp_processor.analyze_text_difficulty(extracted_text)
        
        # Extract vocabulary
        vocabulary = await nlp_processor.extract_vocabulary(
            extracted_text, target_level, max_items=20
        )
        
        # Extract grammar rules
        grammar_rules = await nlp_processor.extract_grammar_rules(
            extracted_text, target_level
        )
        
        # Generate exercises
        exercises = await nlp_processor.generate_exercises(
            extracted_text, vocabulary, target_level, max_exercises=10
        )
        
        # Clean up temporary file
        try:
            os.remove(temp_path)
        except:
            pass
        
        return ContentExtractionResponse(
            extracted_text=extracted_text[:2000] + "..." if len(extracted_text) > 2000 else extracted_text,
            vocabulary=vocabulary,
            grammar_rules=grammar_rules,
            suggested_exercises=exercises,
            detected_level=detected_level,
            confidence_score=confidence,
            metadata={
                "original_filename": file.filename,
                "file_size": file.size,
                "word_count": extracted_data.get("word_count", 0),
                "character_count": extracted_data.get("character_count", 0),
                **extracted_data.get("metadata", {})
            }
        )
        
    except Exception as e:
        # Clean up temporary file on error
        try:
            if 'temp_path' in locals():
                os.remove(temp_path)
        except:
            pass
        
        raise HTTPException(status_code=500, detail=f"Content extraction failed: {str(e)}")

@router.post("/extract-url")
async def extract_content_from_url(request: ContentExtractionRequest):
    """Extract content from file URL"""
    
    # TODO: Implement URL-based content extraction
    # This would download the file from URL and process it
    
    raise HTTPException(status_code=501, detail="URL-based extraction not yet implemented")

@router.get("/supported-formats")
async def get_supported_formats():
    """Get list of supported file formats"""
    
    return {
        "formats": [
            {
                "extension": ".pdf",
                "type": "PDF Document",
                "description": "Portable Document Format files"
            },
            {
                "extension": ".docx", 
                "type": "Word Document",
                "description": "Microsoft Word documents"
            },
            {
                "extension": ".epub",
                "type": "E-book",
                "description": "Electronic publication format"
            },
            {
                "extension": ".txt",
                "type": "Text File",
                "description": "Plain text files"
            }
        ],
        "max_file_size": settings.MAX_FILE_SIZE,
        "max_file_size_mb": settings.MAX_FILE_SIZE / (1024 * 1024)
    }
