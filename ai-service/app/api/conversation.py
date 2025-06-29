"""
API endpoints for AI Conversation Practice Engine
"""

from fastapi import APIRouter, HTTPException, Depends
from pydantic import BaseModel, Field
from typing import Optional, Dict, Any, List
from datetime import datetime

from app.services.conversation_engine import (
    ConversationEngine, ConversationMode, ConversationDifficulty, 
    ConversationContext, ConversationMessage
)
from app.models.content import CEFRLevel

router = APIRouter(prefix="/conversation", tags=["conversation"])

# Global conversation engine instance
conversation_engine = ConversationEngine()

# In-memory storage for conversation contexts (in production, use Redis or database)
active_conversations: Dict[str, ConversationContext] = {}


class StartConversationRequest(BaseModel):
    """Request model for starting a new conversation"""
    user_id: str = Field(..., description="User identifier")
    mode: ConversationMode = Field(..., description="Conversation practice mode")
    difficulty: ConversationDifficulty = Field(..., description="Conversation difficulty level")
    cefr_level: CEFRLevel = Field(..., description="User's CEFR level")
    topic: Optional[str] = Field(None, description="Specific topic for role-play or guided practice")


class ContinueConversationRequest(BaseModel):
    """Request model for continuing a conversation"""
    session_id: str = Field(..., description="Conversation session ID")
    message: str = Field(..., description="User's message in Turkish")


class ConversationResponse(BaseModel):
    """Response model for conversation interactions"""
    session_id: str
    ai_message: str
    feedback: Optional[Dict[str, Any]] = None
    conversation_active: bool = True


class ConversationSummaryResponse(BaseModel):
    """Response model for conversation summary"""
    session_id: str
    duration_minutes: float
    total_messages: int
    user_messages: int
    total_words: int
    avg_message_length: float
    corrections_given: int
    feedback_instances: int
    mode: str
    topic: Optional[str]
    cefr_level: str


@router.post("/start", response_model=ConversationResponse)
async def start_conversation(request: StartConversationRequest):
    """Start a new conversation practice session"""
    
    try:
        # Create new conversation context
        context = await conversation_engine.start_conversation(
            user_id=request.user_id,
            mode=request.mode,
            difficulty=request.difficulty,
            cefr_level=request.cefr_level,
            topic=request.topic
        )
        
        # Store context in memory (in production, use persistent storage)
        active_conversations[context.session_id] = context
        
        # Get the initial AI message
        initial_message = context.messages[-1].content if context.messages else "Merhaba! Nasılsınız?"
        
        return ConversationResponse(
            session_id=context.session_id,
            ai_message=initial_message,
            feedback=None,
            conversation_active=True
        )
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to start conversation: {str(e)}")


@router.post("/continue", response_model=ConversationResponse)
async def continue_conversation(request: ContinueConversationRequest):
    """Continue an existing conversation with user input"""
    
    # Retrieve conversation context
    context = active_conversations.get(request.session_id)
    if not context:
        raise HTTPException(status_code=404, detail="Conversation session not found")
    
    try:
        # Continue conversation with user message
        ai_response, feedback = await conversation_engine.continue_conversation(
            context=context,
            user_message=request.message
        )
        
        # Update stored context
        active_conversations[request.session_id] = context
        
        return ConversationResponse(
            session_id=request.session_id,
            ai_message=ai_response,
            feedback=feedback,
            conversation_active=True
        )
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to continue conversation: {str(e)}")


@router.get("/summary/{session_id}", response_model=ConversationSummaryResponse)
async def get_conversation_summary(session_id: str):
    """Get summary and analytics for a conversation session"""
    
    context = active_conversations.get(session_id)
    if not context:
        raise HTTPException(status_code=404, detail="Conversation session not found")
    
    try:
        summary = conversation_engine.get_conversation_summary(context)
        
        return ConversationSummaryResponse(
            session_id=summary["session_id"],
            duration_minutes=summary["duration_minutes"],
            total_messages=summary["total_messages"],
            user_messages=summary["user_messages"],
            total_words=summary["total_words"],
            avg_message_length=summary["avg_message_length"],
            corrections_given=summary["corrections_given"],
            feedback_instances=summary["feedback_instances"],
            mode=summary["mode"],
            topic=summary["topic"],
            cefr_level=summary["cefr_level"]
        )
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to get conversation summary: {str(e)}")


@router.get("/history/{session_id}")
async def get_conversation_history(session_id: str):
    """Get full conversation history for a session"""
    
    context = active_conversations.get(session_id)
    if not context:
        raise HTTPException(status_code=404, detail="Conversation session not found")
    
    try:
        messages = []
        for msg in context.messages:
            message_data = {
                "id": msg.id,
                "role": msg.role,
                "content": msg.content,
                "timestamp": msg.timestamp.isoformat(),
                "language": msg.language
            }
            
            if msg.corrections:
                message_data["corrections"] = msg.corrections
            if msg.feedback:
                message_data["feedback"] = msg.feedback
                
            messages.append(message_data)
        
        return {
            "session_id": session_id,
            "mode": context.mode.value,
            "difficulty": context.difficulty.value,
            "cefr_level": context.cefr_level.value,
            "topic": context.topic,
            "created_at": context.created_at.isoformat(),
            "messages": messages
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to get conversation history: {str(e)}")


@router.delete("/end/{session_id}")
async def end_conversation(session_id: str):
    """End a conversation session and clean up resources"""
    
    context = active_conversations.get(session_id)
    if not context:
        raise HTTPException(status_code=404, detail="Conversation session not found")
    
    try:
        # Get final summary before ending
        summary = conversation_engine.get_conversation_summary(context)
        
        # Remove from active conversations
        del active_conversations[session_id]
        
        return {
            "message": "Conversation ended successfully",
            "session_id": session_id,
            "final_summary": summary
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to end conversation: {str(e)}")


@router.get("/modes")
async def get_conversation_modes():
    """Get available conversation modes and topics"""
    
    return {
        "modes": [
            {
                "mode": ConversationMode.FREE_CHAT.value,
                "description": "Open-ended conversation practice",
                "topics": None
            },
            {
                "mode": ConversationMode.GUIDED_PRACTICE.value,
                "description": "Structured conversation with specific topics",
                "topics": ["daily_routine", "family", "hobbies", "work", "travel"]
            },
            {
                "mode": ConversationMode.ROLE_PLAY.value,
                "description": "Practice real-life scenarios",
                "topics": ["restaurant", "shopping", "directions", "hotel", "doctor"]
            },
            {
                "mode": ConversationMode.GRAMMAR_FOCUS.value,
                "description": "Focus on specific grammar patterns",
                "topics": ["present_tense", "past_tense", "future_tense", "conditionals"]
            },
            {
                "mode": ConversationMode.VOCABULARY_PRACTICE.value,
                "description": "Practice specific vocabulary themes",
                "topics": ["food", "family", "colors", "numbers", "time", "weather"]
            }
        ],
        "difficulty_levels": [
            {
                "level": ConversationDifficulty.BEGINNER.value,
                "description": "Simple vocabulary and basic grammar"
            },
            {
                "level": ConversationDifficulty.INTERMEDIATE.value,
                "description": "Moderate complexity with varied topics"
            },
            {
                "level": ConversationDifficulty.ADVANCED.value,
                "description": "Complex discussions and advanced grammar"
            }
        ]
    }


@router.get("/active")
async def get_active_conversations():
    """Get list of currently active conversation sessions (for debugging)"""
    
    active_sessions = []
    for session_id, context in active_conversations.items():
        active_sessions.append({
            "session_id": session_id,
            "user_id": context.user_id,
            "mode": context.mode.value,
            "difficulty": context.difficulty.value,
            "cefr_level": context.cefr_level.value,
            "topic": context.topic,
            "message_count": len(context.messages),
            "created_at": context.created_at.isoformat()
        })
    
    return {
        "active_conversations": len(active_sessions),
        "sessions": active_sessions
    }
