from fastapi import APIRouter, UploadFile, File, HTTPException, Query
from fastapi.responses import JSONResponse
from pydantic import BaseModel, Field
import aiofiles
import os
import uuid
from typing import Optional, List, Dict, Any

from app.core.config import settings
from app.services.speech_processor import SpeechProcessor, PronunciationScore
from app.models.content import CEFRLevel

router = APIRouter()

# Global speech processor instance
speech_processor = SpeechProcessor()

# Pydantic models for new endpoints
class SpeechAnalysisResponse(BaseModel):
    transcribed_text: str
    confidence_score: float
    pronunciation_score: float
    pronunciation_grade: str
    word_scores: List[Dict[str, Any]]
    feedback: List[str]
    duration_seconds: float
    detected_language: str

class PronunciationExerciseResponse(BaseModel):
    exercises: List[Dict[str, Any]]

@router.post("/transcribe")
async def transcribe_audio(
    audio: UploadFile = File(...),
    language: str = "tr"  # Turkish by default
):
    """Transcribe audio to text using speech recognition"""
    
    # Validate file type
    allowed_audio_types = ['.mp3', '.wav', '.m4a', '.ogg', '.flac']
    filename = audio.filename or "unknown"
    file_extension = os.path.splitext(filename)[1].lower()

    if file_extension not in allowed_audio_types:
        raise HTTPException(
            status_code=400,
            detail=f"Unsupported audio format. Allowed: {allowed_audio_types}"
        )

    # Validate file size (max 25MB for audio)
    max_audio_size = 25 * 1024 * 1024  # 25MB
    file_size = audio.size or 0
    if file_size > max_audio_size:
        raise HTTPException(
            status_code=400,
            detail=f"Audio file too large. Maximum size: {max_audio_size} bytes"
        )
    
    try:
        # Save uploaded audio temporarily
        file_id = str(uuid.uuid4())
        temp_filename = f"{file_id}{file_extension}"
        temp_path = os.path.join(settings.UPLOAD_DIR, temp_filename)
        
        # Ensure upload directory exists
        os.makedirs(settings.UPLOAD_DIR, exist_ok=True)
        
        # Save file
        async with aiofiles.open(temp_path, 'wb') as temp_file:
            content = await audio.read()
            await temp_file.write(content)
        
        # TODO: Implement actual speech recognition
        # This would use OpenAI Whisper or similar service
        
        # Placeholder response
        transcribed_text = "Bu bir örnek transkripsiyon metnidir."
        confidence_score = 0.85
        
        # Clean up temporary file
        try:
            os.remove(temp_path)
        except:
            pass
        
        return {
            "transcribed_text": transcribed_text,
            "confidence_score": confidence_score,
            "language": language,
            "duration_seconds": 0,  # TODO: Calculate actual duration
            "metadata": {
                "original_filename": audio.filename,
                "file_size": audio.size or 0
            }
        }
        
    except Exception as e:
        # Clean up temporary file on error
        try:
            if 'temp_path' in locals():
                os.remove(temp_path)
        except:
            pass
        
        raise HTTPException(status_code=500, detail=f"Speech transcription failed: {str(e)}")

@router.post("/analyze", response_model=SpeechAnalysisResponse)
async def analyze_speech_advanced(
    audio: UploadFile = File(..., description="Audio file (WAV, MP3, etc.)"),
    expected_text: Optional[str] = Query(None, description="Expected text for pronunciation comparison"),
    exercise_type: str = Query("free_speech", description="Type of speech exercise")
):
    """Advanced speech analysis with pronunciation scoring and detailed feedback"""

    try:
        # Validate audio file
        if not audio.content_type or not audio.content_type.startswith('audio/'):
            raise HTTPException(status_code=400, detail="Invalid audio file format")

        # Read audio data
        audio_data = await audio.read()

        if len(audio_data) == 0:
            raise HTTPException(status_code=400, detail="Empty audio file")

        # Process speech audio using the enhanced speech processor
        result = await speech_processor.process_speech_audio(
            audio_data=audio_data,
            expected_text=expected_text,
            exercise_type=exercise_type
        )

        return SpeechAnalysisResponse(
            transcribed_text=result.transcribed_text,
            confidence_score=result.confidence_score,
            pronunciation_score=result.pronunciation_score,
            pronunciation_grade=result.pronunciation_grade.value,
            word_scores=result.word_scores,
            feedback=result.feedback,
            duration_seconds=result.duration_seconds,
            detected_language=result.detected_language
        )

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Advanced speech analysis failed: {str(e)}")

@router.post("/pronunciation-score")
async def score_pronunciation(
    reference_text: str,
    audio: UploadFile = File(...),
    language: str = "tr"
):
    """Score pronunciation accuracy against reference text"""
    
    # Validate inputs
    if not reference_text.strip():
        raise HTTPException(status_code=400, detail="Reference text is required")
    
    # Validate file type
    allowed_audio_types = ['.mp3', '.wav', '.m4a', '.ogg', '.flac']
    filename = audio.filename or "unknown"
    file_extension = os.path.splitext(filename)[1].lower()
    
    if file_extension not in allowed_audio_types:
        raise HTTPException(
            status_code=400,
            detail=f"Unsupported audio format. Allowed: {allowed_audio_types}"
        )
    
    try:
        # Save uploaded audio temporarily
        file_id = str(uuid.uuid4())
        temp_filename = f"{file_id}{file_extension}"
        temp_path = os.path.join(settings.UPLOAD_DIR, temp_filename)
        
        # Ensure upload directory exists
        os.makedirs(settings.UPLOAD_DIR, exist_ok=True)
        
        # Save file
        async with aiofiles.open(temp_path, 'wb') as temp_file:
            content = await audio.read()
            await temp_file.write(content)
        
        # TODO: Implement actual pronunciation scoring
        # This would compare the audio against reference text
        
        # Placeholder response
        overall_score = 78.5
        word_scores = []
        
        words = reference_text.split()
        for i, word in enumerate(words[:10]):  # Limit to first 10 words
            word_scores.append({
                "word": word,
                "score": 75 + (i % 20),  # Placeholder scores
                "feedback": "Good pronunciation" if (75 + (i % 20)) > 80 else "Needs improvement"
            })
        
        # Clean up temporary file
        try:
            os.remove(temp_path)
        except:
            pass
        
        return {
            "overall_score": overall_score,
            "word_scores": word_scores,
            "reference_text": reference_text,
            "feedback": "Good overall pronunciation. Focus on vowel clarity." if overall_score > 75 else "Practice more for better pronunciation.",
            "metadata": {
                "original_filename": audio.filename,
                "file_size": audio.size or 0,
                "language": language
            }
        }
        
    except Exception as e:
        # Clean up temporary file on error
        try:
            if 'temp_path' in locals():
                os.remove(temp_path)
        except:
            pass
        
        raise HTTPException(status_code=500, detail=f"Pronunciation scoring failed: {str(e)}")

@router.get("/exercises", response_model=PronunciationExerciseResponse)
async def get_pronunciation_exercises(
    cefr_level: CEFRLevel = Query(CEFRLevel.A1, description="CEFR level for exercises"),
    count: int = Query(5, ge=1, le=20, description="Number of exercises to return")
):
    """Get pronunciation exercises for a specific CEFR level"""

    try:
        exercises = speech_processor.get_pronunciation_exercises(cefr_level, count)

        return PronunciationExerciseResponse(exercises=exercises)

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to get exercises: {str(e)}")

@router.get("/pronunciation-guide")
async def get_pronunciation_guide():
    """Get comprehensive Turkish pronunciation guide and tips"""

    return {
        "turkish_alphabet": {
            "vowels": {
                "a": {"sound": "ah", "example": "araba (car)", "tip": "Like 'a' in 'father'"},
                "e": {"sound": "eh", "example": "ev (house)", "tip": "Like 'e' in 'bed'"},
                "ı": {"sound": "uh", "example": "ısı (heat)", "tip": "Undotted i - tongue between 'i' and 'u'"},
                "i": {"sound": "ee", "example": "ip (rope)", "tip": "Like 'ee' in 'see'"},
                "o": {"sound": "oh", "example": "okul (school)", "tip": "Like 'o' in 'more'"},
                "ö": {"sound": "ur", "example": "öğretmen (teacher)", "tip": "Like German 'ö' or French 'eu'"},
                "u": {"sound": "oo", "example": "uzun (long)", "tip": "Like 'oo' in 'moon'"},
                "ü": {"sound": "ue", "example": "üç (three)", "tip": "Like German 'ü' or French 'u'"}
            },
            "consonants": {
                "c": {"sound": "j", "example": "cam (glass)", "tip": "Always pronounced like 'j' in 'jam'"},
                "ç": {"sound": "ch", "example": "çay (tea)", "tip": "Like 'ch' in 'chair'"},
                "ğ": {"sound": "soft g", "example": "dağ (mountain)", "tip": "Soft g - often silent or lengthens preceding vowel"},
                "j": {"sound": "zh", "example": "jeton (token)", "tip": "Like 's' in 'measure'"},
                "r": {"sound": "rolled r", "example": "araba (car)", "tip": "Rolled r - tip of tongue vibrates"},
                "ş": {"sound": "sh", "example": "şeker (sugar)", "tip": "Like 'sh' in 'shoe'"}
            }
        },
        "pronunciation_tips": [
            "Turkish is largely phonetic - words are pronounced as they are written",
            "Stress is usually on the last syllable",
            "Vowel harmony is important - vowels in a word harmonize",
            "The letter 'ğ' (soft g) is often silent or very light",
            "Practice rolling your 'r' - it's important in Turkish",
            "Turkish has no diphthongs - each vowel is pronounced separately"
        ],
        "common_mistakes": [
            {
                "mistake": "Pronouncing 'ı' like 'i'",
                "correction": "The undotted 'ı' is a unique Turkish sound",
                "practice": "Try saying 'ısı' (heat) vs 'isi' (name)"
            },
            {
                "mistake": "Not rolling the 'r'",
                "correction": "Turkish 'r' should be rolled with tongue tip",
                "practice": "Start with 'tr' combinations: 'tren' (train)"
            },
            {
                "mistake": "Ignoring vowel harmony",
                "correction": "Vowels in Turkish words follow harmony rules",
                "practice": "Notice patterns in words like 'evlerimizde'"
            }
        ]
    }

@router.get("/supported-audio-formats")
async def get_supported_audio_formats():
    """Get list of supported audio formats"""
    
    return {
        "formats": [
            {
                "extension": ".mp3",
                "type": "MP3 Audio",
                "description": "MPEG Audio Layer 3"
            },
            {
                "extension": ".wav",
                "type": "WAV Audio", 
                "description": "Waveform Audio File Format"
            },
            {
                "extension": ".m4a",
                "type": "M4A Audio",
                "description": "MPEG-4 Audio"
            },
            {
                "extension": ".ogg",
                "type": "OGG Audio",
                "description": "Ogg Vorbis Audio"
            },
            {
                "extension": ".flac",
                "type": "FLAC Audio",
                "description": "Free Lossless Audio Codec"
            }
        ],
        "max_file_size": 25 * 1024 * 1024,
        "max_file_size_mb": 25
    }

@router.get("/speech-exercises/interactive")
async def get_interactive_speech_exercises():
    """Get interactive speech exercises with audio prompts and structured practice"""

    return {
        "exercises": [
            {
                "id": "greeting_basic",
                "title": "Basic Greetings",
                "level": "A1",
                "instructions": "Listen and repeat the following greetings",
                "phrases": [
                    {"text": "Merhaba", "translation": "Hello", "audio_url": "/audio/merhaba.mp3"},
                    {"text": "Günaydın", "translation": "Good morning", "audio_url": "/audio/gunaydin.mp3"},
                    {"text": "İyi akşamlar", "translation": "Good evening", "audio_url": "/audio/iyiaksamlar.mp3"},
                    {"text": "Hoş geldiniz", "translation": "Welcome", "audio_url": "/audio/hosgeldiniz.mp3"}
                ]
            },
            {
                "id": "numbers_practice",
                "title": "Number Pronunciation",
                "level": "A1",
                "instructions": "Practice counting from 1 to 10",
                "phrases": [
                    {"text": "bir", "translation": "one", "audio_url": "/audio/bir.mp3"},
                    {"text": "iki", "translation": "two", "audio_url": "/audio/iki.mp3"},
                    {"text": "üç", "translation": "three", "audio_url": "/audio/uc.mp3"},
                    {"text": "dört", "translation": "four", "audio_url": "/audio/dort.mp3"},
                    {"text": "beş", "translation": "five", "audio_url": "/audio/bes.mp3"},
                    {"text": "altı", "translation": "six", "audio_url": "/audio/alti.mp3"},
                    {"text": "yedi", "translation": "seven", "audio_url": "/audio/yedi.mp3"},
                    {"text": "sekiz", "translation": "eight", "audio_url": "/audio/sekiz.mp3"},
                    {"text": "dokuz", "translation": "nine", "audio_url": "/audio/dokuz.mp3"},
                    {"text": "on", "translation": "ten", "audio_url": "/audio/on.mp3"}
                ]
            },
            {
                "id": "difficult_sounds",
                "title": "Challenging Turkish Sounds",
                "level": "B1",
                "instructions": "Focus on Turkish-specific sounds that are challenging for learners",
                "phrases": [
                    {"text": "dağ, yağmur, öğretmen", "focus": "soft g (ğ)", "audio_url": "/audio/soft_g.mp3"},
                    {"text": "ısı, kışın, ışık", "focus": "undotted i (ı)", "audio_url": "/audio/undotted_i.mp3"},
                    {"text": "öğrenci, üzüm, gözlük", "focus": "front rounded vowels (ö/ü)", "audio_url": "/audio/front_vowels.mp3"},
                    {"text": "çiçek, çay, çocuk", "focus": "ch sound (ç)", "audio_url": "/audio/ch_sound.mp3"},
                    {"text": "şeker, şarkı, işçi", "focus": "sh sound (ş)", "audio_url": "/audio/sh_sound.mp3"}
                ]
            },
            {
                "id": "vowel_harmony",
                "title": "Turkish Vowel Harmony",
                "level": "B2",
                "instructions": "Practice words that demonstrate Turkish vowel harmony patterns",
                "phrases": [
                    {"text": "evlerimizde", "focus": "front vowel harmony", "audio_url": "/audio/front_harmony.mp3"},
                    {"text": "arabalarımızda", "focus": "back vowel harmony", "audio_url": "/audio/back_harmony.mp3"},
                    {"text": "öğretmenlerimiz", "focus": "mixed harmony", "audio_url": "/audio/mixed_harmony.mp3"}
                ]
            },
            {
                "id": "conversation_phrases",
                "title": "Common Conversation Phrases",
                "level": "A2",
                "instructions": "Practice essential conversation phrases",
                "phrases": [
                    {"text": "Nasılsınız?", "translation": "How are you?", "audio_url": "/audio/nasilsiniz.mp3"},
                    {"text": "Teşekkür ederim", "translation": "Thank you", "audio_url": "/audio/tesekkur.mp3"},
                    {"text": "Özür dilerim", "translation": "I'm sorry", "audio_url": "/audio/ozur.mp3"},
                    {"text": "Anlayamadım", "translation": "I didn't understand", "audio_url": "/audio/anlayamadim.mp3"},
                    {"text": "Tekrar eder misiniz?", "translation": "Could you repeat?", "audio_url": "/audio/tekrar.mp3"}
                ]
            }
        ],
        "practice_tips": [
            "Listen to each phrase multiple times before attempting to repeat",
            "Record yourself and compare with the original audio",
            "Focus on one sound at a time when practicing difficult sounds",
            "Practice in front of a mirror to observe mouth movements",
            "Start slowly and gradually increase speed"
        ]
    }
