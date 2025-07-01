import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Exercise } from '../lessons/entities/exercise.entity';

import { VocabularyItem } from '../lessons/entities/vocabulary-item.entity';
import { GrammarRule } from '../lessons/entities/grammar-rule.entity';

@Injectable()
export class ExerciseGeneratorService {
  constructor(
    @InjectRepository(Exercise)
    private exerciseRepository: Repository<Exercise>,

    @InjectRepository(VocabularyItem)
    private vocabularyRepository: Repository<VocabularyItem>,
    @InjectRepository(GrammarRule)
    private grammarRepository: Repository<GrammarRule>
  ) {}

  async generateVocabularyExercises(lessonId: string, vocabularyItems: VocabularyItem[]): Promise<Exercise[]> {
    const exercises = [];

    // Generate matching exercise
    const matchingExercise = await this.generateMatchingExercise(lessonId, vocabularyItems);
    exercises.push(matchingExercise);

    // Generate fill-in-the-blank exercise
    const fillBlankExercise = await this.generateFillBlankExercise(lessonId, vocabularyItems);
    exercises.push(fillBlankExercise);

    // Generate image association exercise
    const imageExercise = await this.generateImageAssociationExercise(lessonId, vocabularyItems);
    exercises.push(imageExercise);

    return exercises;
  }

  async generateGrammarExercises(lessonId: string, grammarRules: GrammarRule[]): Promise<Exercise[]> {
    const exercises = [];

    for (const rule of grammarRules) {
      // Generate conjugation exercise
      const conjugationExercise = await this.generateConjugationExercise(lessonId, rule);
      exercises.push(conjugationExercise);

      // Generate sentence completion exercise
      const sentenceExercise = await this.generateSentenceCompletionExercise(lessonId, rule);
      exercises.push(sentenceExercise);
    }

    return exercises;
  }

  async generateListeningExercises(lessonId: string, audioContent: any[]): Promise<Exercise[]> {
    const exercises = [];

    // Generate comprehension exercise
    const comprehensionExercise = await this.generateListeningComprehensionExercise(lessonId, audioContent);
    exercises.push(comprehensionExercise);

    // Generate dictation exercise
    const dictationExercise = await this.generateDictationExercise(lessonId, audioContent);
    exercises.push(dictationExercise);

    return exercises;
  }

  async generateSpeakingExercises(lessonId: string, pronunciationItems: any[]): Promise<Exercise[]> {
    const exercises = [];

    // Generate pronunciation exercise
    const pronunciationExercise = await this.generatePronunciationExercise(lessonId, pronunciationItems);
    exercises.push(pronunciationExercise);

    // Generate conversation exercise
    const conversationExercise = await this.generateConversationExercise(lessonId, pronunciationItems);
    exercises.push(conversationExercise);

    return exercises;
  }

  async generateWritingExercises(lessonId: string, writingPrompts: any[]): Promise<Exercise[]> {
    const exercises = [];

    // Generate sentence construction exercise
    const sentenceExercise = await this.generateSentenceConstructionExercise(lessonId, writingPrompts);
    exercises.push(sentenceExercise);

    // Generate guided writing exercise
    const guidedWritingExercise = await this.generateGuidedWritingExercise(lessonId, writingPrompts);
    exercises.push(guidedWritingExercise);

    return exercises;
  }

  private async generateMatchingExercise(lessonId: string, vocabularyItems: VocabularyItem[]): Promise<Exercise> {
    
    const pairs = vocabularyItems.slice(0, 8).map((item, index) => ({
      id: `pair${index + 1}`,
      turkish: item.turkishWord,
      english: item.englishTranslation,
      audioUrl: `/audio/${item.turkishWord}.mp3`
    }));

    const correctAnswers = {};
    pairs.forEach(pair => {
      correctAnswers[pair.id] = pair.english;
    });

    return this.exerciseRepository.create({
      lessonId,
      title: 'Kelime Eşleştirme (Word Matching)',
      instructions: 'Match the Turkish words with their English meanings',
      content: {
        type: 'drag_drop_matching',
        pairs
      },
      correctAnswers,
      hints: this.generateHints(pairs),
      feedback: {
        correct: 'Mükemmel! Perfect!',
        incorrect: 'Tekrar deneyin! Try again!',
        partial: 'İyi! Good! Keep going!'
      },
      points: 10,
      timeLimit: 120,
      difficultyLevel: 1,
      orderIndex: 1,
      isPublished: true
    });
  }

  private async generateFillBlankExercise(lessonId: string, vocabularyItems: VocabularyItem[]): Promise<Exercise> {
    
    const selectedItems = vocabularyItems.slice(0, 4);
    const dialogue = selectedItems.map((item, index) => ({
      speaker: index % 2 === 0 ? 'A' : 'B',
      text: `Bu bir _____ mi?`,
      blankId: `blank${index + 1}`
    }));

    const wordBank = selectedItems.map(item => item.turkishWord);
    const correctAnswers = {};
    selectedItems.forEach((item, index) => {
      correctAnswers[`blank${index + 1}`] = [item.turkishWord];
    });

    return this.exerciseRepository.create({
      lessonId,
      title: 'Boşlukları Doldurun (Fill in the Blanks)',
      instructions: 'Complete the dialogue with appropriate words',
      content: {
        type: 'fill_in_blank',
        dialogue,
        wordBank
      },
      correctAnswers,
      hints: this.generateFillBlankHints(selectedItems),
      feedback: {
        correct: 'Harika! Excellent!',
        incorrect: 'Tekrar deneyin! Try again!',
        partial: 'Güzel! Nice! Keep going!'
      },
      points: 15,
      timeLimit: 180,
      difficultyLevel: 2,
      orderIndex: 2,
      isPublished: true
    });
  }

  private async generateImageAssociationExercise(lessonId: string, vocabularyItems: VocabularyItem[]): Promise<Exercise> {
    
    const selectedItems = vocabularyItems.slice(0, 6);
    const imageItems = selectedItems.map((item, index) => ({
      id: `img${index + 1}`,
      imageUrl: `/images/vocab/${item.turkishWord}.jpg`,
      options: [item.turkishWord, ...this.generateDistractors(item.turkishWord, vocabularyItems)],
      correctAnswer: 0
    }));

    return this.exerciseRepository.create({
      lessonId,
      title: 'Resim ve Kelime Eşleştirme (Image-Word Association)',
      instructions: 'Choose the correct Turkish word for each image',
      content: {
        type: 'image_multiple_choice',
        imageItems
      },
      correctAnswers: imageItems.reduce((acc, item) => {
        acc[item.id] = item.correctAnswer;
        return acc;
      }, {}),
      hints: this.generateImageHints(selectedItems),
      feedback: {
        correct: 'Çok iyi! Very good!',
        incorrect: 'Tekrar bakın! Look again!',
        partial: 'İyi gidiyorsunuz! You\'re doing well!'
      },
      points: 12,
      timeLimit: 150,
      difficultyLevel: 1,
      orderIndex: 3,
      isPublished: true
    });
  }

  private async generateConjugationExercise(lessonId: string, grammarRule: GrammarRule): Promise<Exercise> {
    
    const sentences = [
      {
        id: 'conj1',
        sentence: 'Ben öğrenci___.',
        options: ['-yim', '-sin', '-dir', '-iz'],
        correctAnswer: 0,
        translation: 'I am a student.'
      },
      {
        id: 'conj2',
        sentence: 'Siz öğretmen___.',
        options: ['-yim', '-siniz', '-dir', '-lar'],
        correctAnswer: 1,
        translation: 'You are a teacher.'
      }
    ];

    return this.exerciseRepository.create({
      lessonId,
      title: 'Dilbilgisi Çalışması (Grammar Practice)',
      instructions: 'Complete the sentences with the correct suffix',
      content: {
        type: 'suffix_completion',
        sentences
      },
      correctAnswers: sentences.reduce((acc, sentence) => {
        acc[sentence.id] = sentence.correctAnswer;
        return acc;
      }, {}),
      hints: this.generateGrammarHints(sentences),
      feedback: {
        correct: 'Harika! Excellent grammar!',
        incorrect: 'Tekrar deneyin! Try again!',
        partial: 'İyi! Good! Keep practicing!'
      },
      points: 20,
      timeLimit: 240,
      difficultyLevel: 2,
      orderIndex: 4,
      isPublished: true
    });
  }

  private async generateListeningComprehensionExercise(lessonId: string, audioContent: any[]): Promise<Exercise> {
    
    const questions = [
      {
        id: 'q1',
        question: 'What is the speaker talking about?',
        questionTr: 'Konuşmacı ne hakkında konuşuyor?',
        options: ['School', 'Family', 'Work', 'Food'],
        optionsTr: ['Okul', 'Aile', 'İş', 'Yemek'],
        correctAnswer: 0
      }
    ];

    return this.exerciseRepository.create({
      lessonId,
      title: 'Dinleme (Listening)',
      instructions: 'Listen to the audio and choose the correct answer',
      content: {
        type: 'audio_multiple_choice',
        audioUrl: '/audio/listening-exercise.mp3',
        questions
      },
      correctAnswers: questions.reduce((acc, question) => {
        acc[question.id] = question.correctAnswer;
        return acc;
      }, {}),
      hints: this.generateListeningHints(questions),
      feedback: {
        correct: 'Çok iyi dinleme! Excellent listening!',
        incorrect: 'Tekrar dinleyin! Listen again!',
        partial: 'İyi! Good! Keep listening!'
      },
      points: 15,
      timeLimit: 180,
      difficultyLevel: 2,
      orderIndex: 5,
      isPublished: true
    });
  }



  private generateHints(pairs: any[]): any {
    const hints = {};
    pairs.forEach(pair => {
      hints[pair.id] = `Listen to the pronunciation of ${pair.turkish}`;
    });
    return hints;
  }

  private generateFillBlankHints(items: VocabularyItem[]): any {
    const hints = {};
    items.forEach((item, index) => {
      hints[`blank${index + 1}`] = `Think about: ${item.englishTranslation}`;
    });
    return hints;
  }

  private generateImageHints(items: VocabularyItem[]): any {
    const hints = {};
    items.forEach((item, index) => {
      hints[`img${index + 1}`] = `This is used for: ${item.usageContext || item.englishTranslation}`;
    });
    return hints;
  }

  private generateGrammarHints(sentences: any[]): any {
    const hints = {};
    sentences.forEach(sentence => {
      hints[sentence.id] = 'Think about the subject pronoun';
    });
    return hints;
  }

  private generateListeningHints(questions: any[]): any {
    const hints = {};
    questions.forEach(question => {
      hints[question.id] = 'Listen for key words';
    });
    return hints;
  }

  private generateDistractors(correctWord: string, allItems: VocabularyItem[]): string[] {
    return allItems
      .filter(item => item.turkishWord !== correctWord)
      .slice(0, 3)
      .map(item => item.turkishWord);
  }

  // Additional methods for other exercise types would be implemented here
  private async generateSentenceCompletionExercise(lessonId: string, grammarRule: GrammarRule): Promise<Exercise> {
    // Implementation for sentence completion
    return null;
  }

  private async generateDictationExercise(lessonId: string, audioContent: any[]): Promise<Exercise> {
    // Implementation for dictation
    return null;
  }

  private async generatePronunciationExercise(lessonId: string, pronunciationItems: any[]): Promise<Exercise> {
    // Implementation for pronunciation
    return null;
  }

  private async generateConversationExercise(lessonId: string, pronunciationItems: any[]): Promise<Exercise> {
    // Implementation for conversation
    return null;
  }

  private async generateSentenceConstructionExercise(lessonId: string, writingPrompts: any[]): Promise<Exercise> {
    // Implementation for sentence construction
    return null;
  }

  private async generateGuidedWritingExercise(lessonId: string, writingPrompts: any[]): Promise<Exercise> {
    // Implementation for guided writing
    return null;
  }
}
