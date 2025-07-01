from pydantic import BaseModel, Field
from typing import List, Optional, Dict, Any
from enum import Enum

class CEFRLevel(str, Enum):
    A1 = "A1"
    A2 = "A2"
    B1 = "B1"
    B2 = "B2"
    C1 = "C1"
    C2 = "C2"

class ContentType(str, Enum):
    PDF = "pdf"
    EPUB = "epub"
    DOCX = "docx"
    TXT = "txt"

class ContentExtractionRequest(BaseModel):
    file_url: str
    file_type: ContentType
    target_level: CEFRLevel
    extract_images: bool = True
    extract_audio: bool = False

class VocabularyItem(BaseModel):
    turkish: str
    english: str
    pronunciation: Optional[str] = None
    example_sentence: Optional[str] = None
    difficulty_level: CEFRLevel
    frequency_score: Optional[float] = None

class GrammarRule(BaseModel):
    title: str
    explanation: str
    examples: List[str]
    difficulty_level: CEFRLevel
    category: str

class Exercise(BaseModel):
    type: str
    question: str
    options: Optional[List[str]] = None
    correct_answer: str
    explanation: Optional[str] = None
    difficulty_level: CEFRLevel

class ContentExtractionResponse(BaseModel):
    extracted_text: str
    vocabulary: List[VocabularyItem]
    grammar_rules: List[GrammarRule]
    suggested_exercises: List[Exercise]
    detected_level: CEFRLevel
    confidence_score: float
    metadata: Dict[str, Any]

class LessonGenerationRequest(BaseModel):
    content: str
    target_level: CEFRLevel
    lesson_type: str = "mixed"
    max_vocabulary: int = 20
    max_exercises: int = 10

class GeneratedLesson(BaseModel):
    title: str
    description: str
    content: str
    vocabulary: List[VocabularyItem]
    grammar_rules: List[GrammarRule]
    exercises: List[Exercise]
    estimated_duration: int  # in minutes
    difficulty_level: CEFRLevel
