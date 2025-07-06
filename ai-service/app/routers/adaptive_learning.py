from fastapi import APIRouter, HTTPException, Depends
from typing import List, Dict, Any
import os
import json
from openai import OpenAI

from app.models.content import (
    AdaptiveLessonRequest,
    StudentProgress,
    GeneratedLesson,
    CEFRLevel,
    LessonType,
    VocabularyItem,
    GrammarRule,
    Exercise
)

router = APIRouter()

@router.post("/generate-adaptive-lesson")
async def generate_adaptive_lesson(request: AdaptiveLessonRequest):
    """Generate a personalized lesson based on student progress and weak areas"""
    
    try:
        # Initialize OpenAI client
        api_key = os.getenv("OPENAI_API_KEY")
        if not api_key:
            raise HTTPException(status_code=500, detail="OpenAI API key not configured")
            
        client = OpenAI(api_key=api_key)
        
        # Create adaptive prompt based on student data
        prompt = f"""
        Create a personalized Turkish lesson for a student with the following profile:
        - Target Level: {request.target_level}
        - Lesson Type: {request.lesson_type}
        - Duration: {request.duration_minutes} minutes
        - Focus Areas (student needs improvement): {', '.join(request.focus_areas)}
        - Difficulty Adjustment: {request.difficulty_adjustment} (-1.0 easier, 0.0 normal, 1.0 harder)
        
        The lesson should specifically address the student's weak areas while reinforcing their learning.
        Adjust the difficulty based on the difficulty_adjustment parameter.
        
        Create content that is:
        1. Targeted to their specific needs
        2. Appropriately challenging but not overwhelming
        3. Includes extra practice in their weak areas
        4. Builds confidence through achievable goals
        
        Format the response as JSON with the following structure:
        {{
            "title": "lesson title",
            "description": "lesson description tailored to student needs",
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
                    "explanation": "why this is correct",
                    "focus_area": "vocabulary/grammar/reading/etc"
                }},
                ...
            ],
            "adaptive_notes": "Notes on how this lesson addresses the student's specific needs",
            "next_steps": ["suggestion1", "suggestion2", ...]
        }}
        
        Ensure the lesson is specifically adapted to help with: {', '.join(request.focus_areas)}
        """
        
        print("Generating adaptive lesson with GPT-4...")
        response = client.chat.completions.create(
            model="gpt-4",
            messages=[
                {"role": "system", "content": "You are an expert Turkish language teacher specializing in adaptive learning. Create personalized lessons that address individual student needs and learning patterns."},
                {"role": "user", "content": prompt}
            ],
            temperature=0.7,
            max_tokens=2500
        )
        print("Adaptive lesson generation completed successfully")
        
        # Parse the response
        content = response.choices[0].message.content
        
        try:
            lesson_data = json.loads(content)
        except json.JSONDecodeError:
            # If JSON parsing fails, create a structured response
            lesson_data = {
                "title": f"Adaptive {request.lesson_type.title()} Lesson",
                "description": f"Personalized lesson focusing on {', '.join(request.focus_areas)}",
                "objectives": [f"Improve {area}" for area in request.focus_areas],
                "vocabulary": [],
                "grammar_rules": [],
                "example_sentences": [],
                "exercises": [],
                "adaptive_notes": "Custom lesson generated for student needs",
                "next_steps": ["Continue practicing weak areas", "Review lesson content"]
            }
        
        return {
            "lesson": lesson_data,
            "student_id": request.student_id,
            "adaptation_info": {
                "focus_areas": request.focus_areas,
                "difficulty_adjustment": request.difficulty_adjustment,
                "target_level": request.target_level
            }
        }
        
    except Exception as e:
        print(f"Error in adaptive lesson generation: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Adaptive lesson generation failed: {str(e)}")

@router.post("/analyze-student-progress")
async def analyze_student_progress(progress_data: List[StudentProgress]):
    """Analyze student progress and recommend next learning steps"""
    
    try:
        # Initialize OpenAI client
        api_key = os.getenv("OPENAI_API_KEY")
        if not api_key:
            raise HTTPException(status_code=500, detail="OpenAI API key not configured")
            
        client = OpenAI(api_key=api_key)
        
        # Aggregate progress data
        total_lessons = len(progress_data)
        avg_completion = sum(p.completion_rate for p in progress_data) / total_lessons if total_lessons > 0 else 0
        avg_accuracy = sum(p.accuracy_score for p in progress_data) / total_lessons if total_lessons > 0 else 0
        
        # Collect weak and strong areas
        all_weak_areas = []
        all_strong_areas = []
        for progress in progress_data:
            all_weak_areas.extend(progress.weak_areas)
            all_strong_areas.extend(progress.strong_areas)
        
        # Count frequency of weak/strong areas
        weak_area_counts = {}
        strong_area_counts = {}
        
        for area in all_weak_areas:
            weak_area_counts[area] = weak_area_counts.get(area, 0) + 1
        
        for area in all_strong_areas:
            strong_area_counts[area] = strong_area_counts.get(area, 0) + 1
        
        # Create analysis prompt
        prompt = f"""
        Analyze this Turkish language student's learning progress and provide recommendations:
        
        Progress Summary:
        - Total lessons completed: {total_lessons}
        - Average completion rate: {avg_completion:.1%}
        - Average accuracy score: {avg_accuracy:.1%}
        
        Weak Areas (frequency):
        {json.dumps(weak_area_counts, indent=2)}
        
        Strong Areas (frequency):
        {json.dumps(strong_area_counts, indent=2)}
        
        Provide a comprehensive analysis and recommendations in JSON format:
        {{
            "overall_assessment": "brief overall assessment",
            "strengths": ["strength1", "strength2", ...],
            "areas_for_improvement": ["area1", "area2", ...],
            "recommended_focus": ["focus_area1", "focus_area2", ...],
            "suggested_lesson_types": ["type1", "type2", ...],
            "difficulty_recommendation": "easier/maintain/harder",
            "learning_path_suggestions": ["suggestion1", "suggestion2", ...],
            "motivational_message": "encouraging message for the student"
        }}
        """
        
        response = client.chat.completions.create(
            model="gpt-4",
            messages=[
                {"role": "system", "content": "You are an expert language learning analyst. Provide detailed, actionable insights about student progress."},
                {"role": "user", "content": prompt}
            ],
            temperature=0.3,
            max_tokens=1500
        )
        
        # Parse the response
        content = response.choices[0].message.content
        
        try:
            analysis = json.loads(content)
        except json.JSONDecodeError:
            analysis = {
                "overall_assessment": "Analysis completed",
                "strengths": list(strong_area_counts.keys())[:3],
                "areas_for_improvement": list(weak_area_counts.keys())[:3],
                "recommended_focus": list(weak_area_counts.keys())[:2],
                "suggested_lesson_types": ["vocabulary", "grammar"],
                "difficulty_recommendation": "maintain",
                "learning_path_suggestions": ["Continue current pace", "Focus on weak areas"],
                "motivational_message": "Keep up the great work!"
            }
        
        return {
            "analysis": analysis,
            "progress_stats": {
                "total_lessons": total_lessons,
                "avg_completion": avg_completion,
                "avg_accuracy": avg_accuracy,
                "weak_area_counts": weak_area_counts,
                "strong_area_counts": strong_area_counts
            }
        }
        
    except Exception as e:
        print(f"Error in progress analysis: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Progress analysis failed: {str(e)}")

@router.post("/recommend-next-lesson")
async def recommend_next_lesson(
    student_id: str,
    current_level: CEFRLevel,
    completed_lessons: List[str],
    weak_areas: List[str]
):
    """Recommend the next best lesson for a student based on their progress"""
    
    try:
        # Initialize OpenAI client
        api_key = os.getenv("OPENAI_API_KEY")
        if not api_key:
            raise HTTPException(status_code=500, detail="OpenAI API key not configured")
            
        client = OpenAI(api_key=api_key)
        
        prompt = f"""
        Recommend the next lesson for a Turkish language student:
        
        Student Profile:
        - Current Level: {current_level}
        - Completed Lessons: {len(completed_lessons)} lessons
        - Weak Areas: {', '.join(weak_areas)}
        
        Based on this information, recommend the next lesson that would be most beneficial.
        Consider:
        1. Addressing weak areas
        2. Appropriate difficulty progression
        3. Skill balance (vocabulary, grammar, reading, etc.)
        4. Student engagement
        
        Provide recommendation in JSON format:
        {{
            "recommended_lesson_type": "vocabulary/grammar/reading/etc",
            "topic": "specific topic to cover",
            "difficulty_level": "A1/A2/B1/etc",
            "focus_areas": ["area1", "area2", ...],
            "rationale": "why this lesson is recommended",
            "learning_objectives": ["objective1", "objective2", ...],
            "estimated_duration": 15
        }}
        """
        
        response = client.chat.completions.create(
            model="gpt-4",
            messages=[
                {"role": "system", "content": "You are an expert Turkish language curriculum designer. Recommend optimal learning sequences."},
                {"role": "user", "content": prompt}
            ],
            temperature=0.5,
            max_tokens=1000
        )
        
        # Parse the response
        content = response.choices[0].message.content
        
        try:
            recommendation = json.loads(content)
        except json.JSONDecodeError:
            recommendation = {
                "recommended_lesson_type": "vocabulary",
                "topic": "Basic Turkish vocabulary",
                "difficulty_level": current_level,
                "focus_areas": weak_areas[:2] if weak_areas else ["vocabulary"],
                "rationale": "Recommended based on current progress",
                "learning_objectives": ["Learn new vocabulary", "Practice pronunciation"],
                "estimated_duration": 15
            }
        
        return {
            "recommendation": recommendation,
            "student_id": student_id
        }
        
    except Exception as e:
        print(f"Error in lesson recommendation: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Lesson recommendation failed: {str(e)}")
