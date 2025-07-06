from fastapi import APIRouter, HTTPException, Depends
from typing import List, Dict, Any
import os
import json
from openai import OpenAI

from app.models.content import (
    TeacherLessonRequest,
    GeneratedLesson,
    CEFRLevel,
    LessonType,
    VocabularyItem,
    GrammarRule,
    Exercise
)

router = APIRouter()

@router.post("/create-lesson")
async def create_teacher_lesson(request: TeacherLessonRequest):
    """Create a comprehensive lesson based on teacher specifications"""
    
    try:
        # Initialize OpenAI client
        api_key = os.getenv("OPENAI_API_KEY")
        if not api_key:
            raise HTTPException(status_code=500, detail="OpenAI API key not configured")
            
        client = OpenAI(api_key=api_key)
        
        # Create detailed lesson generation prompt
        prompt = f"""
        Create a comprehensive Turkish language lesson based on these teacher specifications:
        
        Lesson Requirements:
        - Title: {request.title}
        - Topic: {request.topic}
        - Target Level: {request.target_level}
        - Lesson Type: {request.lesson_type}
        - Duration: {request.duration_minutes} minutes
        - Learning Objectives: {', '.join(request.learning_objectives)}
        
        Content Requirements:
        - Include Exercises: {request.include_exercises} (Count: {request.exercise_count})
        - Include Vocabulary: {request.include_vocabulary} (Count: {request.vocabulary_count})
        - Include Grammar: {request.include_grammar}
        - Cultural Context: {request.cultural_context}
        
        Create a detailed, professional lesson that:
        1. Meets all specified requirements
        2. Is pedagogically sound and engaging
        3. Includes clear learning objectives and outcomes
        4. Provides structured content progression
        5. Includes assessment opportunities
        6. Is appropriate for the target CEFR level
        
        Format the response as JSON:
        {{
            "lesson": {{
                "title": "{request.title}",
                "description": "comprehensive lesson description",
                "objectives": {request.learning_objectives},
                "content_structure": {{
                    "introduction": "lesson introduction content",
                    "main_content": "detailed main lesson content",
                    "practice_activities": "practice activities description",
                    "conclusion": "lesson wrap-up and review"
                }},
                "vocabulary": [
                    {{"turkish": "word", "english": "translation", "pronunciation": "phonetic", "usage_example": "example sentence"}},
                    ...
                ],
                "grammar_rules": [
                    {{"rule": "grammar rule", "explanation": "detailed explanation", "examples": ["example1", "example2"], "practice_tips": "tips for practice"}},
                    ...
                ],
                "exercises": [
                    {{
                        "type": "exercise_type",
                        "title": "exercise title",
                        "instructions": "clear instructions",
                        "content": {{"question": "question", "options": ["opt1", "opt2", "opt3", "opt4"]}},
                        "correct_answer": "correct answer",
                        "explanation": "why this is correct",
                        "difficulty": "{request.target_level}",
                        "estimated_time": 3
                    }},
                    ...
                ],
                "cultural_notes": ["cultural note1", "cultural note2", ...],
                "teaching_tips": ["tip1", "tip2", ...],
                "assessment_methods": ["method1", "method2", ...],
                "homework_suggestions": ["suggestion1", "suggestion2", ...],
                "additional_resources": ["resource1", "resource2", ...]
            }},
            "lesson_metadata": {{
                "estimated_duration": {request.duration_minutes},
                "difficulty_level": "{request.target_level}",
                "lesson_type": "{request.lesson_type}",
                "skill_focus": ["vocabulary", "grammar", "reading", "speaking"],
                "preparation_time": "15 minutes",
                "materials_needed": ["whiteboard", "handouts", "audio equipment"]
            }}
        }}
        
        Ensure the lesson is comprehensive, engaging, and meets professional teaching standards.
        """
        
        print("Creating teacher lesson with GPT-4...")
        response = client.chat.completions.create(
            model="gpt-4",
            messages=[
                {"role": "system", "content": "You are an expert Turkish language curriculum designer and teacher trainer. Create professional, comprehensive lessons that meet educational standards."},
                {"role": "user", "content": prompt}
            ],
            temperature=0.6,
            max_tokens=4000
        )
        print("Teacher lesson creation completed successfully")
        
        # Parse the response
        content = response.choices[0].message.content
        
        try:
            lesson_data = json.loads(content)
        except json.JSONDecodeError:
            # Create structured lesson if parsing fails
            lesson_data = {
                "lesson": {
                    "title": request.title,
                    "description": f"Comprehensive {request.lesson_type} lesson on {request.topic}",
                    "objectives": request.learning_objectives,
                    "content_structure": {
                        "introduction": f"Introduction to {request.topic}",
                        "main_content": f"Detailed exploration of {request.topic}",
                        "practice_activities": "Interactive practice exercises",
                        "conclusion": "Review and assessment"
                    },
                    "vocabulary": [],
                    "grammar_rules": [],
                    "exercises": [],
                    "cultural_notes": [],
                    "teaching_tips": ["Use visual aids", "Encourage participation"],
                    "assessment_methods": ["Oral questions", "Written exercises"],
                    "homework_suggestions": ["Practice vocabulary", "Complete exercises"],
                    "additional_resources": ["Online materials", "Reference books"]
                },
                "lesson_metadata": {
                    "estimated_duration": request.duration_minutes,
                    "difficulty_level": request.target_level,
                    "lesson_type": request.lesson_type,
                    "skill_focus": ["vocabulary", "grammar"],
                    "preparation_time": "15 minutes",
                    "materials_needed": ["whiteboard", "handouts"]
                }
            }
        
        return {
            "created_lesson": lesson_data,
            "teacher_request": {
                "title": request.title,
                "topic": request.topic,
                "target_level": request.target_level,
                "lesson_type": request.lesson_type,
                "duration_minutes": request.duration_minutes
            }
        }
        
    except Exception as e:
        print(f"Error in teacher lesson creation: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Teacher lesson creation failed: {str(e)}")

@router.post("/generate-lesson-plan")
async def generate_lesson_plan(
    topic: str,
    target_level: CEFRLevel,
    duration_minutes: int,
    class_size: int = 20,
    student_needs: List[str] = None
):
    """Generate a detailed lesson plan for teachers"""
    
    try:
        # Initialize OpenAI client
        api_key = os.getenv("OPENAI_API_KEY")
        if not api_key:
            raise HTTPException(status_code=500, detail="OpenAI API key not configured")
            
        client = OpenAI(api_key=api_key)
        
        student_needs_str = ', '.join(student_needs) if student_needs else "general language learning"
        
        prompt = f"""
        Create a detailed lesson plan for Turkish language teachers:
        
        Lesson Information:
        - Topic: {topic}
        - Target Level: {target_level}
        - Duration: {duration_minutes} minutes
        - Class Size: {class_size} students
        - Student Needs: {student_needs_str}
        
        Create a comprehensive lesson plan that includes:
        1. Clear timing for each activity
        2. Detailed teacher instructions
        3. Student interaction patterns
        4. Materials and resources needed
        5. Assessment strategies
        6. Differentiation for different learning styles
        
        Format as JSON:
        {{
            "lesson_plan": {{
                "title": "lesson title",
                "overview": "brief lesson overview",
                "objectives": ["objective1", "objective2", ...],
                "materials": ["material1", "material2", ...],
                "lesson_stages": [
                    {{
                        "stage": "Warm-up",
                        "duration": 5,
                        "activities": ["activity1", "activity2"],
                        "teacher_instructions": "detailed instructions for teacher",
                        "student_interaction": "how students participate",
                        "materials_used": ["material1"]
                    }},
                    {{
                        "stage": "Presentation",
                        "duration": 15,
                        "activities": ["activity1", "activity2"],
                        "teacher_instructions": "detailed instructions",
                        "student_interaction": "student participation",
                        "materials_used": ["material1", "material2"]
                    }},
                    {{
                        "stage": "Practice",
                        "duration": 20,
                        "activities": ["activity1", "activity2"],
                        "teacher_instructions": "practice instructions",
                        "student_interaction": "practice patterns",
                        "materials_used": ["materials"]
                    }},
                    {{
                        "stage": "Production",
                        "duration": 10,
                        "activities": ["activity1"],
                        "teacher_instructions": "production instructions",
                        "student_interaction": "student production",
                        "materials_used": ["materials"]
                    }},
                    {{
                        "stage": "Wrap-up",
                        "duration": 5,
                        "activities": ["review", "homework"],
                        "teacher_instructions": "closing instructions",
                        "student_interaction": "final participation",
                        "materials_used": []
                    }}
                ],
                "assessment": {{
                    "formative": ["method1", "method2"],
                    "summative": ["method1", "method2"],
                    "criteria": ["criteria1", "criteria2"]
                }},
                "differentiation": {{
                    "visual_learners": ["strategy1", "strategy2"],
                    "auditory_learners": ["strategy1", "strategy2"],
                    "kinesthetic_learners": ["strategy1", "strategy2"],
                    "advanced_students": ["extension1", "extension2"],
                    "struggling_students": ["support1", "support2"]
                }},
                "homework": ["assignment1", "assignment2"],
                "reflection_questions": ["question1", "question2"]
            }}
        }}
        """
        
        response = client.chat.completions.create(
            model="gpt-4",
            messages=[
                {"role": "system", "content": "You are an expert Turkish language teacher trainer. Create detailed, practical lesson plans that teachers can implement effectively."},
                {"role": "user", "content": prompt}
            ],
            temperature=0.5,
            max_tokens=3000
        )
        
        # Parse the response
        content = response.choices[0].message.content
        
        try:
            plan_data = json.loads(content)
        except json.JSONDecodeError:
            # Create basic lesson plan if parsing fails
            plan_data = {
                "lesson_plan": {
                    "title": f"Turkish Lesson: {topic}",
                    "overview": f"Comprehensive lesson on {topic} for {target_level} level",
                    "objectives": [f"Learn about {topic}", "Practice new vocabulary"],
                    "materials": ["Whiteboard", "Handouts", "Audio equipment"],
                    "lesson_stages": [
                        {
                            "stage": "Warm-up",
                            "duration": 5,
                            "activities": ["Greeting", "Review previous lesson"],
                            "teacher_instructions": "Greet students and review",
                            "student_interaction": "Respond to questions",
                            "materials_used": []
                        },
                        {
                            "stage": "Main Content",
                            "duration": duration_minutes - 10,
                            "activities": ["Present new material", "Practice exercises"],
                            "teacher_instructions": "Present and guide practice",
                            "student_interaction": "Listen and participate",
                            "materials_used": ["Handouts"]
                        },
                        {
                            "stage": "Wrap-up",
                            "duration": 5,
                            "activities": ["Review", "Assign homework"],
                            "teacher_instructions": "Summarize and assign",
                            "student_interaction": "Ask questions",
                            "materials_used": []
                        }
                    ],
                    "assessment": {
                        "formative": ["Observation", "Questions"],
                        "summative": ["Quiz", "Homework"],
                        "criteria": ["Accuracy", "Participation"]
                    },
                    "differentiation": {
                        "visual_learners": ["Use visual aids"],
                        "auditory_learners": ["Use audio materials"],
                        "kinesthetic_learners": ["Include movement"],
                        "advanced_students": ["Extra challenges"],
                        "struggling_students": ["Additional support"]
                    },
                    "homework": ["Practice exercises", "Vocabulary review"],
                    "reflection_questions": ["What worked well?", "What could be improved?"]
                }
            }
        
        return {
            "lesson_plan": plan_data,
            "plan_info": {
                "topic": topic,
                "target_level": target_level,
                "duration": duration_minutes,
                "class_size": class_size
            }
        }
        
    except Exception as e:
        print(f"Error in lesson plan generation: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Lesson plan generation failed: {str(e)}")

@router.post("/suggest-teaching-strategies")
async def suggest_teaching_strategies(
    lesson_type: LessonType,
    target_level: CEFRLevel,
    student_challenges: List[str],
    class_context: str = "general"
):
    """Suggest effective teaching strategies for specific contexts"""
    
    try:
        # Initialize OpenAI client
        api_key = os.getenv("OPENAI_API_KEY")
        if not api_key:
            raise HTTPException(status_code=500, detail="OpenAI API key not configured")
            
        client = OpenAI(api_key=api_key)
        
        prompt = f"""
        Suggest effective teaching strategies for Turkish language instruction:
        
        Context:
        - Lesson Type: {lesson_type}
        - Target Level: {target_level}
        - Student Challenges: {', '.join(student_challenges)}
        - Class Context: {class_context}
        
        Provide specific, actionable teaching strategies that address the challenges and optimize learning.
        
        Format as JSON:
        {{
            "strategies": {{
                "engagement_techniques": ["technique1", "technique2", ...],
                "difficulty_management": ["strategy1", "strategy2", ...],
                "skill_development": ["method1", "method2", ...],
                "assessment_approaches": ["approach1", "approach2", ...],
                "technology_integration": ["tool1", "tool2", ...],
                "cultural_integration": ["method1", "method2", ...]
            }},
            "challenge_solutions": {{
                "challenge1": ["solution1", "solution2"],
                "challenge2": ["solution1", "solution2"]
            }},
            "best_practices": ["practice1", "practice2", ...],
            "common_pitfalls": ["pitfall1", "pitfall2", ...],
            "success_indicators": ["indicator1", "indicator2", ...]
        }}
        """
        
        response = client.chat.completions.create(
            model="gpt-4",
            messages=[
                {"role": "system", "content": "You are an expert Turkish language pedagogy specialist. Provide practical, evidence-based teaching strategies."},
                {"role": "user", "content": prompt}
            ],
            temperature=0.4,
            max_tokens=2000
        )
        
        # Parse the response
        content = response.choices[0].message.content
        
        try:
            strategies_data = json.loads(content)
        except json.JSONDecodeError:
            # Create basic strategies if parsing fails
            strategies_data = {
                "strategies": {
                    "engagement_techniques": ["Use interactive activities", "Include games"],
                    "difficulty_management": ["Scaffold learning", "Provide support"],
                    "skill_development": ["Practice regularly", "Use varied exercises"],
                    "assessment_approaches": ["Formative assessment", "Peer evaluation"],
                    "technology_integration": ["Use multimedia", "Online resources"],
                    "cultural_integration": ["Include cultural context", "Real-world examples"]
                },
                "challenge_solutions": {
                    challenge: ["Provide extra practice", "Use alternative methods"]
                    for challenge in student_challenges
                },
                "best_practices": ["Clear objectives", "Regular feedback", "Student engagement"],
                "common_pitfalls": ["Too much grammar", "Lack of practice", "No cultural context"],
                "success_indicators": ["Student participation", "Improved accuracy", "Confidence"]
            }
        
        return {
            "teaching_strategies": strategies_data,
            "context_info": {
                "lesson_type": lesson_type,
                "target_level": target_level,
                "student_challenges": student_challenges,
                "class_context": class_context
            }
        }
        
    except Exception as e:
        print(f"Error in teaching strategy suggestion: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Teaching strategy suggestion failed: {str(e)}")
