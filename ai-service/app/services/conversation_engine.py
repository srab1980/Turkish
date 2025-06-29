"""
AI Conversation Practice Engine for Turkish Language Learning
Provides GPT-powered conversational AI for speaking and chat practice
"""

import json
import random
from typing import List, Dict, Any, Optional, Tuple
from datetime import datetime
from enum import Enum
from dataclasses import dataclass, asdict

from app.models.content import CEFRLevel


class ConversationMode(Enum):
    """Different conversation practice modes"""
    FREE_CHAT = "free_chat"
    GUIDED_PRACTICE = "guided_practice"
    ROLE_PLAY = "role_play"
    GRAMMAR_FOCUS = "grammar_focus"
    VOCABULARY_PRACTICE = "vocabulary_practice"


class ConversationDifficulty(Enum):
    """Conversation difficulty levels"""
    BEGINNER = "beginner"
    INTERMEDIATE = "intermediate"
    ADVANCED = "advanced"


@dataclass
class ConversationMessage:
    """Represents a single message in conversation"""
    id: str
    role: str  # 'user' or 'assistant'
    content: str
    timestamp: datetime
    language: str = "tr"  # Turkish by default
    corrections: Optional[List[Dict]] = None
    feedback: Optional[str] = None


@dataclass
class ConversationContext:
    """Maintains conversation context and state"""
    session_id: str
    user_id: str
    mode: ConversationMode
    difficulty: ConversationDifficulty
    cefr_level: CEFRLevel
    topic: Optional[str] = None
    target_grammar: Optional[List[str]] = None
    target_vocabulary: Optional[List[str]] = None
    messages: List[ConversationMessage] = None
    created_at: datetime = None
    
    def __post_init__(self):
        if self.messages is None:
            self.messages = []
        if self.created_at is None:
            self.created_at = datetime.now()


class ConversationEngine:
    """AI-powered conversation practice engine"""
    
    def __init__(self):
        # TODO: Initialize OpenAI client when available
        self.openai_client = None
        
        # Conversation templates and scenarios
        self.conversation_scenarios = {
            ConversationMode.ROLE_PLAY: {
                "restaurant": {
                    "description": "Ordering food at a Turkish restaurant",
                    "system_prompt": "You are a friendly waiter at a Turkish restaurant. Help the customer order food and drinks. Speak in Turkish and be patient with their language level.",
                    "starter": "Hoş geldiniz! Masanıza buyurun. Ne içmek istersiniz?"
                },
                "shopping": {
                    "description": "Shopping for clothes in Istanbul",
                    "system_prompt": "You are a helpful shop assistant in a clothing store in Istanbul. Help the customer find what they need. Speak in Turkish.",
                    "starter": "Merhaba! Size nasıl yardımcı olabilirim?"
                },
                "directions": {
                    "description": "Asking for directions in the city",
                    "system_prompt": "You are a helpful local person in Istanbul. Someone is asking you for directions. Be friendly and helpful. Speak in Turkish.",
                    "starter": "Merhaba! Size yardım edebilir miyim?"
                }
            },
            ConversationMode.GUIDED_PRACTICE: {
                "daily_routine": {
                    "description": "Talking about daily routines",
                    "system_prompt": "Help the user practice talking about daily routines in Turkish. Ask questions about their day, work, hobbies. Provide gentle corrections.",
                    "starter": "Merhaba! Bugün nasıl geçti? Bana gününüzden bahsedin."
                },
                "family": {
                    "description": "Discussing family and relationships",
                    "system_prompt": "Help the user practice talking about family in Turkish. Ask about family members, relationships. Be encouraging.",
                    "starter": "Ailenizden bahseder misiniz? Kaç kardeşiniz var?"
                }
            }
        }
        
        # Grammar focus areas
        self.grammar_topics = {
            CEFRLevel.A1: ["present tense", "basic word order", "simple questions"],
            CEFRLevel.A2: ["past tense", "future tense", "possessive forms"],
            CEFRLevel.B1: ["conditional", "passive voice", "reported speech"],
            CEFRLevel.B2: ["subjunctive", "complex sentences", "advanced tenses"],
            CEFRLevel.C1: ["advanced grammar", "idiomatic expressions", "formal language"],
            CEFRLevel.C2: ["literary language", "complex discourse", "nuanced expressions"]
        }
        
        # Common Turkish conversation starters by level
        self.conversation_starters = {
            CEFRLevel.A1: [
                "Merhaba! Nasılsınız?",
                "Adınız ne?",
                "Nerelisiniz?",
                "Kaç yaşındasınız?"
            ],
            CEFRLevel.A2: [
                "Bugün hava nasıl?",
                "Ne iş yapıyorsunuz?",
                "Hangi dilleri konuşuyorsunuz?",
                "Türkiye'yi seviyor musunuz?"
            ],
            CEFRLevel.B1: [
                "Türkçe öğrenmeye ne zaman başladınız?",
                "En sevdiğiniz Türk yemeği nedir?",
                "Türkiye'de hangi şehirleri ziyaret ettiniz?",
                "Gelecek planlarınız neler?"
            ]
        }
    
    async def start_conversation(self, user_id: str, mode: ConversationMode, 
                                difficulty: ConversationDifficulty, cefr_level: CEFRLevel,
                                topic: Optional[str] = None) -> ConversationContext:
        """Start a new conversation session"""
        
        session_id = f"conv_{user_id}_{datetime.now().strftime('%Y%m%d_%H%M%S')}"
        
        context = ConversationContext(
            session_id=session_id,
            user_id=user_id,
            mode=mode,
            difficulty=difficulty,
            cefr_level=cefr_level,
            topic=topic
        )
        
        # Generate initial AI message based on mode and topic
        initial_message = await self._generate_initial_message(context)
        
        ai_message = ConversationMessage(
            id=f"msg_{len(context.messages) + 1}",
            role="assistant",
            content=initial_message,
            timestamp=datetime.now()
        )
        
        context.messages.append(ai_message)
        
        return context
    
    async def continue_conversation(self, context: ConversationContext, 
                                  user_message: str) -> Tuple[str, Optional[Dict]]:
        """Continue conversation with user input and return AI response with feedback"""
        
        # Add user message to context
        user_msg = ConversationMessage(
            id=f"msg_{len(context.messages) + 1}",
            role="user",
            content=user_message,
            timestamp=datetime.now()
        )
        context.messages.append(user_msg)
        
        # Analyze user message for corrections and feedback
        corrections, feedback = await self._analyze_user_message(user_message, context)
        user_msg.corrections = corrections
        user_msg.feedback = feedback
        
        # Generate AI response
        ai_response = await self._generate_ai_response(context)
        
        # Add AI message to context
        ai_msg = ConversationMessage(
            id=f"msg_{len(context.messages) + 1}",
            role="assistant",
            content=ai_response,
            timestamp=datetime.now()
        )
        context.messages.append(ai_msg)
        
        # Prepare feedback for user
        feedback_data = None
        if corrections or feedback:
            feedback_data = {
                "corrections": corrections,
                "feedback": feedback,
                "encouragement": self._generate_encouragement(context.cefr_level)
            }
        
        return ai_response, feedback_data
    
    async def _generate_initial_message(self, context: ConversationContext) -> str:
        """Generate the initial AI message based on conversation context"""
        
        if context.mode == ConversationMode.ROLE_PLAY and context.topic:
            scenario = self.conversation_scenarios.get(context.mode, {}).get(context.topic)
            if scenario:
                return scenario["starter"]
        
        # Use level-appropriate conversation starter
        starters = self.conversation_starters.get(context.cefr_level, self.conversation_starters[CEFRLevel.A1])
        return random.choice(starters)
    
    async def _generate_ai_response(self, context: ConversationContext) -> str:
        """Generate AI response based on conversation context"""
        
        # For now, use rule-based responses
        # TODO: Integrate with OpenAI when available
        
        last_user_message = None
        for msg in reversed(context.messages):
            if msg.role == "user":
                last_user_message = msg.content.lower()
                break
        
        if not last_user_message:
            return "Anlayamadım. Tekrar söyler misiniz?"
        
        # Simple response generation based on keywords
        responses = self._get_contextual_responses(context, last_user_message)
        return random.choice(responses)
    
    def _get_contextual_responses(self, context: ConversationContext, user_input: str) -> List[str]:
        """Get contextual responses based on user input and conversation mode"""
        
        # Basic keyword-based responses
        if any(word in user_input for word in ["merhaba", "selam", "hello"]):
            return [
                "Merhaba! Nasılsınız?",
                "Selam! Bugün nasıl geçiyor?",
                "Hoş geldiniz! Size nasıl yardımcı olabilirim?"
            ]
        
        if any(word in user_input for word in ["iyiyim", "iyi", "güzel"]):
            return [
                "Çok güzel! Bana kendinizden bahsedin.",
                "Harika! Bugün ne yapıyorsunuz?",
                "Mükemmel! Türkçe pratiği yapmaya devam edelim."
            ]
        
        if any(word in user_input for word in ["adım", "isim", "name"]):
            return [
                "Çok güzel bir isim! Nerelisiniz?",
                "Tanıştığımıza memnun oldum! Türkiye'yi seviyor musunuz?",
                "Hoş bir isim! Türkçe öğrenmeye ne zaman başladınız?"
            ]
        
        # Mode-specific responses
        if context.mode == ConversationMode.ROLE_PLAY:
            if context.topic == "restaurant":
                return [
                    "Tabii! Menümüze bakabilirsiniz. Ne tür yemek seviyorsunuz?",
                    "Bugün özel menümüzde kebap var. Dener misiniz?",
                    "İçecek olarak ne istersiniz? Çay, kahve, ayran?"
                ]
            elif context.topic == "shopping":
                return [
                    "Hangi rengi seviyorsunuz?",
                    "Bu size çok yakışır! Denemek ister misiniz?",
                    "Başka bir şey arıyor musunuz?"
                ]
        
        # Default responses based on CEFR level
        if context.cefr_level in [CEFRLevel.A1, CEFRLevel.A2]:
            return [
                "Çok güzel! Devam edin.",
                "Anlıyorum. Başka ne söylemek istiyorsunuz?",
                "İyi! Daha fazla pratik yapalım."
            ]
        else:
            return [
                "İlginç bir bakış açısı! Bu konuda ne düşünüyorsunuz?",
                "Haklısınız. Bu durumda ne yapardınız?",
                "Çok güzel açıkladınız. Başka örnekler verebilir misiniz?"
            ]
    
    async def _analyze_user_message(self, message: str, context: ConversationContext) -> Tuple[List[Dict], Optional[str]]:
        """Analyze user message for grammar/vocabulary corrections"""
        
        corrections = []
        feedback = None
        
        # Simple rule-based corrections for common mistakes
        # TODO: Implement more sophisticated NLP analysis
        
        # Check for common grammar mistakes
        if "ben gidiyorum" in message.lower() and "ben gidiyorum" in message.lower():
            # This is correct, no correction needed
            pass
        
        # Check for missing question words
        if message.endswith("?") and not any(word in message.lower() for word in ["ne", "nerede", "nasıl", "kim", "kaç"]):
            feedback = "Türkçe'de soru sorarken 'ne', 'nerede', 'nasıl' gibi soru kelimelerini kullanmayı unutmayın."
        
        # Encourage longer responses for advanced learners
        if context.cefr_level in [CEFRLevel.B2, CEFRLevel.C1, CEFRLevel.C2] and len(message.split()) < 5:
            feedback = "Daha detaylı cevaplar vermeye çalışın. Fikirlerinizi genişletin!"
        
        return corrections, feedback
    
    def _generate_encouragement(self, cefr_level: CEFRLevel) -> str:
        """Generate encouraging feedback based on user level"""
        
        encouragements = {
            CEFRLevel.A1: [
                "Harika! Türkçe öğrenmeye devam edin!",
                "Çok güzel! Her gün biraz daha iyileşiyorsunuz.",
                "Mükemmel! Pratik yapmaya devam edin."
            ],
            CEFRLevel.A2: [
                "Çok iyi ilerliyorsunuz! Devam edin!",
                "Türkçeniz gerçekten gelişiyor!",
                "Harika! Daha karmaşık cümleler kurmaya başlayabilirsiniz."
            ],
            CEFRLevel.B1: [
                "Türkçeniz çok akıcı! Tebrikler!",
                "Mükemmel! Daha karmaşık konuları tartışabilirsiniz.",
                "Harika! Türkçe düşünmeye başladığınızı hissediyorum."
            ]
        }
        
        level_encouragements = encouragements.get(cefr_level, encouragements[CEFRLevel.A1])
        return random.choice(level_encouragements)
    
    def get_conversation_summary(self, context: ConversationContext) -> Dict[str, Any]:
        """Generate conversation summary and learning insights"""
        
        total_messages = len(context.messages)
        user_messages = [msg for msg in context.messages if msg.role == "user"]
        
        # Calculate basic metrics
        total_words = sum(len(msg.content.split()) for msg in user_messages)
        avg_message_length = total_words / len(user_messages) if user_messages else 0
        
        # Count corrections and feedback
        total_corrections = sum(len(msg.corrections or []) for msg in user_messages)
        feedback_count = sum(1 for msg in user_messages if msg.feedback)
        
        return {
            "session_id": context.session_id,
            "duration_minutes": (datetime.now() - context.created_at).total_seconds() / 60,
            "total_messages": total_messages,
            "user_messages": len(user_messages),
            "total_words": total_words,
            "avg_message_length": avg_message_length,
            "corrections_given": total_corrections,
            "feedback_instances": feedback_count,
            "mode": context.mode.value,
            "topic": context.topic,
            "cefr_level": context.cefr_level.value
        }
