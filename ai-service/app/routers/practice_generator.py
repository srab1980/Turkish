from fastapi import APIRouter, HTTPException, Depends
from typing import List, Dict, Any
import os
import json
from openai import OpenAI

from app.models.content import (
    ExerciseGenerationRequest,
    PracticeExercise,
    CEFRLevel,
    VocabularyItem,
    GrammarRule
)

router = APIRouter()

@router.post("/generate-practice-exercises")
async def generate_practice_exercises(request: ExerciseGenerationRequest):
    """Generate additional practice exercises based on lesson content and student needs"""
    
    try:
        # Initialize OpenAI client
        api_key = os.getenv("OPENAI_API_KEY")
        if not api_key:
            raise HTTPException(status_code=500, detail="OpenAI API key not configured")
            
        client = OpenAI(api_key=api_key)
        
        # Create exercise generation prompt
        prompt = f"""
        Generate {request.count} practice exercises for Turkish language learning based on:
        
        Lesson Content:
        {request.lesson_content[:1000]}...
        
        Exercise Requirements:
        - Types: {', '.join(request.exercise_types)}
        - Difficulty Level: {request.difficulty_level}
        - Student Weak Areas: {', '.join(request.student_weak_areas)}
        - Count: {request.count}
        
        Create diverse, engaging exercises that:
        1. Reinforce the lesson content
        2. Address student weak areas
        3. Are appropriate for the difficulty level
        4. Include clear instructions and feedback
        5. Provide meaningful practice opportunities
        
        Available exercise types:
        - multiple_choice: Multiple choice questions
        - fill_in_blank: Fill in the missing words
        - matching: Match Turkish words with English translations
        - sentence_building: Build sentences from given words
        - translation: Translate sentences between Turkish and English
        - pronunciation: Pronunciation practice exercises
        - listening_comprehension: Audio-based exercises
        - reading_comprehension: Reading passages with questions
        - grammar_practice: Grammar rule application
        - vocabulary_drill: Vocabulary memorization and recall
        
        Format the response as JSON:
        {{
            "exercises": [
                {{
                    "type": "exercise_type",
                    "title": "exercise title",
                    "instructions": "clear instructions for the student",
                    "content": {{
                        "question": "main question or prompt",
                        "options": ["option1", "option2", "option3", "option4"],
                        "context": "additional context if needed",
                        "audio_url": "optional audio file URL",
                        "image_url": "optional image URL"
                    }},
                    "correct_answers": {{
                        "answer": "correct answer",
                        "alternatives": ["alternative1", "alternative2"],
                        "explanation": "why this is correct"
                    }},
                    "hints": ["hint1", "hint2", ...],
                    "difficulty_level": "{request.difficulty_level}",
                    "estimated_time": 3,
                    "skill_focus": ["vocabulary", "grammar", "reading"],
                    "feedback": {{
                        "correct": "positive feedback for correct answer",
                        "incorrect": "helpful feedback for incorrect answer"
                    }}
                }},
                ...
            ],
            "exercise_summary": {{
                "total_exercises": {request.count},
                "skill_distribution": {{"vocabulary": 40, "grammar": 30, "reading": 30}},
                "difficulty_progression": "description of how exercises progress",
                "estimated_total_time": 15
            }}
        }}
        
        Focus especially on: {', '.join(request.student_weak_areas)}
        """
        
        print("Generating practice exercises with GPT-4...")
        response = client.chat.completions.create(
            model="gpt-4",
            messages=[
                {"role": "system", "content": "You are an expert Turkish language exercise designer. Create engaging, educational practice exercises that help students improve their skills."},
                {"role": "user", "content": prompt}
            ],
            temperature=0.7,
            max_tokens=3000
        )
        print("Practice exercise generation completed successfully")
        
        # Parse the response
        content = response.choices[0].message.content
        
        try:
            exercises_data = json.loads(content)
        except json.JSONDecodeError:
            # Create basic exercises if parsing fails
            exercises_data = {
                "exercises": [
                    {
                        "type": "multiple_choice",
                        "title": f"Practice Exercise {i+1}",
                        "instructions": "Choose the correct answer",
                        "content": {
                            "question": f"Practice question {i+1}",
                            "options": ["Option A", "Option B", "Option C", "Option D"]
                        },
                        "correct_answers": {
                            "answer": "Option A",
                            "explanation": "This is the correct answer"
                        },
                        "hints": ["Think about the context"],
                        "difficulty_level": request.difficulty_level,
                        "estimated_time": 3,
                        "skill_focus": ["vocabulary"],
                        "feedback": {
                            "correct": "Well done!",
                            "incorrect": "Try again, think about the meaning"
                        }
                    }
                    for i in range(request.count)
                ],
                "exercise_summary": {
                    "total_exercises": request.count,
                    "skill_distribution": {"vocabulary": 50, "grammar": 30, "reading": 20},
                    "difficulty_progression": "Exercises progress from basic to advanced",
                    "estimated_total_time": request.count * 3
                }
            }
        
        return {
            "practice_exercises": exercises_data,
            "generation_info": {
                "lesson_content_length": len(request.lesson_content),
                "target_weak_areas": request.student_weak_areas,
                "difficulty_level": request.difficulty_level,
                "exercise_types": request.exercise_types
            }
        }
        
    except Exception as e:
        print(f"Error in practice exercise generation: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Practice exercise generation failed: {str(e)}")

@router.post("/generate-vocabulary-drills")
async def generate_vocabulary_drills(
    vocabulary_list: List[VocabularyItem],
    drill_types: List[str],
    difficulty_level: CEFRLevel,
    count: int = 10
):
    """Generate vocabulary-specific practice drills"""
    
    try:
        # Initialize OpenAI client
        api_key = os.getenv("OPENAI_API_KEY")
        if not api_key:
            raise HTTPException(status_code=500, detail="OpenAI API key not configured")
            
        client = OpenAI(api_key=api_key)
        
        # Prepare vocabulary data
        vocab_data = []
        for item in vocabulary_list:
            vocab_data.append({
                "turkish": item.turkish,
                "english": item.english,
                "pronunciation": item.pronunciation
            })
        
        prompt = f"""
        Create {count} vocabulary drill exercises using these Turkish words:
        
        Vocabulary List:
        {json.dumps(vocab_data, indent=2)}
        
        Drill Types: {', '.join(drill_types)}
        Difficulty Level: {difficulty_level}
        
        Create engaging vocabulary drills that help students memorize and use these words effectively.
        
        Available drill types:
        - flashcard: Traditional flashcard-style practice
        - word_association: Associate words with images or concepts
        - context_usage: Use words in meaningful sentences
        - synonym_antonym: Find related or opposite words
        - pronunciation_drill: Practice correct pronunciation
        - spelling_practice: Practice correct spelling
        - definition_matching: Match words with definitions
        - sentence_completion: Complete sentences with correct words
        
        Format as JSON:
        {{
            "drills": [
                {{
                    "type": "drill_type",
                    "title": "drill title",
                    "instructions": "clear instructions",
                    "content": {{
                        "target_word": "turkish_word",
                        "prompt": "drill prompt",
                        "options": ["option1", "option2", ...],
                        "context": "usage context"
                    }},
                    "correct_answer": "correct answer",
                    "feedback": "explanatory feedback",
                    "difficulty": "{difficulty_level}",
                    "estimated_time": 2
                }},
                ...
            ],
            "drill_summary": {{
                "vocabulary_covered": {len(vocabulary_list)},
                "drill_types_used": {drill_types},
                "total_time": {count * 2}
            }}
        }}
        """
        
        response = client.chat.completions.create(
            model="gpt-4",
            messages=[
                {"role": "system", "content": "You are an expert in vocabulary acquisition and drill design for Turkish language learning."},
                {"role": "user", "content": prompt}
            ],
            temperature=0.6,
            max_tokens=2500
        )
        
        # Parse the response
        content = response.choices[0].message.content
        
        try:
            drills_data = json.loads(content)
        except json.JSONDecodeError:
            # Create basic drills if parsing fails
            drills_data = {
                "drills": [
                    {
                        "type": "flashcard",
                        "title": f"Vocabulary Drill {i+1}",
                        "instructions": "Choose the correct translation",
                        "content": {
                            "target_word": vocab_data[i % len(vocab_data)]["turkish"] if vocab_data else "word",
                            "prompt": "What does this word mean?",
                            "options": ["Option A", "Option B", "Option C", "Option D"]
                        },
                        "correct_answer": vocab_data[i % len(vocab_data)]["english"] if vocab_data else "translation",
                        "feedback": "Good job!",
                        "difficulty": difficulty_level,
                        "estimated_time": 2
                    }
                    for i in range(count)
                ],
                "drill_summary": {
                    "vocabulary_covered": len(vocabulary_list),
                    "drill_types_used": drill_types,
                    "total_time": count * 2
                }
            }
        
        return {
            "vocabulary_drills": drills_data,
            "vocabulary_info": {
                "word_count": len(vocabulary_list),
                "difficulty_level": difficulty_level,
                "drill_types": drill_types
            }
        }
        
    except Exception as e:
        print(f"Error in vocabulary drill generation: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Vocabulary drill generation failed: {str(e)}")

@router.post("/generate-grammar-exercises")
async def generate_grammar_exercises(
    grammar_rules: List[GrammarRule],
    exercise_types: List[str],
    difficulty_level: CEFRLevel,
    count: int = 8
):
    """Generate grammar-specific practice exercises"""
    
    try:
        # Initialize OpenAI client
        api_key = os.getenv("OPENAI_API_KEY")
        if not api_key:
            raise HTTPException(status_code=500, detail="OpenAI API key not configured")
            
        client = OpenAI(api_key=api_key)
        
        # Prepare grammar data
        grammar_data = []
        for rule in grammar_rules:
            grammar_data.append({
                "title": rule.title,
                "explanation": rule.explanation,
                "examples": rule.examples,
                "category": rule.category
            })
        
        prompt = f"""
        Create {count} grammar practice exercises based on these Turkish grammar rules:
        
        Grammar Rules:
        {json.dumps(grammar_data, indent=2)}
        
        Exercise Types: {', '.join(exercise_types)}
        Difficulty Level: {difficulty_level}
        
        Create exercises that help students understand and apply these grammar rules correctly.
        
        Available exercise types:
        - rule_application: Apply grammar rules to sentences
        - error_correction: Find and correct grammar mistakes
        - sentence_transformation: Transform sentences using grammar rules
        - pattern_recognition: Identify grammar patterns
        - conjugation_practice: Practice verb conjugations
        - case_usage: Practice Turkish case system
        - word_order: Practice correct Turkish word order
        - tense_practice: Practice different tenses
        
        Format as JSON:
        {{
            "exercises": [
                {{
                    "type": "exercise_type",
                    "title": "exercise title",
                    "grammar_focus": "specific grammar rule",
                    "instructions": "clear instructions",
                    "content": {{
                        "sentence": "example sentence",
                        "task": "what student needs to do",
                        "options": ["option1", "option2", ...],
                        "context": "grammatical context"
                    }},
                    "correct_answer": "correct answer",
                    "explanation": "grammar explanation",
                    "difficulty": "{difficulty_level}",
                    "estimated_time": 4
                }},
                ...
            ],
            "exercise_summary": {{
                "grammar_rules_covered": {len(grammar_rules)},
                "exercise_types_used": {exercise_types},
                "total_time": {count * 4}
            }}
        }}
        """
        
        response = client.chat.completions.create(
            model="gpt-4",
            messages=[
                {"role": "system", "content": "You are an expert Turkish grammar instructor. Create clear, effective grammar exercises."},
                {"role": "user", "content": prompt}
            ],
            temperature=0.5,
            max_tokens=2500
        )
        
        # Parse the response
        content = response.choices[0].message.content
        
        try:
            exercises_data = json.loads(content)
        except json.JSONDecodeError:
            # Create basic exercises if parsing fails
            exercises_data = {
                "exercises": [
                    {
                        "type": "rule_application",
                        "title": f"Grammar Exercise {i+1}",
                        "grammar_focus": grammar_data[i % len(grammar_data)]["title"] if grammar_data else "Grammar rule",
                        "instructions": "Apply the grammar rule correctly",
                        "content": {
                            "sentence": "Example sentence",
                            "task": "Complete the sentence",
                            "options": ["Option A", "Option B", "Option C"]
                        },
                        "correct_answer": "Option A",
                        "explanation": "Grammar explanation",
                        "difficulty": difficulty_level,
                        "estimated_time": 4
                    }
                    for i in range(count)
                ],
                "exercise_summary": {
                    "grammar_rules_covered": len(grammar_rules),
                    "exercise_types_used": exercise_types,
                    "total_time": count * 4
                }
            }
        
        return {
            "grammar_exercises": exercises_data,
            "grammar_info": {
                "rules_count": len(grammar_rules),
                "difficulty_level": difficulty_level,
                "exercise_types": exercise_types
            }
        }
        
    except Exception as e:
        print(f"Error in grammar exercise generation: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Grammar exercise generation failed: {str(e)}")
