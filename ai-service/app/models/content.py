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

# New models for enhanced functionality

class LessonType(str, Enum):
    VOCABULARY = "vocabulary"
    GRAMMAR = "grammar"
    READING = "reading"
    LISTENING = "listening"
    SPEAKING = "speaking"
    WRITING = "writing"
    CULTURE = "culture"
    MIXED = "mixed"

class StudentProgress(BaseModel):
    user_id: str
    lesson_id: str
    completion_rate: float
    accuracy_score: float
    time_spent: int  # in minutes
    weak_areas: List[str]
    strong_areas: List[str]
    last_accessed: str

class AdaptiveLessonRequest(BaseModel):
    student_id: str
    target_level: CEFRLevel
    lesson_type: LessonType
    focus_areas: List[str]  # Areas student needs to improve
    duration_minutes: int = 15
    difficulty_adjustment: float = 0.0  # -1.0 to 1.0, negative for easier

class CurriculumUnit(BaseModel):
    title: str
    description: str
    lessons: List[str]  # lesson IDs
    prerequisites: List[str]  # prerequisite unit IDs
    learning_objectives: List[str]
    estimated_hours: int

class CurriculumRequest(BaseModel):
    title: str
    target_level: CEFRLevel
    total_hours: int
    focus_areas: List[LessonType]
    student_goals: List[str]

class GeneratedCurriculum(BaseModel):
    title: str
    description: str
    units: List[CurriculumUnit]
    total_lessons: int
    estimated_duration: int  # in hours
    learning_path: List[str]  # ordered unit IDs

class ExerciseGenerationRequest(BaseModel):
    lesson_content: str
    exercise_types: List[str]
    difficulty_level: CEFRLevel
    student_weak_areas: List[str]
    count: int = 5

class PracticeExercise(BaseModel):
    type: str
    title: str
    instructions: str
    content: Dict[str, Any]
    correct_answers: Dict[str, Any]
    hints: List[str]
    difficulty_level: CEFRLevel
    estimated_time: int  # in minutes
    skill_focus: List[str]  # vocabulary, grammar, reading, etc.

class TeacherLessonRequest(BaseModel):
    title: str
    topic: str
    target_level: CEFRLevel
    lesson_type: LessonType
    duration_minutes: int
    learning_objectives: List[str]
    include_exercises: bool = True
    exercise_count: int = 5
    include_vocabulary: bool = True
    vocabulary_count: int = 10
    include_grammar: bool = True
    cultural_context: bool = False
