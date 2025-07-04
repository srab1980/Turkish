'use client';

import React from 'react';
import FlashcardSystem from '@/components/flashcards/FlashcardSystem';

export default function TestLessonPage() {
  const mockVocabularyItems = [
    { 
      id: '1', 
      turkish: 'Merhaba', 
      english: 'Hello', 
      pronunciation: 'mer-ha-ba', 
      audio: '/audio/merhaba.mp3' 
    },
    { 
      id: '2', 
      turkish: 'Teşekkürler', 
      english: 'Thank you', 
      pronunciation: 'te-shek-kür-ler', 
      audio: '/audio/tesekkurler.mp3' 
    }
  ];

  const handleComplete = (results: any) => {
    console.log('Flashcard session completed:', results);
  };

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Test Interactive Components</h1>
      <FlashcardSystem
        vocabularyItems={mockVocabularyItems}
        unitId="test-unit"
        onComplete={handleComplete}
      />
    </div>
  );
}
