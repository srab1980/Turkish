# import openai
# import spacy
# import nltk
from typing import List, Dict, Any, Tuple
import re
import random
from collections import Counter
from app.models.content import CEFRLevel, VocabularyItem, GrammarRule, Exercise, ExerciseType
from app.core.config import settings
from app.services.cefr_analyzer import CEFRAnalyzer

# NLP libraries
try:
    import spacy
    import nltk
    from nltk.tokenize import word_tokenize, sent_tokenize
    from nltk.corpus import stopwords
    SPACY_AVAILABLE = True
    NLTK_AVAILABLE = True
except ImportError:
    SPACY_AVAILABLE = False
    NLTK_AVAILABLE = False

class NLPProcessor:
    """Simplified NLP processing for Turkish language content"""

    def __init__(self):
        # TODO: Initialize OpenAI client when API key is available
        self.openai_client = None
        self.nlp = None
        self.turkish_stopwords = set()
        self.cefr_analyzer = None

        # Initialize spaCy if available
        if SPACY_AVAILABLE:
            try:
                # Try to load Turkish model, fallback to English if not available
                try:
                    self.nlp = spacy.load("tr_core_news_sm")
                except OSError:
                    try:
                        self.nlp = spacy.load("en_core_web_sm")
                    except OSError:
                        # Create blank model if no models available
                        self.nlp = spacy.blank("tr")
            except Exception as e:
                print(f"Error initializing spaCy: {e}")

        # Initialize NLTK if available
        if NLTK_AVAILABLE:
            try:
                # Download required NLTK data if not present
                try:
                    nltk.data.find('tokenizers/punkt')
                except LookupError:
                    print("Downloading NLTK punkt tokenizer...")
                    nltk.download('punkt', quiet=True)

                try:
                    nltk.data.find('corpora/stopwords')
                    self.turkish_stopwords = set(stopwords.words('turkish'))
                except LookupError:
                    print("Turkish stopwords not available, using basic set")
                    self.turkish_stopwords = {'ve', 'bir', 'bu', 'da', 'de', 'ile', 'için', 'var', 'olan', 'gibi'}
            except Exception as e:
                print(f"Error initializing NLTK: {e}")

        # Initialize CEFR analyzer
        self.cefr_analyzer = CEFRAnalyzer(self.nlp)
    
    async def analyze_text_difficulty(self, text: str) -> Tuple[CEFRLevel, float]:
        """Analyze text and determine CEFR level with confidence score using enhanced analyzer"""

        if self.cefr_analyzer:
            try:
                level, confidence, detailed_metrics = await self.cefr_analyzer.analyze_cefr_level(text)
                return level, confidence
            except Exception as e:
                print(f"Error in enhanced CEFR analysis: {e}")
                # Fall back to simple analysis

        # Fallback to simple rule-based classification
        word_count = len(text.split())
        sentences = text.split('.')
        sentence_count = len([s for s in sentences if s.strip()])
        avg_sentence_length = word_count / sentence_count if sentence_count > 0 else 0

        # Simple vocabulary diversity calculation
        words = text.lower().split()
        unique_words = set(words)
        vocabulary_diversity = len(unique_words) / word_count if word_count > 0 else 0

        # Use rule-based classification for now
        level, confidence = self._rule_based_classification(
            avg_sentence_length, vocabulary_diversity, word_count
        )

        return level, confidence
    
    async def extract_vocabulary(self, text: str, target_level: CEFRLevel, max_items: int = 20) -> List[VocabularyItem]:
        """Extract key vocabulary items from text - simplified version"""

        # Simple word extraction
        words = text.lower().split()
        word_freq = Counter(words)

        # Filter meaningful words (length > 2, alphabetic)
        meaningful_words = [word for word in word_freq.keys() if len(word) > 2 and word.isalpha()]

        vocabulary_items = []

        # Create sample vocabulary items (mock data for now)
        sample_translations = {
            "merhaba": "hello",
            "teşekkür": "thank you",
            "lütfen": "please",
            "evet": "yes",
            "hayır": "no",
            "güzel": "beautiful",
            "büyük": "big",
            "küçük": "small"
        }

        for word in meaningful_words[:max_items]:
            translation = sample_translations.get(word, f"translation of {word}")
            vocabulary_items.append(VocabularyItem(
                turkish=word,
                english=translation,
                example_sentence=f"{word} örnek cümle.",
                difficulty_level=target_level,
                frequency_score=word_freq[word] / len(words)
            ))

        return vocabulary_items[:max_items]
    
    async def extract_grammar_rules(self, text: str, target_level: CEFRLevel) -> List[GrammarRule]:
        """Extract grammar patterns and rules from text - simplified version"""

        # Return sample grammar rules for now
        sample_rules = [
            GrammarRule(
                title="Present Tense",
                explanation="Turkish present tense is formed by adding -yor to the verb stem",
                examples=["gidiyorum (I am going)", "geliyorsun (you are coming)"],
                difficulty_level=target_level,
                category="verb conjugation"
            ),
            GrammarRule(
                title="Accusative Case",
                explanation="Direct objects take the accusative case ending -i/-ı/-u/-ü",
                examples=["kitabı okuyor (reading the book)", "suyu içiyor (drinking the water)"],
                difficulty_level=target_level,
                category="case system"
            )
        ]

        return sample_rules[:2]
    
    async def generate_exercises(self, text: str, vocabulary: List[VocabularyItem],
                               target_level: CEFRLevel, max_exercises: int = 10) -> List[Exercise]:
        """Generate diverse exercises based on content and vocabulary"""

        exercises = []

        if not vocabulary:
            return exercises

        # Generate multiple choice vocabulary exercises
        exercises.extend(self._generate_vocabulary_exercises(vocabulary, target_level, max_exercises // 3))

        # Generate fill-in-the-blank exercises from text
        exercises.extend(self._generate_fill_blank_exercises(text, vocabulary, target_level, max_exercises // 3))

        # Generate matching exercises
        exercises.extend(self._generate_matching_exercises(vocabulary, target_level, max_exercises // 3))

        # Generate comprehension exercises if text is long enough
        if len(text.split()) > 50:
            exercises.extend(self._generate_comprehension_exercises(text, target_level, 2))

        return exercises[:max_exercises]

    def _generate_vocabulary_exercises(self, vocabulary: List[VocabularyItem],
                                     target_level: CEFRLevel, max_count: int) -> List[Exercise]:
        """Generate multiple choice vocabulary exercises"""
        exercises = []

        for i, vocab_item in enumerate(vocabulary[:max_count]):
            # Create distractors (wrong answers)
            distractors = []
            for j, other_vocab in enumerate(vocabulary):
                if j != i and len(distractors) < 3:
                    distractors.append(other_vocab.english)

            # Fill remaining distractors with generic ones
            while len(distractors) < 3:
                distractors.append(f"wrong answer {len(distractors) + 1}")

            exercises.append(Exercise(
                type=ExerciseType.MULTIPLE_CHOICE,
                question=f"What does '{vocab_item.turkish}' mean in English?",
                options=[vocab_item.english] + distractors[:3],
                correct_answer="A",
                explanation=f"'{vocab_item.turkish}' means '{vocab_item.english}' in English.",
                difficulty_level=target_level
            ))

        return exercises

    def _generate_fill_blank_exercises(self, text: str, vocabulary: List[VocabularyItem],
                                     target_level: CEFRLevel, max_count: int) -> List[Exercise]:
        """Generate fill-in-the-blank exercises from text"""
        exercises = []

        if NLTK_AVAILABLE:
            try:
                sentences = sent_tokenize(text)
            except:
                sentences = text.split('.')
        else:
            sentences = text.split('.')

        vocab_words = {item.turkish.lower() for item in vocabulary}

        for sentence in sentences[:max_count]:
            sentence = sentence.strip()
            if not sentence or len(sentence.split()) < 4:
                continue

            words = sentence.split()
            # Find vocabulary words in the sentence
            for i, word in enumerate(words):
                clean_word = re.sub(r'[^\w]', '', word.lower())
                if clean_word in vocab_words:
                    # Create fill-in-the-blank
                    blank_sentence = ' '.join(words[:i] + ['_____'] + words[i+1:])

                    exercises.append(Exercise(
                        type=ExerciseType.FILL_BLANK,
                        question=f"Complete the sentence: {blank_sentence}",
                        options=[],
                        correct_answer=clean_word,
                        explanation=f"The correct answer is '{clean_word}'.",
                        difficulty_level=target_level
                    ))
                    break

        return exercises

    def _generate_matching_exercises(self, vocabulary: List[VocabularyItem],
                                   target_level: CEFRLevel, max_count: int) -> List[Exercise]:
        """Generate matching exercises"""
        exercises = []

        if len(vocabulary) >= 4:
            # Create matching exercise with 4 pairs
            selected_vocab = vocabulary[:4]
            turkish_words = [item.turkish for item in selected_vocab]
            english_words = [item.english for item in selected_vocab]

            # Shuffle English words for the exercise
            shuffled_english = english_words.copy()
            random.shuffle(shuffled_english)

            exercises.append(Exercise(
                type=ExerciseType.MATCHING,
                question="Match the Turkish words with their English translations:",
                options=turkish_words + shuffled_english,
                correct_answer="1-A,2-B,3-C,4-D",  # This would need proper mapping
                explanation="Match each Turkish word with its correct English translation.",
                difficulty_level=target_level
            ))

        return exercises

    def _generate_comprehension_exercises(self, text: str, target_level: CEFRLevel,
                                        max_count: int) -> List[Exercise]:
        """Generate reading comprehension exercises"""
        exercises = []

        # Simple comprehension questions based on text content
        if "merhaba" in text.lower():
            exercises.append(Exercise(
                type=ExerciseType.MULTIPLE_CHOICE,
                question="What greeting is mentioned in the text?",
                options=["Merhaba", "Günaydın", "İyi akşamlar", "Hoşça kal"],
                correct_answer="A",
                explanation="The text mentions 'Merhaba' which means 'Hello'.",
                difficulty_level=target_level
            ))

        if "türkçe" in text.lower():
            exercises.append(Exercise(
                type=ExerciseType.MULTIPLE_CHOICE,
                question="What language is mentioned in the text?",
                options=["Turkish", "English", "German", "French"],
                correct_answer="A",
                explanation="The text mentions 'Türkçe' which means 'Turkish'.",
                difficulty_level=target_level
            ))

        return exercises[:max_count]
    
    def _rule_based_classification(self, avg_sentence_length: float, 
                                 vocabulary_diversity: float, word_count: int) -> Tuple[CEFRLevel, float]:
        """Fallback rule-based CEFR classification"""
        
        score = 0
        
        # Sentence length scoring
        if avg_sentence_length < 8:
            score += 1
        elif avg_sentence_length < 12:
            score += 2
        elif avg_sentence_length < 16:
            score += 3
        elif avg_sentence_length < 20:
            score += 4
        else:
            score += 5
        
        # Vocabulary diversity scoring
        if vocabulary_diversity < 0.3:
            score += 1
        elif vocabulary_diversity < 0.5:
            score += 2
        elif vocabulary_diversity < 0.7:
            score += 3
        else:
            score += 4
        
        # Text length scoring
        if word_count < 100:
            score += 1
        elif word_count < 300:
            score += 2
        else:
            score += 3
        
        # Map score to CEFR level
        if score <= 4:
            return CEFRLevel.A1, 0.6
        elif score <= 6:
            return CEFRLevel.A2, 0.65
        elif score <= 8:
            return CEFRLevel.B1, 0.7
        elif score <= 10:
            return CEFRLevel.B2, 0.75
        elif score <= 12:
            return CEFRLevel.C1, 0.8
        else:
            return CEFRLevel.C2, 0.85
    
    async def _call_openai(self, prompt: str, max_tokens: int = 150) -> str:
        """Call OpenAI API with error handling - placeholder"""
        # TODO: Implement when OpenAI client is available
        return "Mock OpenAI response"
    
    def _parse_grammar_rules(self, response: str, target_level: CEFRLevel) -> List[GrammarRule]:
        """Parse grammar rules from OpenAI response"""
        rules = []
        rule_blocks = response.split("---")
        
        for block in rule_blocks:
            if not block.strip():
                continue
                
            lines = block.strip().split('\n')
            title = ""
            explanation = ""
            examples = []
            category = ""
            
            for line in lines:
                if line.startswith("RULE:"):
                    title = line.replace("RULE:", "").strip()
                elif line.startswith("EXPLANATION:"):
                    explanation = line.replace("EXPLANATION:", "").strip()
                elif line.startswith("EXAMPLES:"):
                    examples_str = line.replace("EXAMPLES:", "").strip()
                    examples = [ex.strip() for ex in examples_str.split("|")]
                elif line.startswith("CATEGORY:"):
                    category = line.replace("CATEGORY:", "").strip()
            
            if title and explanation:
                rules.append(GrammarRule(
                    title=title,
                    explanation=explanation,
                    examples=examples,
                    difficulty_level=target_level,
                    category=category
                ))
        
        return rules
    
    def _create_exercise_prompt(self, exercise_type: ExerciseType, text: str, 
                              vocab_words: List[str], target_level: CEFRLevel) -> str:
        """Create prompt for exercise generation"""
        
        if exercise_type == ExerciseType.MULTIPLE_CHOICE:
            return f"""
            Create a multiple choice question for {target_level.value} level Turkish learners.
            Use one of these vocabulary words: {', '.join(vocab_words)}
            
            Format:
            QUESTION: [question in English]
            A) [option]
            B) [option]
            C) [option]
            D) [option]
            CORRECT: [A/B/C/D]
            EXPLANATION: [brief explanation]
            """
        
        elif exercise_type == ExerciseType.FILL_BLANK:
            return f"""
            Create a fill-in-the-blank exercise for {target_level.value} level Turkish learners.
            Use content from this text: {text[:200]}...
            
            Format:
            SENTENCE: [Turkish sentence with _____ blank]
            ANSWER: [correct word/phrase]
            EXPLANATION: [brief explanation]
            """
        
        elif exercise_type == ExerciseType.TRANSLATION:
            return f"""
            Create a translation exercise for {target_level.value} level Turkish learners.
            Use one of these words: {', '.join(vocab_words)}
            
            Format:
            ENGLISH: [English sentence to translate]
            TURKISH: [correct Turkish translation]
            EXPLANATION: [brief explanation]
            """
        
        return ""
    
    def _parse_exercise(self, response: str, exercise_type: ExerciseType,
                       target_level: CEFRLevel) -> Exercise:
        """Parse exercise from OpenAI response - simplified version"""

        # Return a sample exercise for now
        return Exercise(
            type=exercise_type,
            question="Sample question",
            options=["Option A", "Option B", "Option C", "Option D"],
            correct_answer="A",
            explanation="Sample explanation",
            difficulty_level=target_level
        )
