from fastapi import APIRouter, HTTPException, Depends
from typing import List, Dict, Any
import os
import json
from openai import OpenAI
from pathlib import Path
# from docx import Document  # Temporarily disabled

from app.models.content import (
    CurriculumRequest,
    GeneratedCurriculum,
    CurriculumUnit,
    CEFRLevel,
    LessonType
)

router = APIRouter()

@router.get("/curriculum-data")
async def get_curriculum_data():
    """Load curriculum data from curriculum files and generate structured lessons"""

    try:
        # Initialize OpenAI client
        api_key = os.getenv("OPENAI_API_KEY")
        if not api_key:
            raise HTTPException(status_code=500, detail="OpenAI API key not configured")

        client = OpenAI(api_key=api_key)

        # Path to curriculum files
        curriculum_dir = Path("/app/Curriculum")
        if not curriculum_dir.exists():
            # Try alternative path for development
            curriculum_dir = Path("../Curriculum")
            if not curriculum_dir.exists():
                curriculum_dir = Path("../../Curriculum")

        curriculum_content = ""

        # Read curriculum files if they exist (temporarily disabled due to docx dependency)
        # for file_path in curriculum_dir.glob("*.docx"):
        #     try:
        #         doc = Document(file_path)
        #         file_content = "\n".join([paragraph.text for paragraph in doc.paragraphs if paragraph.text.strip()])
        #         curriculum_content += f"\n\n=== {file_path.name} ===\n{file_content}"
        #     except Exception as e:
        #         print(f"Error reading {file_path}: {e}")
        #         continue

        # If no curriculum files found, generate default curriculum
        if not curriculum_content.strip():
            curriculum_content = """
            Turkish A1 Level Curriculum

            Unit 1: Greetings and Introductions
            - Lesson 1: Basic Greetings (Merhaba, Günaydın, İyi akşamlar)
            - Lesson 2: Introducing Yourself (Benim adım..., Ben...)
            - Lesson 3: Asking Names and Basic Information

            Unit 2: Numbers and Time
            - Lesson 1: Numbers 1-20
            - Lesson 2: Numbers 21-100
            - Lesson 3: Telling Time

            Unit 3: Family and Relationships
            - Lesson 1: Family Members (Anne, baba, kardeş)
            - Lesson 2: Describing Family
            - Lesson 3: Relationships and Friends
            """

        # Generate structured curriculum using GPT-4
        prompt = f"""
        Based on the following Turkish curriculum content, create a structured JSON curriculum with units and lessons:

        {curriculum_content}

        Please create a comprehensive curriculum structure in JSON format:
        {{
            "title": "Turkish A1 Curriculum",
            "description": "Comprehensive A1 level Turkish language curriculum",
            "target_level": "A1",
            "units": [
                {{
                    "title": "Unit Title",
                    "description": "Unit description",
                    "lessons": [
                        {{
                            "title": "Lesson Title",
                            "description": "Lesson description",
                            "vocabulary": ["word1", "word2", ...],
                            "grammar_points": ["grammar point 1", ...],
                            "learning_objectives": ["objective 1", ...]
                        }}
                    ],
                    "estimated_hours": 3
                }}
            ],
            "total_lessons": 24,
            "estimated_duration": 36
        }}

        Make sure to include practical vocabulary, essential grammar, and clear learning objectives for each lesson.
        """

        response = client.chat.completions.create(
            model="gpt-4",
            messages=[
                {"role": "system", "content": "You are an expert Turkish language curriculum designer. Create structured, practical curricula based on provided content."},
                {"role": "user", "content": prompt}
            ],
            temperature=0.3,
            max_tokens=3000
        )

        # Parse the response
        content = response.choices[0].message.content

        try:
            curriculum_data = json.loads(content)
        except json.JSONDecodeError:
            # Fallback curriculum structure
            curriculum_data = {
                "title": "Turkish A1 Curriculum",
                "description": "Comprehensive A1 level Turkish language curriculum",
                "target_level": "A1",
                "units": [
                    {
                        "title": "Greetings and Introductions",
                        "description": "Learn basic Turkish greetings and how to introduce yourself",
                        "lessons": [
                            {
                                "title": "Basic Greetings",
                                "description": "Learn essential Turkish greetings",
                                "vocabulary": ["merhaba", "günaydın", "iyi akşamlar", "hoşça kal"],
                                "grammar_points": ["Basic sentence structure"],
                                "learning_objectives": ["Greet people in Turkish", "Say goodbye politely"]
                            },
                            {
                                "title": "Self Introduction",
                                "description": "Learn to introduce yourself in Turkish",
                                "vocabulary": ["benim adım", "ben", "yaşında", "yaşıyorum"],
                                "grammar_points": ["Personal pronouns", "Present tense 'to be'"],
                                "learning_objectives": ["Introduce yourself", "State your age and location"]
                            }
                        ],
                        "estimated_hours": 3
                    },
                    {
                        "title": "Numbers and Time",
                        "description": "Learn numbers and how to tell time in Turkish",
                        "lessons": [
                            {
                                "title": "Numbers 1-20",
                                "description": "Learn basic numbers in Turkish",
                                "vocabulary": ["bir", "iki", "üç", "dört", "beş", "altı", "yedi", "sekiz", "dokuz", "on"],
                                "grammar_points": ["Number formation"],
                                "learning_objectives": ["Count from 1 to 20", "Use numbers in basic sentences"]
                            }
                        ],
                        "estimated_hours": 3
                    }
                ],
                "total_lessons": 3,
                "estimated_duration": 6
            }

        return {
            "curriculum": curriculum_data,
            "source": "curriculum_files" if curriculum_content.strip() else "generated",
            "generation_info": {
                "files_processed": len(list(curriculum_dir.glob("*.docx"))) if curriculum_dir.exists() else 0,
                "content_length": len(curriculum_content)
            }
        }

    except Exception as e:
        print(f"Error in curriculum data loading: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Curriculum data loading failed: {str(e)}")

@router.post("/generate-curriculum")
async def generate_curriculum(request: CurriculumRequest):
    """Generate a complete curriculum with structured learning path"""
    
    try:
        # Initialize OpenAI client
        api_key = os.getenv("OPENAI_API_KEY")
        if not api_key:
            raise HTTPException(status_code=500, detail="OpenAI API key not configured")
            
        client = OpenAI(api_key=api_key)
        
        # Create curriculum generation prompt
        prompt = f"""
        Create a comprehensive Turkish language curriculum with the following specifications:
        
        Curriculum Requirements:
        - Title: {request.title}
        - Target Level: {request.target_level}
        - Total Duration: {request.total_hours} hours
        - Focus Areas: {', '.join([area.value for area in request.focus_areas])}
        - Student Goals: {', '.join(request.student_goals)}
        
        Create a structured curriculum that:
        1. Progresses logically from basic to advanced concepts
        2. Balances different skill areas (vocabulary, grammar, reading, listening, speaking, writing)
        3. Includes cultural context and practical applications
        4. Has clear prerequisites and learning objectives
        5. Is engaging and motivating for students
        
        Format the response as JSON with the following structure:
        {{
            "title": "curriculum title",
            "description": "comprehensive description of the curriculum",
            "units": [
                {{
                    "title": "unit title",
                    "description": "unit description",
                    "lessons": ["lesson1", "lesson2", "lesson3"],
                    "prerequisites": ["prerequisite_unit_ids"],
                    "learning_objectives": ["objective1", "objective2", ...],
                    "estimated_hours": 8
                }},
                ...
            ],
            "total_lessons": 45,
            "estimated_duration": {request.total_hours},
            "learning_path": ["unit1_id", "unit2_id", "unit3_id", ...],
            "skill_distribution": {{
                "vocabulary": 25,
                "grammar": 20,
                "reading": 15,
                "listening": 15,
                "speaking": 15,
                "writing": 10
            }},
            "assessment_strategy": "description of how progress will be assessed",
            "cultural_components": ["cultural_element1", "cultural_element2", ...]
        }}
        
        Ensure the curriculum is appropriate for {request.target_level} level and covers all essential Turkish language skills.
        """
        
        print("Generating curriculum with GPT-4...")
        response = client.chat.completions.create(
            model="gpt-4",
            messages=[
                {"role": "system", "content": "You are an expert Turkish language curriculum designer with extensive experience in creating structured learning programs."},
                {"role": "user", "content": prompt}
            ],
            temperature=0.6,
            max_tokens=3000
        )
        print("Curriculum generation completed successfully")
        
        # Parse the response
        content = response.choices[0].message.content
        
        try:
            curriculum_data = json.loads(content)
        except json.JSONDecodeError:
            # If JSON parsing fails, create a basic curriculum structure
            curriculum_data = {
                "title": request.title,
                "description": f"Comprehensive Turkish curriculum for {request.target_level} level",
                "units": [
                    {
                        "title": "Foundation Unit",
                        "description": "Basic Turkish fundamentals",
                        "lessons": ["Introduction to Turkish", "Basic Greetings", "Numbers and Time"],
                        "prerequisites": [],
                        "learning_objectives": ["Learn basic vocabulary", "Understand pronunciation"],
                        "estimated_hours": request.total_hours // 4
                    }
                ],
                "total_lessons": 20,
                "estimated_duration": request.total_hours,
                "learning_path": ["unit1"],
                "skill_distribution": {
                    "vocabulary": 30,
                    "grammar": 25,
                    "reading": 15,
                    "listening": 15,
                    "speaking": 10,
                    "writing": 5
                }
            }
        
        return {
            "curriculum": curriculum_data,
            "generation_info": {
                "target_level": request.target_level,
                "focus_areas": [area.value for area in request.focus_areas],
                "total_hours": request.total_hours
            }
        }
        
    except Exception as e:
        print(f"Error in curriculum generation: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Curriculum generation failed: {str(e)}")

@router.post("/generate-unit-lessons")
async def generate_unit_lessons(
    unit_title: str,
    unit_description: str,
    target_level: CEFRLevel,
    lesson_count: int = 5,
    focus_areas: List[LessonType] = None
):
    """Generate detailed lessons for a specific curriculum unit"""
    
    try:
        # Initialize OpenAI client
        api_key = os.getenv("OPENAI_API_KEY")
        if not api_key:
            raise HTTPException(status_code=500, detail="OpenAI API key not configured")
            
        client = OpenAI(api_key=api_key)
        
        focus_areas_str = ', '.join([area.value for area in focus_areas]) if focus_areas else "mixed skills"
        
        prompt = f"""
        Create {lesson_count} detailed lessons for a Turkish language curriculum unit:
        
        Unit Information:
        - Title: {unit_title}
        - Description: {unit_description}
        - Target Level: {target_level}
        - Focus Areas: {focus_areas_str}
        
        For each lesson, provide:
        1. Clear learning objectives
        2. Structured content outline
        3. Key vocabulary and grammar points
        4. Suggested activities and exercises
        5. Assessment methods
        6. Estimated duration
        
        Format the response as JSON:
        {{
            "lessons": [
                {{
                    "title": "lesson title",
                    "description": "lesson description",
                    "objectives": ["objective1", "objective2", ...],
                    "content_outline": ["section1", "section2", ...],
                    "key_vocabulary": ["word1", "word2", ...],
                    "grammar_points": ["point1", "point2", ...],
                    "activities": ["activity1", "activity2", ...],
                    "assessment": "assessment method",
                    "estimated_duration": 45,
                    "lesson_type": "vocabulary/grammar/reading/etc",
                    "prerequisites": ["prerequisite1", "prerequisite2", ...]
                }},
                ...
            ],
            "unit_summary": {{
                "total_vocabulary": 50,
                "total_grammar_points": 8,
                "skill_focus": ["vocabulary", "grammar", "reading"],
                "progression_notes": "how lessons build on each other"
            }}
        }}
        """
        
        response = client.chat.completions.create(
            model="gpt-4",
            messages=[
                {"role": "system", "content": "You are an expert Turkish language lesson designer. Create detailed, engaging lessons that build progressively."},
                {"role": "user", "content": prompt}
            ],
            temperature=0.7,
            max_tokens=2500
        )
        
        # Parse the response
        content = response.choices[0].message.content
        
        try:
            lessons_data = json.loads(content)
        except json.JSONDecodeError:
            # Create basic lesson structure if parsing fails
            lessons_data = {
                "lessons": [
                    {
                        "title": f"{unit_title} - Lesson {i+1}",
                        "description": f"Lesson {i+1} of {unit_title}",
                        "objectives": [f"Learn key concepts for lesson {i+1}"],
                        "content_outline": ["Introduction", "Main content", "Practice", "Review"],
                        "key_vocabulary": [],
                        "grammar_points": [],
                        "activities": ["Reading exercise", "Vocabulary practice"],
                        "assessment": "Quiz and practice exercises",
                        "estimated_duration": 45,
                        "lesson_type": "mixed",
                        "prerequisites": []
                    }
                    for i in range(lesson_count)
                ],
                "unit_summary": {
                    "total_vocabulary": lesson_count * 10,
                    "total_grammar_points": lesson_count * 2,
                    "skill_focus": ["vocabulary", "grammar"],
                    "progression_notes": "Lessons build progressively on previous content"
                }
            }
        
        return {
            "unit_lessons": lessons_data,
            "unit_info": {
                "title": unit_title,
                "target_level": target_level,
                "lesson_count": lesson_count
            }
        }
        
    except Exception as e:
        print(f"Error in unit lesson generation: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Unit lesson generation failed: {str(e)}")

@router.post("/optimize-learning-path")
async def optimize_learning_path(
    curriculum_units: List[Dict[str, Any]],
    student_level: CEFRLevel,
    student_goals: List[str],
    time_constraints: int = None  # hours per week
):
    """Optimize the learning path based on student needs and constraints"""
    
    try:
        # Initialize OpenAI client
        api_key = os.getenv("OPENAI_API_KEY")
        if not api_key:
            raise HTTPException(status_code=500, detail="OpenAI API key not configured")
            
        client = OpenAI(api_key=api_key)
        
        prompt = f"""
        Optimize the learning path for a Turkish language curriculum based on student needs:
        
        Student Profile:
        - Current Level: {student_level}
        - Goals: {', '.join(student_goals)}
        - Time Constraints: {time_constraints} hours per week (if specified)
        
        Available Units:
        {json.dumps(curriculum_units, indent=2)}
        
        Create an optimized learning path that:
        1. Respects prerequisites and logical progression
        2. Prioritizes units that align with student goals
        3. Considers time constraints
        4. Maximizes learning efficiency
        5. Maintains student motivation
        
        Provide the optimization in JSON format:
        {{
            "optimized_path": ["unit_id1", "unit_id2", ...],
            "rationale": "explanation of the optimization decisions",
            "timeline": {{
                "week1": ["unit_id1"],
                "week2": ["unit_id2"],
                ...
            }},
            "priority_adjustments": [
                {{
                    "unit_id": "unit1",
                    "original_position": 3,
                    "new_position": 1,
                    "reason": "aligns with student goals"
                }}
            ],
            "estimated_completion": "12 weeks",
            "success_factors": ["factor1", "factor2", ...],
            "potential_challenges": ["challenge1", "challenge2", ...]
        }}
        """
        
        response = client.chat.completions.create(
            model="gpt-4",
            messages=[
                {"role": "system", "content": "You are an expert in personalized learning path optimization for language education."},
                {"role": "user", "content": prompt}
            ],
            temperature=0.4,
            max_tokens=2000
        )
        
        # Parse the response
        content = response.choices[0].message.content
        
        try:
            optimization_data = json.loads(content)
        except json.JSONDecodeError:
            # Create basic optimization if parsing fails
            unit_ids = [unit.get('id', f"unit_{i}") for i, unit in enumerate(curriculum_units)]
            optimization_data = {
                "optimized_path": unit_ids,
                "rationale": "Standard progression based on prerequisites",
                "timeline": {f"week{i+1}": [unit_id] for i, unit_id in enumerate(unit_ids)},
                "priority_adjustments": [],
                "estimated_completion": f"{len(unit_ids)} weeks",
                "success_factors": ["Consistent practice", "Regular review"],
                "potential_challenges": ["Time management", "Motivation maintenance"]
            }
        
        return {
            "optimization": optimization_data,
            "student_profile": {
                "level": student_level,
                "goals": student_goals,
                "time_constraints": time_constraints
            }
        }
        
    except Exception as e:
        print(f"Error in learning path optimization: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Learning path optimization failed: {str(e)}")
