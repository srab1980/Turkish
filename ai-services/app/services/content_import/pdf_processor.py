"""
PDF processing service for Istanbul Book content import
"""

import asyncio
import io
import logging
from pathlib import Path
from typing import Dict, List, Optional, Tuple, Any

import fitz  # PyMuPDF
import pdfplumber
from PIL import Image
import structlog

from app.core.config import get_settings
from app.services.ai.text_analyzer import TextAnalyzer
from app.services.ai.content_extractor import ContentExtractor
from app.models.content import (
    ExtractedContent,
    CourseStructure,
    LessonContent,
    ExerciseContent,
    VocabularyItem
)

logger = structlog.get_logger(__name__)
settings = get_settings()


class PDFProcessor:
    """Process PDF files and extract structured content"""
    
    def __init__(self):
        self.text_analyzer = TextAnalyzer()
        self.content_extractor = ContentExtractor()
        
    async def process_pdf(
        self,
        pdf_path: Path,
        job_id: str,
        progress_callback: Optional[callable] = None
    ) -> ExtractedContent:
        """
        Process a PDF file and extract structured content
        
        Args:
            pdf_path: Path to the PDF file
            job_id: Unique job identifier for tracking
            progress_callback: Optional callback for progress updates
            
        Returns:
            ExtractedContent with structured data
        """
        logger.info("Starting PDF processing", pdf_path=str(pdf_path), job_id=job_id)
        
        try:
            # Extract text and images from PDF
            raw_content = await self._extract_raw_content(pdf_path, progress_callback)
            
            # Analyze text structure
            if progress_callback:
                await progress_callback(job_id, 30, "Analyzing text structure")
            
            text_structure = await self.text_analyzer.analyze_structure(
                raw_content["text"]
            )
            
            # Extract course structure
            if progress_callback:
                await progress_callback(job_id, 50, "Extracting course structure")
            
            course_structure = await self.content_extractor.extract_course_structure(
                text_structure,
                raw_content["images"]
            )
            
            # Extract lessons
            if progress_callback:
                await progress_callback(job_id, 70, "Extracting lessons")
            
            lessons = await self._extract_lessons(
                course_structure,
                raw_content,
                progress_callback,
                job_id
            )
            
            # Extract exercises
            if progress_callback:
                await progress_callback(job_id, 85, "Extracting exercises")
            
            exercises = await self._extract_exercises(
                lessons,
                raw_content,
                progress_callback,
                job_id
            )
            
            # Extract vocabulary
            if progress_callback:
                await progress_callback(job_id, 95, "Extracting vocabulary")
            
            vocabulary = await self._extract_vocabulary(
                raw_content["text"],
                lessons
            )
            
            # Create final extracted content
            extracted_content = ExtractedContent(
                course_structure=course_structure,
                lessons=lessons,
                exercises=exercises,
                vocabulary=vocabulary,
                metadata={
                    "source_file": str(pdf_path),
                    "total_pages": raw_content["total_pages"],
                    "processing_time": raw_content.get("processing_time"),
                    "job_id": job_id
                }
            )
            
            if progress_callback:
                await progress_callback(job_id, 100, "Processing completed")
            
            logger.info(
                "PDF processing completed successfully",
                job_id=job_id,
                lessons_count=len(lessons),
                exercises_count=len(exercises),
                vocabulary_count=len(vocabulary)
            )
            
            return extracted_content
            
        except Exception as e:
            logger.error(
                "PDF processing failed",
                job_id=job_id,
                error=str(e),
                exc_info=True
            )
            raise
    
    async def _extract_raw_content(
        self,
        pdf_path: Path,
        progress_callback: Optional[callable] = None
    ) -> Dict[str, Any]:
        """Extract raw text and images from PDF"""
        
        raw_content = {
            "text": "",
            "images": [],
            "pages": [],
            "total_pages": 0
        }
        
        # Use PyMuPDF for text and image extraction
        doc = fitz.open(str(pdf_path))
        raw_content["total_pages"] = len(doc)
        
        for page_num in range(len(doc)):
            page = doc[page_num]
            
            # Extract text
            page_text = page.get_text()
            raw_content["text"] += f"\n--- Page {page_num + 1} ---\n{page_text}"
            
            # Extract images
            image_list = page.get_images()
            page_images = []
            
            for img_index, img in enumerate(image_list):
                try:
                    xref = img[0]
                    pix = fitz.Pixmap(doc, xref)
                    
                    if pix.n - pix.alpha < 4:  # GRAY or RGB
                        img_data = pix.tobytes("png")
                        img_obj = Image.open(io.BytesIO(img_data))
                        
                        page_images.append({
                            "page": page_num + 1,
                            "index": img_index,
                            "image": img_obj,
                            "bbox": img[1:5] if len(img) > 4 else None
                        })
                    
                    pix = None
                    
                except Exception as e:
                    logger.warning(
                        "Failed to extract image",
                        page=page_num + 1,
                        image_index=img_index,
                        error=str(e)
                    )
            
            raw_content["images"].extend(page_images)
            raw_content["pages"].append({
                "number": page_num + 1,
                "text": page_text,
                "images": page_images
            })
            
            # Update progress
            if progress_callback:
                progress = int((page_num + 1) / len(doc) * 25)  # 25% for extraction
                await progress_callback(
                    "extraction",
                    progress,
                    f"Extracting page {page_num + 1}/{len(doc)}"
                )
        
        doc.close()
        
        # Use pdfplumber for better table extraction
        try:
            with pdfplumber.open(pdf_path) as pdf:
                tables = []
                for page in pdf.pages:
                    page_tables = page.extract_tables()
                    if page_tables:
                        tables.extend(page_tables)
                
                raw_content["tables"] = tables
                
        except Exception as e:
            logger.warning("Failed to extract tables with pdfplumber", error=str(e))
            raw_content["tables"] = []
        
        return raw_content
    
    async def _extract_lessons(
        self,
        course_structure: CourseStructure,
        raw_content: Dict[str, Any],
        progress_callback: Optional[callable],
        job_id: str
    ) -> List[LessonContent]:
        """Extract lesson content from raw content"""
        
        lessons = []
        
        for unit_index, unit in enumerate(course_structure.units):
            for lesson_index, lesson_outline in enumerate(unit.lessons):
                
                # Extract lesson content using AI
                lesson_content = await self.content_extractor.extract_lesson_content(
                    lesson_outline,
                    raw_content,
                    unit.cefr_level
                )
                
                lessons.append(lesson_content)
                
                # Update progress
                if progress_callback:
                    total_lessons = sum(len(u.lessons) for u in course_structure.units)
                    current_lesson = sum(len(u.lessons) for u in course_structure.units[:unit_index]) + lesson_index + 1
                    progress = int(70 + (current_lesson / total_lessons) * 15)  # 15% for lessons
                    
                    await progress_callback(
                        job_id,
                        progress,
                        f"Processing lesson {current_lesson}/{total_lessons}"
                    )
        
        return lessons
    
    async def _extract_exercises(
        self,
        lessons: List[LessonContent],
        raw_content: Dict[str, Any],
        progress_callback: Optional[callable],
        job_id: str
    ) -> List[ExerciseContent]:
        """Extract exercises from lessons and raw content"""
        
        exercises = []
        
        for lesson_index, lesson in enumerate(lessons):
            # Extract exercises for this lesson
            lesson_exercises = await self.content_extractor.extract_exercises(
                lesson,
                raw_content
            )
            
            exercises.extend(lesson_exercises)
            
            # Update progress
            if progress_callback:
                progress = int(85 + (lesson_index + 1) / len(lessons) * 10)  # 10% for exercises
                await progress_callback(
                    job_id,
                    progress,
                    f"Extracting exercises for lesson {lesson_index + 1}/{len(lessons)}"
                )
        
        return exercises
    
    async def _extract_vocabulary(
        self,
        text: str,
        lessons: List[LessonContent]
    ) -> List[VocabularyItem]:
        """Extract vocabulary items from text and lessons"""
        
        # Extract vocabulary using AI
        vocabulary = await self.content_extractor.extract_vocabulary(
            text,
            lessons
        )
        
        return vocabulary
    
    async def validate_pdf(self, pdf_path: Path) -> Tuple[bool, Optional[str]]:
        """
        Validate PDF file before processing
        
        Returns:
            Tuple of (is_valid, error_message)
        """
        try:
            # Check file size
            file_size = pdf_path.stat().st_size
            if file_size > settings.MAX_FILE_SIZE:
                return False, f"File size ({file_size} bytes) exceeds maximum allowed size"
            
            # Check if file can be opened
            doc = fitz.open(str(pdf_path))
            
            if len(doc) == 0:
                return False, "PDF file contains no pages"
            
            # Check if PDF is password protected
            if doc.needs_pass:
                return False, "PDF file is password protected"
            
            # Try to extract text from first page
            first_page = doc[0]
            text = first_page.get_text()
            
            if not text.strip():
                logger.warning("PDF appears to contain no extractable text")
            
            doc.close()
            
            return True, None
            
        except Exception as e:
            return False, f"Failed to validate PDF: {str(e)}"
