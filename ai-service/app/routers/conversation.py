from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import List, Dict, Any
import os
import json
from openai import OpenAI

router = APIRouter()

class ConversationStartRequest(BaseModel):
    scenario: str
    user_level: str = "A2"
    language: str = "tr"

class ConversationMessage(BaseModel):
    role: str  # "user" or "assistant"
    content: str
    timestamp: str = None

class ConversationResponse(BaseModel):
    message: str
    suggestions: List[str] = []
    feedback: Dict[str, Any] = {}

@router.post("/start")
async def start_conversation(request: ConversationStartRequest):
    """Start a new conversation scenario"""
    
    try:
        # Initialize OpenAI client
        client = OpenAI(api_key=os.getenv("OPENAI_API_KEY"))
        
        if not client.api_key:
            raise HTTPException(status_code=500, detail="OpenAI API key not configured")
        
        # Create scenario-specific prompt
        scenario_prompts = {
            "restaurant_ordering": "You are a friendly Turkish waiter in a restaurant. Help the customer order food in Turkish. Be patient and encouraging.",
            "shopping": "You are a helpful shop assistant in Turkey. Help the customer find what they need and practice shopping vocabulary.",
            "directions": "You are a helpful local person in Istanbul. Help the tourist ask for and understand directions in Turkish.",
            "hotel_checkin": "You are a hotel receptionist in Turkey. Help the guest check in and practice hotel-related vocabulary.",
            "meeting_people": "You are a friendly Turkish person meeting someone new. Practice greetings and basic conversation."
        }
        
        system_prompt = scenario_prompts.get(request.scenario, 
            "You are a helpful Turkish conversation partner. Practice Turkish with the user.")
        
        # Generate opening message
        response = client.chat.completions.create(
            model="gpt-4",
            messages=[
                {"role": "system", "content": f"{system_prompt} The user is at {request.user_level} level. Keep language appropriate for their level. Always respond in Turkish with English translations in parentheses when helpful."},
                {"role": "user", "content": f"Start a conversation scenario about {request.scenario}. Greet me and set the scene."}
            ],
            temperature=0.8,
            max_tokens=200
        )
        
        opening_message = response.choices[0].message.content
        
        # Generate conversation suggestions
        suggestions_response = client.chat.completions.create(
            model="gpt-4",
            messages=[
                {"role": "system", "content": f"Generate 3 simple Turkish phrases a {request.user_level} level learner could use in a {request.scenario} scenario. Include English translations."},
                {"role": "user", "content": "Give me 3 useful phrases for this scenario."}
            ],
            temperature=0.7,
            max_tokens=150
        )
        
        suggestions_text = suggestions_response.choices[0].message.content
        suggestions = suggestions_text.split('\n')[:3]  # Take first 3 lines
        
        return {
            "message": "Conversation started successfully",
            "scenario": request.scenario,
            "user_level": request.user_level,
            "opening_message": opening_message,
            "suggestions": suggestions,
            "conversation_id": f"conv_{request.scenario}_{request.user_level}",
            "status": "active"
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to start conversation: {str(e)}")

@router.post("/respond")
async def respond_to_message(
    conversation_id: str,
    user_message: str,
    scenario: str = "general",
    user_level: str = "A2"
):
    """Respond to user message in conversation"""
    
    try:
        # Initialize OpenAI client
        client = OpenAI(api_key=os.getenv("OPENAI_API_KEY"))
        
        if not client.api_key:
            raise HTTPException(status_code=500, detail="OpenAI API key not configured")
        
        # Generate response
        response = client.chat.completions.create(
            model="gpt-4",
            messages=[
                {"role": "system", "content": f"You are having a Turkish conversation about {scenario}. The user is at {user_level} level. Respond naturally, correct any mistakes gently, and keep the conversation flowing. Include English translations for difficult words."},
                {"role": "user", "content": user_message}
            ],
            temperature=0.8,
            max_tokens=200
        )
        
        ai_response = response.choices[0].message.content
        
        # Generate feedback on user's Turkish
        feedback_response = client.chat.completions.create(
            model="gpt-4",
            messages=[
                {"role": "system", "content": f"Analyze this Turkish message from a {user_level} learner: '{user_message}'. Provide brief, encouraging feedback on grammar, vocabulary, and suggestions for improvement. Be positive and constructive."},
                {"role": "user", "content": "Analyze my Turkish and give feedback."}
            ],
            temperature=0.5,
            max_tokens=100
        )
        
        feedback_text = feedback_response.choices[0].message.content
        
        return {
            "message": "Response generated successfully",
            "ai_response": ai_response,
            "feedback": {
                "text": feedback_text,
                "encouragement": "Great job practicing Turkish!",
                "level_appropriate": True
            },
            "conversation_id": conversation_id,
            "status": "active"
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to generate response: {str(e)}")

@router.get("/scenarios")
async def get_conversation_scenarios():
    """Get available conversation scenarios"""
    
    scenarios = [
        {
            "id": "restaurant_ordering",
            "name": "Restaurant Ordering",
            "description": "Practice ordering food and drinks in Turkish",
            "difficulty": "A2-B1",
            "vocabulary_focus": ["food", "drinks", "ordering", "payment"]
        },
        {
            "id": "shopping",
            "name": "Shopping",
            "description": "Practice shopping for clothes, groceries, and souvenirs",
            "difficulty": "A1-A2",
            "vocabulary_focus": ["clothes", "colors", "sizes", "prices"]
        },
        {
            "id": "directions",
            "name": "Asking for Directions",
            "description": "Practice asking for and giving directions in Turkish",
            "difficulty": "A2-B1",
            "vocabulary_focus": ["locations", "directions", "transportation"]
        },
        {
            "id": "hotel_checkin",
            "name": "Hotel Check-in",
            "description": "Practice hotel check-in and accommodation vocabulary",
            "difficulty": "A2-B1",
            "vocabulary_focus": ["hotel", "rooms", "services", "booking"]
        },
        {
            "id": "meeting_people",
            "name": "Meeting New People",
            "description": "Practice introductions and basic social conversation",
            "difficulty": "A1-A2",
            "vocabulary_focus": ["greetings", "introductions", "personal info"]
        }
    ]
    
    return {
        "message": "Available conversation scenarios",
        "scenarios": scenarios,
        "total_scenarios": len(scenarios)
    }

@router.post("/pronunciation-feedback")
async def get_pronunciation_feedback(
    text: str,
    user_level: str = "A2"
):
    """Get pronunciation tips and feedback for Turkish text"""
    
    try:
        # Initialize OpenAI client
        client = OpenAI(api_key=os.getenv("OPENAI_API_KEY"))
        
        if not client.api_key:
            raise HTTPException(status_code=500, detail="OpenAI API key not configured")
        
        # Generate pronunciation guidance
        response = client.chat.completions.create(
            model="gpt-4",
            messages=[
                {"role": "system", "content": f"You are a Turkish pronunciation expert. Provide pronunciation guidance for {user_level} level learners. Include phonetic transcription, stress patterns, and common pronunciation mistakes to avoid."},
                {"role": "user", "content": f"Help me pronounce this Turkish text correctly: '{text}'"}
            ],
            temperature=0.3,
            max_tokens=300
        )
        
        pronunciation_guide = response.choices[0].message.content
        
        return {
            "message": "Pronunciation feedback generated",
            "text": text,
            "pronunciation_guide": pronunciation_guide,
            "user_level": user_level,
            "tips": [
                "Listen to native speakers",
                "Practice vowel sounds carefully",
                "Pay attention to stress patterns",
                "Record yourself and compare"
            ]
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to generate pronunciation feedback: {str(e)}")
