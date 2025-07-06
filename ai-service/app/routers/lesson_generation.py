from fastapi import APIRouter, HTTPException, Depends
from typing import List
import os
import json
from openai import OpenAI

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

@router.get("/test")
async def test_lesson_generation():
    """Simple test endpoint to verify lesson generation service is working"""
    return {
        "message": "Lesson generation service is working",
        "service": "AI-powered lesson generation",
        "endpoints": [
            "/generate-with-gpt4 - Generate lessons using GPT-4",
            "/generate - Generate lessons using NLP processor",
            "/test - This test endpoint"
        ],
        "status": "healthy"
    }

@router.post("/generate-with-gpt4")
async def generate_lesson_with_gpt4(
    topic: str,
    cefr_level: str = "A1",
    lesson_type: str = "vocabulary",
    duration_minutes: int = 15
):
    """Generate a complete lesson using GPT-4"""

    try:
        # Initialize OpenAI client
        api_key = os.getenv("OPENAI_API_KEY")
        print(f"OpenAI API Key present: {bool(api_key)}")

        if not api_key:
            raise HTTPException(status_code=500, detail="OpenAI API key not configured")

        client = OpenAI(api_key=api_key)
        print("OpenAI client initialized successfully")

        # Create GPT-4 prompt for lesson generation
        prompt = f"""
        Create a comprehensive Turkish language lesson with the following specifications:

        Topic: {topic}
        CEFR Level: {cefr_level}
        Lesson Type: {lesson_type}
        Duration: {duration_minutes} minutes

        Please generate a lesson that includes:
        1. Lesson title and description
        2. Learning objectives (3-5 objectives)
        3. Vocabulary list (10-15 words with Turkish and English)
        4. Grammar rules (if applicable)
        5. Example sentences (5-10 sentences)
        6. Practice exercises (5 different types)
        7. Cultural notes (2-3 interesting facts)

        Format the response as JSON with the following structure:
        {{
            "title": "lesson title",
            "description": "lesson description",
            "objectives": ["objective1", "objective2", ...],
            "vocabulary": [
                {{"turkish": "word", "english": "translation", "pronunciation": "phonetic"}},
                ...
            ],
            "grammar_rules": [
                {{"rule": "grammar rule", "explanation": "explanation", "examples": ["example1", "example2"]}},
                ...
            ],
            "example_sentences": [
                {{"turkish": "sentence", "english": "translation"}},
                ...
            ],
            "exercises": [
                {{
                    "type": "multiple_choice",
                    "question": "question",
                    "options": ["option1", "option2", "option3", "option4"],
                    "correct_answer": "correct option",
                    "explanation": "why this is correct"
                }},
                ...
            ],
            "cultural_notes": ["note1", "note2", ...]
        }}

        Make sure all content is appropriate for {cefr_level} level learners and focuses on practical, everyday Turkish.
        """

        # Generate lesson content using GPT-4
        print("Making GPT-4 API call...")
        response = client.chat.completions.create(
            model="gpt-4",
            messages=[
                {"role": "system", "content": "You are an expert Turkish language teacher and curriculum designer. Create engaging, educational content that follows CEFR standards."},
                {"role": "user", "content": prompt}
            ],
            temperature=0.7,
            max_tokens=2000
        )
        print("GPT-4 API call completed successfully")

        # Parse the response
        lesson_content = response.choices[0].message.content

        # Try to parse as JSON, fallback to text if needed
        try:
            # Clean the response - sometimes GPT-4 adds markdown formatting
            cleaned_content = lesson_content.strip()
            if cleaned_content.startswith('```json'):
                cleaned_content = cleaned_content[7:]
            if cleaned_content.endswith('```'):
                cleaned_content = cleaned_content[:-3]
            cleaned_content = cleaned_content.strip()

            lesson_data = json.loads(cleaned_content)

            # Validate that we have the expected structure
            if not isinstance(lesson_data, dict) or 'title' not in lesson_data:
                raise json.JSONDecodeError("Invalid lesson structure", "", 0)

        except json.JSONDecodeError as e:
            # If JSON parsing fails, return structured text response
            lesson_data = {
                "title": f"{topic} - {cefr_level} Level",
                "description": f"AI-generated lesson about {topic}",
                "content": lesson_content,
                "generated_with": "GPT-4",
                "status": "success_text_format",
                "parse_error": str(e),
                "note": "Content generated successfully but not in JSON format. This is normal for complex lessons."
            }

        return {
            "message": "Lesson generated successfully with GPT-4",
            "lesson": lesson_data,
            "metadata": {
                "topic": topic,
                "cefr_level": cefr_level,
                "lesson_type": lesson_type,
                "duration_minutes": duration_minutes,
                "generated_with": "GPT-4",
                "tokens_used": response.usage.total_tokens if hasattr(response, 'usage') else None
            },
            "status": "success"
        }

    except Exception as e:
        print(f"Error in lesson generation: {str(e)}")
        print(f"Error type: {type(e)}")
        import traceback
        print(f"Traceback: {traceback.format_exc()}")
        raise HTTPException(status_code=500, detail=f"Lesson generation failed: {str(e)}")

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
