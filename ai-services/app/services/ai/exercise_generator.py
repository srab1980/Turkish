"""
AI-powered exercise generation service
"""

import asyncio
import json
import random
from typing import Dict, List, Optional, Any, Tuple
from enum import Enum

import structlog
from openai import AsyncOpenAI
from transformers import pipeline

from app.core.config import get_settings
from app.models.exercises import (
    ExerciseType,
    ExerciseRequest,
    GeneratedExercise,
    ExerciseOptions,
    CEFRLevel
)
from app.services.ai.prompt_templates import ExercisePrompts

logger = structlog.get_logger(__name__)
settings = get_settings()


class ExerciseGenerator:
    """Generate exercises using AI based on lesson content"""
    
    def __init__(self):
        self.openai_client = AsyncOpenAI(api_key=settings.OPENAI_API_KEY)
        self.prompts = ExercisePrompts()
        self._init_local_models()
    
    def _init_local_models(self):
        """Initialize local ML models for offline generation"""
        try:
            # Initialize Turkish NLP pipeline
            self.turkish_nlp = pipeline(
                "fill-mask",
                model=settings.TURKISH_NLP_MODEL,
                tokenizer=settings.TURKISH_NLP_MODEL
            )
            logger.info("Local Turkish NLP model loaded successfully")
        except Exception as e:
            logger.warning("Failed to load local Turkish NLP model", error=str(e))
            self.turkish_nlp = None
    
    async def generate_exercises(
        self,
        request: ExerciseRequest
    ) -> List[GeneratedExercise]:
        """
        Generate exercises based on the request parameters
        
        Args:
            request: Exercise generation request
            
        Returns:
            List of generated exercises
        """
        logger.info(
            "Starting exercise generation",
            lesson_id=request.lesson_id,
            types=request.exercise_types,
            count=request.count
        )
        
        try:
            # Get lesson content
            lesson_content = await self._get_lesson_content(request.lesson_id)
            
            # Generate exercises for each type
            all_exercises = []
            
            for exercise_type in request.exercise_types:
                type_count = max(1, request.count // len(request.exercise_types))
                
                exercises = await self._generate_exercises_by_type(
                    exercise_type,
                    lesson_content,
                    request,
                    type_count
                )
                
                all_exercises.extend(exercises)
            
            # Shuffle and limit to requested count
            random.shuffle(all_exercises)
            final_exercises = all_exercises[:request.count]
            
            # Enhance exercises with metadata
            for exercise in final_exercises:
                exercise.metadata = await self._enhance_exercise_metadata(
                    exercise,
                    lesson_content,
                    request
                )
            
            logger.info(
                "Exercise generation completed",
                generated_count=len(final_exercises),
                requested_count=request.count
            )
            
            return final_exercises
            
        except Exception as e:
            logger.error(
                "Exercise generation failed",
                lesson_id=request.lesson_id,
                error=str(e),
                exc_info=True
            )
            raise
    
    async def _generate_exercises_by_type(
        self,
        exercise_type: ExerciseType,
        lesson_content: Dict[str, Any],
        request: ExerciseRequest,
        count: int
    ) -> List[GeneratedExercise]:
        """Generate exercises of a specific type"""
        
        generators = {
            ExerciseType.MULTIPLE_CHOICE: self._generate_multiple_choice,
            ExerciseType.FILL_IN_BLANK: self._generate_fill_in_blank,
            ExerciseType.DRAG_DROP: self._generate_drag_drop,
            ExerciseType.VOCABULARY_MATCHING: self._generate_vocabulary_matching,
            ExerciseType.GRAMMAR_CORRECTION: self._generate_grammar_correction,
            ExerciseType.READING_COMPREHENSION: self._generate_reading_comprehension,
            ExerciseType.LISTENING_COMPREHENSION: self._generate_listening_comprehension,
            ExerciseType.SPEAKING_PRACTICE: self._generate_speaking_practice,
            ExerciseType.WRITING_PRACTICE: self._generate_writing_practice,
        }
        
        generator = generators.get(exercise_type)
        if not generator:
            logger.warning(f"No generator found for exercise type: {exercise_type}")
            return []
        
        return await generator(lesson_content, request, count)
    
    async def _generate_multiple_choice(
        self,
        lesson_content: Dict[str, Any],
        request: ExerciseRequest,
        count: int
    ) -> List[GeneratedExercise]:
        """Generate multiple choice exercises"""
        
        exercises = []
        
        # Extract key concepts from lesson
        key_concepts = await self._extract_key_concepts(lesson_content)
        
        for i in range(count):
            concept = random.choice(key_concepts) if key_concepts else None
            
            prompt = self.prompts.get_multiple_choice_prompt(
                lesson_content=lesson_content,
                concept=concept,
                difficulty=request.difficulty,
                focus_areas=request.focus_areas
            )
            
            try:
                response = await self.openai_client.chat.completions.create(
                    model=settings.DEFAULT_MODEL,
                    messages=[{"role": "user", "content": prompt}],
                    temperature=0.7,
                    max_tokens=500
                )
                
                exercise_data = json.loads(response.choices[0].message.content)
                
                exercise = GeneratedExercise(
                    type=ExerciseType.MULTIPLE_CHOICE,
                    title=exercise_data.get("title", f"Multiple Choice {i+1}"),
                    question=exercise_data["question"],
                    options=exercise_data["options"],
                    correct_answer=exercise_data["correct_answer"],
                    explanation=exercise_data.get("explanation"),
                    difficulty=request.difficulty,
                    points=self._calculate_points(ExerciseType.MULTIPLE_CHOICE, request.difficulty),
                    ai_confidence=0.85,  # Will be calculated properly later
                    lesson_id=request.lesson_id
                )
                
                exercises.append(exercise)
                
            except Exception as e:
                logger.warning(
                    "Failed to generate multiple choice exercise",
                    index=i,
                    error=str(e)
                )
                continue
        
        return exercises
    
    async def _generate_fill_in_blank(
        self,
        lesson_content: Dict[str, Any],
        request: ExerciseRequest,
        count: int
    ) -> List[GeneratedExercise]:
        """Generate fill-in-the-blank exercises"""
        
        exercises = []
        
        # Extract sentences from lesson content
        sentences = await self._extract_sentences(lesson_content)
        
        for i in range(count):
            if not sentences:
                break
                
            sentence = random.choice(sentences)
            
            prompt = self.prompts.get_fill_in_blank_prompt(
                sentence=sentence,
                lesson_content=lesson_content,
                difficulty=request.difficulty,
                focus_areas=request.focus_areas
            )
            
            try:
                response = await self.openai_client.chat.completions.create(
                    model=settings.DEFAULT_MODEL,
                    messages=[{"role": "user", "content": prompt}],
                    temperature=0.7,
                    max_tokens=400
                )
                
                exercise_data = json.loads(response.choices[0].message.content)
                
                exercise = GeneratedExercise(
                    type=ExerciseType.FILL_IN_BLANK,
                    title=exercise_data.get("title", f"Fill in the Blank {i+1}"),
                    question=exercise_data["question"],
                    correct_answer=exercise_data["correct_answer"],
                    explanation=exercise_data.get("explanation"),
                    difficulty=request.difficulty,
                    points=self._calculate_points(ExerciseType.FILL_IN_BLANK, request.difficulty),
                    ai_confidence=0.80,
                    lesson_id=request.lesson_id,
                    options=exercise_data.get("hints", [])
                )
                
                exercises.append(exercise)
                
            except Exception as e:
                logger.warning(
                    "Failed to generate fill-in-blank exercise",
                    index=i,
                    error=str(e)
                )
                continue
        
        return exercises
    
    async def _generate_vocabulary_matching(
        self,
        lesson_content: Dict[str, Any],
        request: ExerciseRequest,
        count: int
    ) -> List[GeneratedExercise]:
        """Generate vocabulary matching exercises"""
        
        exercises = []
        
        # Extract vocabulary from lesson
        vocabulary = await self._extract_vocabulary(lesson_content)
        
        for i in range(count):
            if len(vocabulary) < 4:  # Need at least 4 words for matching
                break
            
            # Select random vocabulary items
            selected_vocab = random.sample(vocabulary, min(8, len(vocabulary)))
            
            prompt = self.prompts.get_vocabulary_matching_prompt(
                vocabulary=selected_vocab,
                lesson_content=lesson_content,
                difficulty=request.difficulty
            )
            
            try:
                response = await self.openai_client.chat.completions.create(
                    model=settings.DEFAULT_MODEL,
                    messages=[{"role": "user", "content": prompt}],
                    temperature=0.6,
                    max_tokens=600
                )
                
                exercise_data = json.loads(response.choices[0].message.content)
                
                exercise = GeneratedExercise(
                    type=ExerciseType.VOCABULARY_MATCHING,
                    title=exercise_data.get("title", f"Vocabulary Matching {i+1}"),
                    question=exercise_data["question"],
                    options=exercise_data["pairs"],
                    correct_answer=json.dumps(exercise_data["correct_matches"]),
                    explanation=exercise_data.get("explanation"),
                    difficulty=request.difficulty,
                    points=self._calculate_points(ExerciseType.VOCABULARY_MATCHING, request.difficulty),
                    ai_confidence=0.90,
                    lesson_id=request.lesson_id
                )
                
                exercises.append(exercise)
                
            except Exception as e:
                logger.warning(
                    "Failed to generate vocabulary matching exercise",
                    index=i,
                    error=str(e)
                )
                continue
        
        return exercises
    
    async def _generate_grammar_correction(
        self,
        lesson_content: Dict[str, Any],
        request: ExerciseRequest,
        count: int
    ) -> List[GeneratedExercise]:
        """Generate grammar correction exercises"""
        
        exercises = []
        
        # Extract grammar rules from lesson
        grammar_rules = await self._extract_grammar_rules(lesson_content)
        
        for i in range(count):
            rule = random.choice(grammar_rules) if grammar_rules else None
            
            prompt = self.prompts.get_grammar_correction_prompt(
                grammar_rule=rule,
                lesson_content=lesson_content,
                difficulty=request.difficulty,
                focus_areas=request.focus_areas
            )
            
            try:
                response = await self.openai_client.chat.completions.create(
                    model=settings.DEFAULT_MODEL,
                    messages=[{"role": "user", "content": prompt}],
                    temperature=0.7,
                    max_tokens=500
                )
                
                exercise_data = json.loads(response.choices[0].message.content)
                
                exercise = GeneratedExercise(
                    type=ExerciseType.GRAMMAR_CORRECTION,
                    title=exercise_data.get("title", f"Grammar Correction {i+1}"),
                    question=exercise_data["question"],
                    correct_answer=exercise_data["correct_answer"],
                    explanation=exercise_data.get("explanation"),
                    difficulty=request.difficulty,
                    points=self._calculate_points(ExerciseType.GRAMMAR_CORRECTION, request.difficulty),
                    ai_confidence=0.85,
                    lesson_id=request.lesson_id,
                    options=exercise_data.get("incorrect_sentence")
                )
                
                exercises.append(exercise)
                
            except Exception as e:
                logger.warning(
                    "Failed to generate grammar correction exercise",
                    index=i,
                    error=str(e)
                )
                continue
        
        return exercises
    
    async def _generate_reading_comprehension(
        self,
        lesson_content: Dict[str, Any],
        request: ExerciseRequest,
        count: int
    ) -> List[GeneratedExercise]:
        """Generate reading comprehension exercises"""
        
        exercises = []
        
        for i in range(count):
            prompt = self.prompts.get_reading_comprehension_prompt(
                lesson_content=lesson_content,
                difficulty=request.difficulty,
                focus_areas=request.focus_areas
            )
            
            try:
                response = await self.openai_client.chat.completions.create(
                    model=settings.DEFAULT_MODEL,
                    messages=[{"role": "user", "content": prompt}],
                    temperature=0.7,
                    max_tokens=800
                )
                
                exercise_data = json.loads(response.choices[0].message.content)
                
                exercise = GeneratedExercise(
                    type=ExerciseType.READING_COMPREHENSION,
                    title=exercise_data.get("title", f"Reading Comprehension {i+1}"),
                    question=exercise_data["question"],
                    options=exercise_data.get("options", []),
                    correct_answer=exercise_data["correct_answer"],
                    explanation=exercise_data.get("explanation"),
                    difficulty=request.difficulty,
                    points=self._calculate_points(ExerciseType.READING_COMPREHENSION, request.difficulty),
                    ai_confidence=0.80,
                    lesson_id=request.lesson_id,
                    content=exercise_data.get("passage")
                )
                
                exercises.append(exercise)
                
            except Exception as e:
                logger.warning(
                    "Failed to generate reading comprehension exercise",
                    index=i,
                    error=str(e)
                )
                continue
        
        return exercises
    
    async def _generate_drag_drop(
        self,
        lesson_content: Dict[str, Any],
        request: ExerciseRequest,
        count: int
    ) -> List[GeneratedExercise]:
        """Generate drag and drop exercises"""
        # Implementation for drag and drop exercises
        return []
    
    async def _generate_listening_comprehension(
        self,
        lesson_content: Dict[str, Any],
        request: ExerciseRequest,
        count: int
    ) -> List[GeneratedExercise]:
        """Generate listening comprehension exercises"""
        # Implementation for listening exercises
        return []
    
    async def _generate_speaking_practice(
        self,
        lesson_content: Dict[str, Any],
        request: ExerciseRequest,
        count: int
    ) -> List[GeneratedExercise]:
        """Generate speaking practice exercises"""
        # Implementation for speaking exercises
        return []
    
    async def _generate_writing_practice(
        self,
        lesson_content: Dict[str, Any],
        request: ExerciseRequest,
        count: int
    ) -> List[GeneratedExercise]:
        """Generate writing practice exercises"""
        # Implementation for writing exercises
        return []
    
    async def _get_lesson_content(self, lesson_id: str) -> Dict[str, Any]:
        """Get lesson content from database"""
        # This would fetch from the database
        # For now, return mock data
        return {
            "id": lesson_id,
            "title": "Sample Lesson",
            "content": "Sample lesson content...",
            "vocabulary": [],
            "grammar_rules": [],
            "examples": []
        }
    
    async def _extract_key_concepts(self, lesson_content: Dict[str, Any]) -> List[str]:
        """Extract key concepts from lesson content"""
        # Implementation to extract key concepts
        return ["concept1", "concept2", "concept3"]
    
    async def _extract_sentences(self, lesson_content: Dict[str, Any]) -> List[str]:
        """Extract sentences from lesson content"""
        # Implementation to extract sentences
        return ["Sample sentence 1.", "Sample sentence 2."]
    
    async def _extract_vocabulary(self, lesson_content: Dict[str, Any]) -> List[Dict[str, str]]:
        """Extract vocabulary from lesson content"""
        # Implementation to extract vocabulary
        return [{"turkish": "merhaba", "english": "hello"}]
    
    async def _extract_grammar_rules(self, lesson_content: Dict[str, Any]) -> List[str]:
        """Extract grammar rules from lesson content"""
        # Implementation to extract grammar rules
        return ["Grammar rule 1", "Grammar rule 2"]
    
    def _calculate_points(self, exercise_type: ExerciseType, difficulty: CEFRLevel) -> int:
        """Calculate points for an exercise based on type and difficulty"""
        base_points = {
            ExerciseType.MULTIPLE_CHOICE: 10,
            ExerciseType.FILL_IN_BLANK: 15,
            ExerciseType.VOCABULARY_MATCHING: 20,
            ExerciseType.GRAMMAR_CORRECTION: 25,
            ExerciseType.READING_COMPREHENSION: 30,
            ExerciseType.LISTENING_COMPREHENSION: 35,
            ExerciseType.SPEAKING_PRACTICE: 40,
            ExerciseType.WRITING_PRACTICE: 45,
        }
        
        difficulty_multiplier = {
            CEFRLevel.A1: 1.0,
            CEFRLevel.A2: 1.2,
            CEFRLevel.B1: 1.4,
            CEFRLevel.B2: 1.6,
            CEFRLevel.C1: 1.8,
            CEFRLevel.C2: 2.0,
        }
        
        base = base_points.get(exercise_type, 10)
        multiplier = difficulty_multiplier.get(difficulty, 1.0)
        
        return int(base * multiplier)
    
    async def _enhance_exercise_metadata(
        self,
        exercise: GeneratedExercise,
        lesson_content: Dict[str, Any],
        request: ExerciseRequest
    ) -> Dict[str, Any]:
        """Enhance exercise with additional metadata"""
        
        return {
            "focus_area": random.choice(request.focus_areas) if request.focus_areas else "General",
            "estimated_time": random.randint(2, 8),  # minutes
            "keywords": [],  # Would extract from content
            "difficulty_score": self._calculate_difficulty_score(exercise.difficulty),
            "cognitive_load": "medium",  # Would calculate based on exercise complexity
            "learning_objectives": [],  # Would extract from lesson
        }
    
    def _calculate_difficulty_score(self, difficulty: CEFRLevel) -> float:
        """Calculate numerical difficulty score"""
        scores = {
            CEFRLevel.A1: 1.0,
            CEFRLevel.A2: 2.0,
            CEFRLevel.B1: 3.0,
            CEFRLevel.B2: 4.0,
            CEFRLevel.C1: 5.0,
            CEFRLevel.C2: 6.0,
        }
        return scores.get(difficulty, 3.0)
