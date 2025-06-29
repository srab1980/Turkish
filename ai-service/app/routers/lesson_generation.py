from fastapi import APIRouter, HTTPException, Depends
from typing import List

from app.models.content import (
    LessonGenerationRequest,
    GeneratedLesson,
    CEFRLevel,
    VocabularyItem,
    GrammarRule,
    Exercise
)
from app.services.nlp_processor import NLPProcessor

router = APIRouter()
nlp_processor = NLPProcessor()

@router.post("/generate", response_model=GeneratedLesson)
async def generate_lesson(request: LessonGenerationRequest):
    """Generate a complete lesson from provided content"""
    
    try:
        # Analyze content difficulty
        detected_level, confidence = await nlp_processor.analyze_text_difficulty(request.content)
        
        # Extract vocabulary
        vocabulary = await nlp_processor.extract_vocabulary(
            request.content, 
            request.target_level, 
            max_items=request.max_vocabulary
        )
        
        # Extract grammar rules
        grammar_rules = await nlp_processor.extract_grammar_rules(
            request.content, 
            request.target_level
        )
        
        # Generate exercises
        exercises = await nlp_processor.generate_exercises(
            request.content,
            vocabulary,
            request.target_level,
            max_exercises=request.max_exercises
        )
        
        # Generate lesson title and description using AI
        lesson_title, lesson_description = await _generate_lesson_metadata(
            request.content, request.target_level, vocabulary, grammar_rules
        )
        
        # Estimate duration based on content
        estimated_duration = _estimate_lesson_duration(
            len(vocabulary), len(grammar_rules), len(exercises)
        )
        
        return GeneratedLesson(
            title=lesson_title,
            description=lesson_description,
            content=request.content[:1000] + "..." if len(request.content) > 1000 else request.content,
            vocabulary=vocabulary,
            grammar_rules=grammar_rules,
            exercises=exercises,
            estimated_duration=estimated_duration,
            difficulty_level=request.target_level
        )
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Lesson generation failed: {str(e)}")

@router.post("/vocabulary-lesson")
async def generate_vocabulary_lesson(
    words: List[str],
    target_level: CEFRLevel = CEFRLevel.B1
):
    """Generate a vocabulary-focused lesson from a list of words"""
    
    try:
        vocabulary_items = []
        
        for word in words[:20]:  # Limit to 20 words
            # Use NLP processor to get translations and examples
            prompt = f"""
            For the Turkish word "{word}":
            1. Provide English translation
            2. Create a simple Turkish example sentence
            3. Provide pronunciation guide (if possible)
            
            Format:
            Translation: [translation]
            Example: [turkish sentence]
            Pronunciation: [pronunciation]
            """
            
            try:
                response = await nlp_processor._call_openai(prompt, max_tokens=100)
                lines = response.strip().split('\n')
                
                translation = ""
                example = ""
                pronunciation = ""
                
                for line in lines:
                    if line.startswith("Translation:"):
                        translation = line.replace("Translation:", "").strip()
                    elif line.startswith("Example:"):
                        example = line.replace("Example:", "").strip()
                    elif line.startswith("Pronunciation:"):
                        pronunciation = line.replace("Pronunciation:", "").strip()
                
                if translation:
                    vocabulary_items.append(VocabularyItem(
                        turkish=word,
                        english=translation,
                        pronunciation=pronunciation if pronunciation else None,
                        example_sentence=example if example else None,
                        difficulty_level=target_level
                    ))
                    
            except Exception:
                continue
        
        # Generate simple exercises for vocabulary
        exercises = []
        if vocabulary_items:
            # Create a simple multiple choice exercise
            vocab_text = " ".join([item.example_sentence or item.turkish for item in vocabulary_items])
            exercises = await nlp_processor.generate_exercises(
                vocab_text, vocabulary_items[:5], target_level, max_exercises=5
            )
        
        return GeneratedLesson(
            title=f"Vocabulary Lesson - {target_level.value} Level",
            description=f"Learn {len(vocabulary_items)} new Turkish words",
            content=f"This lesson focuses on {len(vocabulary_items)} key vocabulary words.",
            vocabulary=vocabulary_items,
            grammar_rules=[],
            exercises=exercises,
            estimated_duration=len(vocabulary_items) * 2,  # 2 minutes per word
            difficulty_level=target_level
        )
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Vocabulary lesson generation failed: {str(e)}")

async def _generate_lesson_metadata(content: str, level: CEFRLevel, 
                                  vocabulary: List[VocabularyItem], 
                                  grammar_rules: List[GrammarRule]) -> tuple:
    """Generate lesson title and description using AI"""
    
    vocab_topics = [item.turkish for item in vocabulary[:5]]
    grammar_topics = [rule.title for rule in grammar_rules[:3]]
    
    prompt = f"""
    Create a lesson title and description for a {level.value} level Turkish lesson.
    
    Content preview: {content[:200]}...
    Key vocabulary: {', '.join(vocab_topics)}
    Grammar topics: {', '.join(grammar_topics)}
    
    Format:
    TITLE: [engaging lesson title]
    DESCRIPTION: [brief description of what students will learn]
    """
    
    try:
        response = await nlp_processor._call_openai(prompt, max_tokens=100)
        lines = response.strip().split('\n')
        
        title = "Turkish Lesson"
        description = "Learn Turkish vocabulary and grammar"
        
        for line in lines:
            if line.startswith("TITLE:"):
                title = line.replace("TITLE:", "").strip()
            elif line.startswith("DESCRIPTION:"):
                description = line.replace("DESCRIPTION:", "").strip()
        
        return title, description
        
    except Exception:
        return "Turkish Lesson", "Learn Turkish vocabulary and grammar"

def _estimate_lesson_duration(vocab_count: int, grammar_count: int, exercise_count: int) -> int:
    """Estimate lesson duration in minutes"""
    
    # Base time estimates
    vocab_time = vocab_count * 1.5  # 1.5 minutes per vocabulary item
    grammar_time = grammar_count * 3  # 3 minutes per grammar rule
    exercise_time = exercise_count * 2  # 2 minutes per exercise
    
    total_time = vocab_time + grammar_time + exercise_time
    
    # Add buffer time
    total_time *= 1.2
    
    return max(5, int(total_time))  # Minimum 5 minutes
