"""
CEFR Level Analyzer for Turkish Language Content
Implements comprehensive CEFR level classification and difficulty assessment
"""

import re
from typing import Dict, List, Tuple, Set
from collections import Counter
from app.models.content import CEFRLevel

try:
    import spacy
    import nltk
    from nltk.tokenize import sent_tokenize, word_tokenize
    SPACY_AVAILABLE = True
    NLTK_AVAILABLE = True
except ImportError:
    SPACY_AVAILABLE = False
    NLTK_AVAILABLE = False


class CEFRAnalyzer:
    """Advanced CEFR level analyzer for Turkish language content"""
    
    def __init__(self, nlp_model=None):
        self.nlp = nlp_model
        self.turkish_stopwords = {'ve', 'bir', 'bu', 'da', 'de', 'ile', 'için', 'var', 'olan', 'gibi', 
                                 'bu', 'şu', 'o', 'ben', 'sen', 'biz', 'siz', 'onlar', 'ki', 'mi', 'mu', 'mü'}
        
        # CEFR level vocabulary lists (simplified)
        self.cefr_vocabulary = {
            CEFRLevel.A1: {
                'merhaba', 'teşekkür', 'lütfen', 'evet', 'hayır', 'ben', 'sen', 'o', 'bir', 'iki', 
                'üç', 'ev', 'okul', 'su', 'yemek', 'gitmek', 'gelmek', 'olmak', 'yapmak'
            },
            CEFRLevel.A2: {
                'arkadaş', 'aile', 'çalışmak', 'öğrenmek', 'konuşmak', 'dinlemek', 'okumak', 
                'yazmak', 'güzel', 'büyük', 'küçük', 'iyi', 'kötü', 'zaman', 'gün', 'hafta'
            },
            CEFRLevel.B1: {
                'düşünmek', 'anlamak', 'açıklamak', 'tartışmak', 'karar', 'problem', 'çözüm', 
                'gelecek', 'geçmiş', 'deneyim', 'görüş', 'fikir', 'toplum', 'kültür'
            },
            CEFRLevel.B2: {
                'analiz', 'değerlendirmek', 'karşılaştırmak', 'eleştirmek', 'önermek', 
                'varsaymak', 'sonuç', 'neden', 'etki', 'gelişim', 'süreç', 'yöntem'
            },
            CEFRLevel.C1: {
                'kapsamlı', 'detaylı', 'karmaşık', 'soyut', 'teorik', 'sistematik', 
                'objektif', 'subjektif', 'hipotez', 'metodoloji', 'paradigma'
            },
            CEFRLevel.C2: {
                'sofistike', 'nüans', 'ironi', 'metafor', 'alegori', 'epistemoloji', 
                'fenomenoloji', 'hermeneutik', 'dialektik', 'ontoloji'
            }
        }
        
        # Grammar complexity patterns
        self.grammar_patterns = {
            CEFRLevel.A1: [
                r'\b(ben|sen|o)\s+\w+\b',  # Simple subject-verb
                r'\b\w+\s+(var|yok)\b',    # Existence
            ],
            CEFRLevel.A2: [
                r'\b\w+\s+\w+yor\b',       # Present continuous
                r'\b\w+\s+\w+di\b',        # Past tense
            ],
            CEFRLevel.B1: [
                r'\b\w+\s+\w+ecek\b',      # Future tense
                r'\b\w+\s+\w+se\b',        # Conditional
            ],
            CEFRLevel.B2: [
                r'\b\w+\s+\w+mış\b',       # Evidential
                r'\b\w+\s+\w+ken\b',       # While/when
            ],
            CEFRLevel.C1: [
                r'\b\w+\s+\w+meli\b',      # Necessity
                r'\b\w+\s+\w+bilir\b',     # Ability/possibility
            ],
            CEFRLevel.C2: [
                r'\b\w+\s+\w+casına\b',    # As if
                r'\b\w+\s+\w+maksızın\b',  # Without
            ]
        }
    
    async def analyze_cefr_level(self, text: str) -> Tuple[CEFRLevel, float, Dict]:
        """
        Comprehensive CEFR level analysis
        Returns: (level, confidence, detailed_metrics)
        """
        
        # Basic text metrics
        basic_metrics = self._calculate_basic_metrics(text)
        
        # Vocabulary analysis
        vocab_metrics = self._analyze_vocabulary_complexity(text)
        
        # Grammar analysis
        grammar_metrics = self._analyze_grammar_complexity(text)
        
        # Sentence structure analysis
        structure_metrics = self._analyze_sentence_structure(text)
        
        # Combine all metrics
        combined_score = self._combine_metrics(
            basic_metrics, vocab_metrics, grammar_metrics, structure_metrics
        )
        
        # Map to CEFR level
        level, confidence = self._map_to_cefr_level(combined_score)
        
        detailed_metrics = {
            'basic_metrics': basic_metrics,
            'vocabulary_metrics': vocab_metrics,
            'grammar_metrics': grammar_metrics,
            'structure_metrics': structure_metrics,
            'combined_score': combined_score
        }
        
        return level, confidence, detailed_metrics
    
    def _calculate_basic_metrics(self, text: str) -> Dict:
        """Calculate basic text complexity metrics"""
        
        # Tokenization
        if NLTK_AVAILABLE:
            try:
                sentences = sent_tokenize(text)
                words = word_tokenize(text.lower())
            except:
                sentences = text.split('.')
                words = text.lower().split()
        else:
            sentences = text.split('.')
            words = text.lower().split()
        
        # Filter content words
        content_words = [w for w in words if w.isalpha() and w not in self.turkish_stopwords]
        
        # Calculate metrics
        word_count = len(content_words)
        sentence_count = len([s for s in sentences if s.strip()])
        avg_sentence_length = word_count / sentence_count if sentence_count > 0 else 0
        
        # Vocabulary diversity (Type-Token Ratio)
        unique_words = set(content_words)
        vocabulary_diversity = len(unique_words) / word_count if word_count > 0 else 0
        
        # Average word length
        avg_word_length = sum(len(word) for word in content_words) / len(content_words) if content_words else 0
        
        return {
            'word_count': word_count,
            'sentence_count': sentence_count,
            'avg_sentence_length': avg_sentence_length,
            'vocabulary_diversity': vocabulary_diversity,
            'avg_word_length': avg_word_length
        }
    
    def _analyze_vocabulary_complexity(self, text: str) -> Dict:
        """Analyze vocabulary complexity based on CEFR word lists"""
        
        words = text.lower().split()
        content_words = [w for w in words if w.isalpha() and w not in self.turkish_stopwords]
        
        level_counts = {level: 0 for level in CEFRLevel}
        total_recognized = 0
        
        for word in content_words:
            for level, vocab_set in self.cefr_vocabulary.items():
                if word in vocab_set:
                    level_counts[level] += 1
                    total_recognized += 1
                    break
        
        # Calculate vocabulary level distribution
        vocab_distribution = {}
        if total_recognized > 0:
            for level, count in level_counts.items():
                vocab_distribution[level.value] = count / total_recognized
        
        # Calculate average vocabulary level
        weighted_sum = 0
        level_weights = {CEFRLevel.A1: 1, CEFRLevel.A2: 2, CEFRLevel.B1: 3, 
                        CEFRLevel.B2: 4, CEFRLevel.C1: 5, CEFRLevel.C2: 6}
        
        for level, count in level_counts.items():
            weighted_sum += level_weights[level] * count
        
        avg_vocab_level = weighted_sum / total_recognized if total_recognized > 0 else 3
        
        return {
            'level_distribution': vocab_distribution,
            'avg_vocabulary_level': avg_vocab_level,
            'recognition_rate': total_recognized / len(content_words) if content_words else 0
        }
    
    def _analyze_grammar_complexity(self, text: str) -> Dict:
        """Analyze grammatical complexity using pattern matching"""
        
        grammar_scores = {level: 0 for level in CEFRLevel}
        
        for level, patterns in self.grammar_patterns.items():
            for pattern in patterns:
                matches = re.findall(pattern, text, re.IGNORECASE)
                grammar_scores[level] += len(matches)
        
        total_patterns = sum(grammar_scores.values())
        
        # Calculate grammar complexity score
        if total_patterns > 0:
            level_weights = {CEFRLevel.A1: 1, CEFRLevel.A2: 2, CEFRLevel.B1: 3, 
                            CEFRLevel.B2: 4, CEFRLevel.C1: 5, CEFRLevel.C2: 6}
            
            weighted_sum = sum(level_weights[level] * count for level, count in grammar_scores.items())
            avg_grammar_level = weighted_sum / total_patterns
        else:
            avg_grammar_level = 2  # Default to A2 level
        
        return {
            'pattern_counts': {level.value: count for level, count in grammar_scores.items()},
            'avg_grammar_level': avg_grammar_level,
            'total_patterns': total_patterns
        }
    
    def _analyze_sentence_structure(self, text: str) -> Dict:
        """Analyze sentence structure complexity"""
        
        if NLTK_AVAILABLE:
            try:
                sentences = sent_tokenize(text)
            except:
                sentences = text.split('.')
        else:
            sentences = text.split('.')
        
        sentences = [s.strip() for s in sentences if s.strip()]
        
        # Analyze sentence complexity
        complex_sentences = 0
        subordinate_clauses = 0
        
        for sentence in sentences:
            # Count subordinate clause indicators
            subordinate_indicators = ['ki', 'çünkü', 'eğer', 'ama', 'fakat', 'ancak', 'lakin']
            for indicator in subordinate_indicators:
                if indicator in sentence.lower():
                    subordinate_clauses += 1
            
            # Complex sentence detection (simple heuristic)
            if len(sentence.split()) > 15 or any(ind in sentence.lower() for ind in subordinate_indicators):
                complex_sentences += 1
        
        complexity_ratio = complex_sentences / len(sentences) if sentences else 0
        subordination_ratio = subordinate_clauses / len(sentences) if sentences else 0
        
        return {
            'complexity_ratio': complexity_ratio,
            'subordination_ratio': subordination_ratio,
            'avg_sentence_complexity': (complexity_ratio + subordination_ratio) / 2
        }
    
    def _combine_metrics(self, basic: Dict, vocab: Dict, grammar: Dict, structure: Dict) -> float:
        """Combine all metrics into a single complexity score"""
        
        # Normalize metrics to 0-1 scale
        sentence_complexity = min(basic['avg_sentence_length'] / 25, 1.0)
        vocab_complexity = min(vocab['avg_vocabulary_level'] / 6, 1.0)
        grammar_complexity = min(grammar['avg_grammar_level'] / 6, 1.0)
        structure_complexity = structure['avg_sentence_complexity']
        
        # Weighted combination
        combined_score = (
            sentence_complexity * 0.25 +
            vocab_complexity * 0.35 +
            grammar_complexity * 0.25 +
            structure_complexity * 0.15
        )
        
        return combined_score
    
    def _map_to_cefr_level(self, score: float) -> Tuple[CEFRLevel, float]:
        """Map combined score to CEFR level with confidence"""
        
        if score <= 0.15:
            return CEFRLevel.A1, 0.9
        elif score <= 0.3:
            return CEFRLevel.A2, 0.85
        elif score <= 0.5:
            return CEFRLevel.B1, 0.8
        elif score <= 0.7:
            return CEFRLevel.B2, 0.75
        elif score <= 0.85:
            return CEFRLevel.C1, 0.7
        else:
            return CEFRLevel.C2, 0.65
