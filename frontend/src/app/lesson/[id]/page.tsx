"use client"

import React, { useState, useEffect } from "react"
import { useParams } from "next/navigation"

// Add CSS for points animation
if (typeof document !== 'undefined') {
  const style = document.createElement('style');
  style.textContent = `
    @keyframes slideIn {
      from { transform: translateX(100%); opacity: 0; }
      to { transform: translateX(0); opacity: 1; }
    }
  `;
  document.head.appendChild(style);
}

// Sound effects system
const playSound = (type: 'success' | 'error' | 'hint' | 'complete' | 'click') => {
  if (typeof window === 'undefined') return;

  try {
    const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();

    const createTone = (frequency: number, duration: number, type: OscillatorType = 'sine') => {
      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();

      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);

      oscillator.frequency.setValueAtTime(frequency, audioContext.currentTime);
      oscillator.type = type;

      gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + duration);

      oscillator.start(audioContext.currentTime);
      oscillator.stop(audioContext.currentTime + duration);
    };

    switch (type) {
      case 'success':
        // Happy ascending chord
        createTone(523.25, 0.2); // C5
        setTimeout(() => createTone(659.25, 0.2), 100); // E5
        setTimeout(() => createTone(783.99, 0.3), 200); // G5
        break;

      case 'error':
        // Descending error sound
        createTone(400, 0.15);
        setTimeout(() => createTone(300, 0.15), 100);
        setTimeout(() => createTone(200, 0.2), 200);
        break;

      case 'hint':
        // Gentle notification
        createTone(800, 0.1);
        setTimeout(() => createTone(600, 0.1), 150);
        break;

      case 'complete':
        // Victory fanfare
        createTone(523.25, 0.15); // C5
        setTimeout(() => createTone(659.25, 0.15), 100); // E5
        setTimeout(() => createTone(783.99, 0.15), 200); // G5
        setTimeout(() => createTone(1046.5, 0.4), 300); // C6
        break;

      case 'click':
        // Subtle click
        createTone(1000, 0.05);
        break;
    }
  } catch (error) {
    console.log('Audio not supported or blocked');
  }
};
import { useParams } from "next/navigation"
import { MainLayout } from "@/components/layout/main-layout"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ArrowLeft, BookOpen, Clock, Target, Play, CheckCircle, Loader2, Volume2, RotateCcw, Eye, EyeOff } from "lucide-react"
import { curriculumService, type Lesson, type Exercise } from "@/lib/curriculum-service"

interface LessonData {
  lesson: Lesson;
  exercises: Exercise[];
  unit: any;
  course: any;
}

// Simple Interactive Elements for Vocabulary Lessons
function MultipleVocabularyElements({ lesson }: { lesson: Lesson }) {
  const [points, setPoints] = useState(0);

  return (
    <div className="space-y-6">
      <Card className="bg-gradient-to-r from-purple-500 to-blue-500 text-white">
        <CardContent className="pt-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-4">
              <div className="text-center">
                <div className="text-2xl font-bold">{points}</div>
                <div className="text-sm opacity-90">Points</div>
              </div>
            </div>
            <div className="text-right">
              <div className="text-lg font-semibold">{lesson.title}</div>
              <div className="text-sm opacity-90">Interactive Lesson</div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <BookOpen className="h-5 w-5" />
            <span>Lesson Content</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center space-y-4">
            <div className="text-lg">
              Welcome to {lesson.title}!
            </div>
            <div className="text-muted-foreground">
              {lesson.description}
            </div>
            <Button onClick={() => setPoints(points + 10)}>
              Practice (+10 points)
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

// Main LessonPage component
export default function LessonPage() {
  const params = useParams();
  const lessonId = params.id as string;

  const [lessonData, setLessonData] = useState<LessonData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadLessonData();
  }, [lessonId]);

  const loadLessonData = async () => {
    try {
      setLoading(true);
      setError(null);

      const curriculumData = await curriculumService.getCurriculumData();

      // Find the specific lesson
      const lesson = curriculumData.lessons.find(l => l.id === lessonId);
      if (!lesson) {
        throw new Error(`Lesson not found with ID: ${lessonId}`);
      }

      // Find the unit for this lesson
      const unit = curriculumData.units.find(u => u.id === lesson.unitId);

      // Find the course for this unit
      const course = unit ? curriculumData.courses.find(c => c.id === unit.courseId) : null;

      // Get exercises for this lesson
      const exercises = curriculumService.getExercisesByLesson(curriculumData.exercises, lessonId);

      setLessonData({
        lesson,
        exercises,
        unit,
        course
      });

    } catch (err) {
      console.error('Error loading lesson data:', err);
      setError('Failed to load lesson content. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <MainLayout>
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center space-y-4">
            <Loader2 className="h-8 w-8 animate-spin mx-auto" />
            <p className="text-muted-foreground">Loading lesson content...</p>
          </div>
        </div>
      </MainLayout>
    );
  }

  if (error || !lessonData) {
    return (
      <MainLayout>
        <div className="flex items-center justify-center min-h-[400px]">
          <Card className="w-full max-w-md">
            <CardContent className="pt-6">
              <div className="text-center space-y-4">
                <div className="text-red-500">
                  <BookOpen className="h-12 w-12 mx-auto mb-4" />
                </div>
                <h3 className="text-lg font-semibold">Error Loading Lesson</h3>
                <p className="text-muted-foreground">{error}</p>
                <Button onClick={loadLessonData}>
                  Try Again
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </MainLayout>
    );
  }

  const { lesson } = lessonData;

  return (
    <MainLayout>
      <div className="container mx-auto px-4 py-8">
        <MultipleVocabularyElements lesson={lesson} />
      </div>
    </MainLayout>
  );
}
        { turkish: 'Abi', english: 'Older brother', pronunciation: 'a-BI' },
        { turkish: 'Kız kardeş', english: 'Sister', pronunciation: 'kız kar-DEŞŞ' },
        { turkish: 'Erkek kardeş', english: 'Brother', pronunciation: 'er-kek kar-DEŞŞ' },
        { turkish: 'Çocuk', english: 'Child', pronunciation: 'ço-CUK' },
        { turkish: 'Oğul', english: 'Son', pronunciation: 'o-ĞUL' },
        { turkish: 'Kız', english: 'Daughter', pronunciation: 'KIZ' },
        { turkish: 'Dede', english: 'Grandfather', pronunciation: 'de-DE' },
        { turkish: 'Nine', english: 'Grandmother', pronunciation: 'ni-NE' },
        { turkish: 'Amca', english: 'Uncle (father\'s side)', pronunciation: 'am-CA' },
        { turkish: 'Teyze', english: 'Aunt (mother\'s side)', pronunciation: 'tey-ZE' },
        { turkish: 'Aile', english: 'Family', pronunciation: 'a-i-LE' }
      ];
    } else if (lesson.title.includes('Food')) {
      return [
        { turkish: 'Ekmek', english: 'Bread', pronunciation: 'ek-MEK' },
        { turkish: 'Su', english: 'Water', pronunciation: 'SU' },
        { turkish: 'Çay', english: 'Tea', pronunciation: 'ÇAY' },
        { turkish: 'Kahve', english: 'Coffee', pronunciation: 'kah-VE' },
        { turkish: 'Süt', english: 'Milk', pronunciation: 'SÜT' },
        { turkish: 'Et', english: 'Meat', pronunciation: 'ET' },
        { turkish: 'Tavuk', english: 'Chicken', pronunciation: 'ta-VUK' },
        { turkish: 'Balık', english: 'Fish', pronunciation: 'ba-LIK' },
        { turkish: 'Sebze', english: 'Vegetable', pronunciation: 'seb-ZE' },
        { turkish: 'Meyve', english: 'Fruit', pronunciation: 'mey-VE' },
        { turkish: 'Elma', english: 'Apple', pronunciation: 'el-MA' },
        { turkish: 'Portakal', english: 'Orange', pronunciation: 'por-ta-KAL' },
        { turkish: 'Domates', english: 'Tomato', pronunciation: 'do-ma-TES' },
        { turkish: 'Soğan', english: 'Onion', pronunciation: 'so-ĞAN' },
        { turkish: 'Pilav', english: 'Rice', pronunciation: 'pi-LAV' }
      ];
    } else if (lesson.title.includes('Numbers')) {
      return [
        { turkish: 'Bir', english: 'One', pronunciation: 'BIR' },
        { turkish: 'İki', english: 'Two', pronunciation: 'i-KI' },
        { turkish: 'Üç', english: 'Three', pronunciation: 'ÜÇ' },
        { turkish: 'Dört', english: 'Four', pronunciation: 'DÖRT' },
        { turkish: 'Beş', english: 'Five', pronunciation: 'BEŞ' },
        { turkish: 'Altı', english: 'Six', pronunciation: 'al-TI' },
        { turkish: 'Yedi', english: 'Seven', pronunciation: 'ye-DI' },
        { turkish: 'Sekiz', english: 'Eight', pronunciation: 'se-KIZ' },
        { turkish: 'Dokuz', english: 'Nine', pronunciation: 'do-KUZ' },
        { turkish: 'On', english: 'Ten', pronunciation: 'ON' },
        { turkish: 'Yirmi', english: 'Twenty', pronunciation: 'yir-MI' },
        { turkish: 'Otuz', english: 'Thirty', pronunciation: 'o-TUZ' },
        { turkish: 'Kırk', english: 'Forty', pronunciation: 'KIRK' },
        { turkish: 'Elli', english: 'Fifty', pronunciation: 'el-LI' },
        { turkish: 'Yüz', english: 'Hundred', pronunciation: 'YÜZ' }
      ];
    } else if (lesson.title.includes('Colors')) {
      return [
        { turkish: 'Kırmızı', english: 'Red', pronunciation: 'kır-mı-ZI' },
        { turkish: 'Mavi', english: 'Blue', pronunciation: 'ma-VI' },
        { turkish: 'Yeşil', english: 'Green', pronunciation: 'ye-ŞIL' },
        { turkish: 'Sarı', english: 'Yellow', pronunciation: 'sa-RI' },
        { turkish: 'Siyah', english: 'Black', pronunciation: 'si-YAH' },
        { turkish: 'Beyaz', english: 'White', pronunciation: 'be-YAZ' },
        { turkish: 'Turuncu', english: 'Orange', pronunciation: 'tu-run-CU' },
        { turkish: 'Mor', english: 'Purple', pronunciation: 'MOR' },
        { turkish: 'Pembe', english: 'Pink', pronunciation: 'pem-BE' },
        { turkish: 'Gri', english: 'Gray', pronunciation: 'GRI' },
        { turkish: 'Kahverengi', english: 'Brown', pronunciation: 'kah-ve-ren-GI' },
        { turkish: 'Lacivert', english: 'Navy blue', pronunciation: 'la-ci-VERT' },
        { turkish: 'Açık', english: 'Light (color)', pronunciation: 'a-ÇIK' },
        { turkish: 'Koyu', english: 'Dark (color)', pronunciation: 'ko-YU' },
        { turkish: 'Renk', english: 'Color', pronunciation: 'RENK' }
      ];
    } else if (lesson.title.includes('Body')) {
      return [
        { turkish: 'Baş', english: 'Head', pronunciation: 'BAŞ' },
        { turkish: 'Saç', english: 'Hair', pronunciation: 'SAÇ' },
        { turkish: 'Göz', english: 'Eye', pronunciation: 'GÖZ' },
        { turkish: 'Kulak', english: 'Ear', pronunciation: 'ku-LAK' },
        { turkish: 'Burun', english: 'Nose', pronunciation: 'bu-RUN' },
        { turkish: 'Ağız', english: 'Mouth', pronunciation: 'a-ĞIZ' },
        { turkish: 'Diş', english: 'Tooth', pronunciation: 'DIŞ' },
        { turkish: 'Boyun', english: 'Neck', pronunciation: 'bo-YUN' },
        { turkish: 'Kol', english: 'Arm', pronunciation: 'KOL' },
        { turkish: 'El', english: 'Hand', pronunciation: 'EL' },
        { turkish: 'Parmak', english: 'Finger', pronunciation: 'par-MAK' },
        { turkish: 'Bacak', english: 'Leg', pronunciation: 'ba-CAK' },
        { turkish: 'Ayak', english: 'Foot', pronunciation: 'a-YAK' },
        { turkish: 'Kalp', english: 'Heart', pronunciation: 'KALP' },
        { turkish: 'Vücut', english: 'Body', pronunciation: 'vü-CUT' }
      ];
    } else if (lesson.title.includes('Weather')) {
      return [
        { turkish: 'Hava', english: 'Weather', pronunciation: 'ha-VA' },
        { turkish: 'Güneş', english: 'Sun', pronunciation: 'gü-NEŞ' },
        { turkish: 'Yağmur', english: 'Rain', pronunciation: 'yağ-MUR' },
        { turkish: 'Kar', english: 'Snow', pronunciation: 'KAR' },
        { turkish: 'Rüzgar', english: 'Wind', pronunciation: 'rüz-GAR' },
        { turkish: 'Bulut', english: 'Cloud', pronunciation: 'bu-LUT' },
        { turkish: 'Sıcak', english: 'Hot', pronunciation: 'sı-CAK' },
        { turkish: 'Soğuk', english: 'Cold', pronunciation: 'so-ĞUK' },
        { turkish: 'Ilık', english: 'Warm', pronunciation: 'ı-LIK' },
        { turkish: 'Serin', english: 'Cool', pronunciation: 'se-RIN' },
        { turkish: 'Güneşli', english: 'Sunny', pronunciation: 'gü-neş-LI' },
        { turkish: 'Yağmurlu', english: 'Rainy', pronunciation: 'yağ-mur-LU' },
        { turkish: 'Karlı', english: 'Snowy', pronunciation: 'kar-LI' },
        { turkish: 'Bulutlu', english: 'Cloudy', pronunciation: 'bu-lut-LU' },
        { turkish: 'Mevsim', english: 'Season', pronunciation: 'mev-SIM' }
      ];
    } else if (lesson.title.includes('Shopping')) {
      return [
        { turkish: 'Alışveriş', english: 'Shopping', pronunciation: 'a-lış-ve-RIŞ' },
        { turkish: 'Mağaza', english: 'Store', pronunciation: 'ma-ğa-ZA' },
        { turkish: 'Para', english: 'Money', pronunciation: 'pa-RA' },
        { turkish: 'Fiyat', english: 'Price', pronunciation: 'fi-YAT' },
        { turkish: 'Ucuz', english: 'Cheap', pronunciation: 'u-CUZ' },
        { turkish: 'Pahalı', english: 'Expensive', pronunciation: 'pa-ha-LI' },
        { turkish: 'Satmak', english: 'To sell', pronunciation: 'sat-MAK' },
        { turkish: 'Almak', english: 'To buy', pronunciation: 'al-MAK' },
        { turkish: 'Ödeme', english: 'Payment', pronunciation: 'ö-de-ME' },
        { turkish: 'Nakit', english: 'Cash', pronunciation: 'na-KIT' },
        { turkish: 'Kredi kartı', english: 'Credit card', pronunciation: 'kre-di kar-TI' },
        { turkish: 'Fiş', english: 'Receipt', pronunciation: 'FIŞ' },
        { turkish: 'İndirim', english: 'Discount', pronunciation: 'in-di-RIM' },
        { turkish: 'Kasiyer', english: 'Cashier', pronunciation: 'ka-si-YER' },
        { turkish: 'Müşteri', english: 'Customer', pronunciation: 'müş-te-RI' }
      ];
    }
    return [
      { turkish: 'Kelime', english: 'Word', pronunciation: 'ke-li-ME' },
      { turkish: 'Öğrenmek', english: 'To learn', pronunciation: 'öğ-ren-MEK' },
      { turkish: 'Anlamak', english: 'To understand', pronunciation: 'an-la-MAK' },
      { turkish: 'Konuşmak', english: 'To speak', pronunciation: 'ko-nuş-MAK' },
      { turkish: 'Dinlemek', english: 'To listen', pronunciation: 'din-le-MEK' },
      { turkish: 'Okumak', english: 'To read', pronunciation: 'o-ku-MAK' },
      { turkish: 'Yazmak', english: 'To write', pronunciation: 'yaz-MAK' },
      { turkish: 'Çalışmak', english: 'To study/work', pronunciation: 'ça-lış-MAK' },
      { turkish: 'Pratik', english: 'Practice', pronunciation: 'pra-TIK' },
      { turkish: 'Ders', english: 'Lesson', pronunciation: 'DERS' },
      { turkish: 'Öğretmen', english: 'Teacher', pronunciation: 'öğ-ret-MEN' },
      { turkish: 'Öğrenci', english: 'Student', pronunciation: 'öğ-ren-CI' },
      { turkish: 'Kitap', english: 'Book', pronunciation: 'ki-TAP' },
      { turkish: 'Dil', english: 'Language', pronunciation: 'DIL' },
      { turkish: 'Türkçe', english: 'Turkish', pronunciation: 'türk-ÇE' }
    ];
  };

  const vocabularyData = getVocabularyData();
  const currentCard = vocabularyData[currentCardIndex];

  // Initialize randomized English words for matching
  React.useEffect(() => {
    if (randomizedEnglishWords.length === 0) {
      const englishWords = vocabularyData.map(item => item.english);
      setRandomizedEnglishWords([...englishWords].sort(() => Math.random() - 0.5));
    }
  }, [vocabularyData, randomizedEnglishWords.length]);

  // Gamification functions
  const addPoints = (amount: number, reason: string) => {
    setPoints(prev => prev + amount);
    setExperiencePoints(prev => prev + amount);

    // Check for achievements
    const newAchievements = [];
    if (points + amount >= 100 && !achievements.includes('First 100 Points')) {
      newAchievements.push('First 100 Points');
    }
    if (Object.keys(matchingAnswers).length === vocabularyData.length && !achievements.includes('Perfect Match')) {
      newAchievements.push('Perfect Match');
    }
    if (newAchievements.length > 0) {
      setAchievements(prev => [...prev, ...newAchievements]);
      alert(`🏆 Achievement Unlocked: ${newAchievements.join(', ')}!`);
    }

    // Show points notification
    if (amount > 0) {
      setTimeout(() => {
        const notification = document.createElement('div');
        notification.innerHTML = `+${amount} points - ${reason}`;
        notification.style.cssText = `
          position: fixed; top: 20px; right: 20px; z-index: 1000;
          background: #10b981; color: white; padding: 8px 16px;
          border-radius: 8px; font-weight: bold; animation: slideIn 0.3s ease;
        `;
        document.body.appendChild(notification);
        setTimeout(() => notification.remove(), 2000);
      }, 100);
    }
  };

  const nextCard = () => {
    const nextIndex = (currentCardIndex + 1) % vocabularyData.length;
    setCurrentCardIndex(nextIndex);
    setShowTranslation(false);

    // Only give points if this card hasn't been viewed before
    if (!viewedCards.has(nextIndex)) {
      setViewedCards(prev => new Set([...prev, nextIndex]));
      addPoints(5, 'New word discovered');
    }
  };

  const prevCard = () => {
    const prevIndex = (currentCardIndex - 1 + vocabularyData.length) % vocabularyData.length;
    setCurrentCardIndex(prevIndex);
    setShowTranslation(false);

    // Only give points if this card hasn't been viewed before
    if (!viewedCards.has(prevIndex)) {
      setViewedCards(prev => new Set([...prev, prevIndex]));
      addPoints(5, 'New word discovered');
    }
  };

  const playPronunciation = () => {
    playSound('click');
    alert(`Pronunciation: ${currentCard.pronunciation}`);
    addPoints(1, 'Pronunciation practice');
  };

  const handleTurkishWordClick = (turkish: string) => {
    playSound('click');
    setSelectedTurkishWord(turkish);
  };

  const handleMatchingAnswer = (english: string) => {
    if (!selectedTurkishWord) return;

    const isCorrect = vocabularyData.find(item => item.turkish === selectedTurkishWord)?.english === english;
    setMatchingAnswers(prev => ({ ...prev, [selectedTurkishWord]: english }));

    if (isCorrect) {
      playSound('success');
      addPoints(15, 'Perfect match');
      setSelectedTurkishWord(null);

      // Check if current round is complete
      const currentRoundWords = getCurrentRoundWords();
      const roundMatches = currentRoundWords.filter(word =>
        matchingAnswers[word.turkish] === word.english ||
        (selectedTurkishWord === word.turkish && english === word.english)
      );

      if (roundMatches.length === 5) {
        setCompletedRounds(prev => new Set([...prev, matchingRound]));
        addPoints(25, 'Round completed');
        playSound('complete');
        if (matchingRound < 2) {
          setTimeout(() => setMatchingRound(prev => prev + 1), 1000);
        }
      }
    } else {
      playSound('error');
      addPoints(-3, 'Incorrect match');
      setSelectedTurkishWord(null);
    }
  };

  const getCurrentRoundWords = () => {
    const startIndex = matchingRound * 5;
    const endIndex = Math.min(startIndex + 5, vocabularyData.length);
    return vocabularyData.slice(startIndex, endIndex);
  };

  const getCurrentRoundEnglishWords = () => {
    const currentWords = getCurrentRoundWords();
    return currentWords.map(word => word.english).sort(() => Math.random() - 0.5);
  };

  const handleQuizAnswer = (answer: string) => {
    const newAnswers = [...quizAnswers];
    newAnswers[quizCurrentQuestion] = answer;
    setQuizAnswers(newAnswers);

    // Only award points on first quiz attempt
    if (!quizAttempted) {
      const isCorrect = answer === vocabularyData[quizCurrentQuestion].english;
      if (isCorrect) {
        playSound('success');
        addPoints(15, 'Correct quiz answer');
      } else {
        playSound('error');
        addPoints(-3, 'Incorrect quiz answer');
      }
    } else {
      // Still play sounds on retakes for feedback
      const isCorrect = answer === vocabularyData[quizCurrentQuestion].english;
      if (isCorrect) {
        playSound('success');
      } else {
        playSound('error');
      }
    }

    if (quizCurrentQuestion < vocabularyData.length - 1) {
      setQuizCurrentQuestion(prev => prev + 1);
    } else {
      setShowQuizResults(true);
      // Mark quiz as attempted and give completion bonus only on first attempt
      if (!quizAttempted) {
        setQuizAttempted(true);
        addPoints(50, 'Quiz completed');
        playSound('complete');
      } else {
        playSound('complete');
      }
    }
  };

  const getQuizScore = () => {
    let correct = 0;
    quizAnswers.forEach((answer, index) => {
      if (answer === vocabularyData[index].english) {
        correct++;
      }
    });
    return Math.round((correct / vocabularyData.length) * 100);
  };

  const getQuizChoices = (correctAnswer: string) => {
    // Get all possible answers
    const allAnswers = vocabularyData.map(item => item.english);
    // Remove the correct answer from the pool
    const wrongAnswers = allAnswers.filter(answer => answer !== correctAnswer);
    // Randomly select 4 wrong answers
    const selectedWrongAnswers = wrongAnswers.sort(() => Math.random() - 0.5).slice(0, 4);
    // Combine with correct answer and shuffle
    const choices = [correctAnswer, ...selectedWrongAnswers].sort(() => Math.random() - 0.5);
    return choices;
  };

  return (
    <>
      <div className="space-y-6">
      {/* Gamification Header */}
      <Card className="bg-gradient-to-r from-purple-500 to-blue-500 text-white">
        <CardContent className="pt-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-4">
              <div className="text-center">
                <div className="text-2xl font-bold">{points}</div>
                <div className="text-sm opacity-90">Points</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold">{experiencePoints}</div>
                <div className="text-sm opacity-90">XP</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold">{achievements.length}</div>
                <div className="text-sm opacity-90">Achievements</div>
              </div>
            </div>
            <div className="text-right">
              <div className="text-sm opacity-90">Level</div>
              <div className="text-xl font-bold">{Math.floor(experiencePoints / 100) + 1}</div>
            </div>
          </div>
          <div className="mt-3">
            <div className="text-xs opacity-75 mb-1">Progress to next level</div>
            <div className="w-full bg-white bg-opacity-20 rounded-full h-2">
              <div
                className="bg-white h-2 rounded-full transition-all duration-300"
                style={{ width: `${(experiencePoints % 100)}%` }}
              ></div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Core Element: Interactive Flashcards */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <BookOpen className="h-5 w-5" />
            <span>Interactive Flashcards</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="max-w-md mx-auto">
            <div className={`bg-gradient-to-br border-2 rounded-xl p-8 text-center min-h-[200px] flex flex-col justify-center ${
              viewedCards.has(currentCardIndex)
                ? 'from-gray-50 to-gray-100 border-gray-300'
                : 'from-blue-50 to-purple-50 border-blue-200'
            }`}>
              <div className="space-y-4">
                {!viewedCards.has(currentCardIndex) && (
                  <div className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded-full inline-block">
                    ✨ New Word - 5 Points!
                  </div>
                )}

                <div className="text-3xl font-bold text-blue-900">
                  {currentCard.turkish}
                </div>

                {showTranslation && (
                  <div className="text-xl text-gray-600 border-t pt-4">
                    {currentCard.english}
                  </div>
                )}

                <div className="flex justify-center space-x-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={playPronunciation}
                    className="flex items-center space-x-1"
                  >
                    <Volume2 className="h-4 w-4" />
                    <span>Listen</span>
                  </Button>

                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setShowTranslation(!showTranslation)}
                    className="flex items-center space-x-1"
                  >
                    {showTranslation ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    <span>{showTranslation ? 'Hide' : 'Show'}</span>
                  </Button>
                </div>
              </div>
            </div>

            <div className="flex justify-between items-center mt-4">
              <Button variant="outline" onClick={prevCard}>← Previous</Button>
              <span className="text-sm text-muted-foreground">
                {currentCardIndex + 1} of {vocabularyData.length}
              </span>
              <Button variant="outline" onClick={nextCard}>Next →</Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Reinforcement: Matching Exercise */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Target className="h-5 w-5" />
            <span>Practice: Word Matching</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="mb-4 text-center">
            <div className="text-lg font-semibold">Round {matchingRound + 1} of 3</div>
            <div className="text-sm text-muted-foreground">Match 5 words to proceed to next round</div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h4 className="font-semibold mb-3">Turkish Words</h4>
              <div className="space-y-2">
                {getCurrentRoundWords().map((item) => {
                  const isMatched = matchingAnswers[item.turkish] === item.english;
                  const isSelected = selectedTurkishWord === item.turkish;
                  return (
                    <div
                      key={item.turkish}
                      className={`p-3 border rounded-lg cursor-pointer transition-colors ${
                        isMatched
                          ? 'bg-green-100 border-green-500 text-green-800'
                          : isSelected
                          ? 'bg-blue-100 border-blue-500 text-blue-800'
                          : 'hover:bg-gray-50 border-gray-300'
                      }`}
                      onClick={() => !isMatched && handleTurkishWordClick(item.turkish)}
                    >
                      {item.turkish}
                      {isMatched && <span className="ml-2">✓</span>}
                    </div>
                  );
                })}
              </div>
            </div>
            <div>
              <h4 className="font-semibold mb-3">English Meanings</h4>
              <div className="space-y-2">
                {getCurrentRoundEnglishWords().map((englishWord) => {
                  const isUsed = Object.values(matchingAnswers).includes(englishWord);
                  return (
                    <Button
                      key={englishWord}
                      variant="outline"
                      className={`w-full justify-start ${
                        isUsed
                          ? 'bg-green-100 border-green-500 text-green-800 cursor-not-allowed'
                          : selectedTurkishWord
                          ? 'hover:bg-blue-50 border-blue-300'
                          : 'opacity-50 cursor-not-allowed'
                      }`}
                      disabled={isUsed || !selectedTurkishWord}
                      onClick={() => handleMatchingAnswer(englishWord)}
                    >
                      {englishWord}
                      {isUsed && <span className="ml-2">✓</span>}
                    </Button>
                  );
                })}
              </div>
            </div>
          </div>

          <div className="mt-4 text-center">
            <div className="text-sm text-muted-foreground mb-2">
              {selectedTurkishWord ? `Selected: ${selectedTurkishWord} - Choose English meaning` : 'Click a Turkish word to select it'}
            </div>
            <div className="flex justify-center space-x-4 text-sm">
              <span className="font-medium">Round Progress: {getCurrentRoundWords().filter(w => matchingAnswers[w.turkish] === w.english).length}/5</span>
              <span className="font-medium">Total: {Object.keys(matchingAnswers).filter(k => matchingAnswers[k] === vocabularyData.find(v => v.turkish === k)?.english).length}/{vocabularyData.length}</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Assessment: Quick Quiz */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <CheckCircle className="h-5 w-5" />
              <span>Test: Vocabulary Quiz</span>
            </div>
            {quizAttempted && (
              <div className="text-sm bg-orange-100 text-orange-800 px-2 py-1 rounded-full">
                Retake - No Points
              </div>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {!showQuizResults ? (
            <div className="text-center space-y-4">
              <div className="text-lg font-semibold">
                Question {quizCurrentQuestion + 1} of {vocabularyData.length}
              </div>
              <div className="text-2xl font-bold text-blue-900 mb-4">
                {vocabularyData[quizCurrentQuestion]?.turkish}
              </div>
              <div className="text-muted-foreground mb-6">
                What does this Turkish word mean?
              </div>
              <div className="grid grid-cols-1 gap-3 max-w-md mx-auto">
                {getQuizChoices(vocabularyData[quizCurrentQuestion]?.english).map((choice, index) => (
                  <Button
                    key={`${choice}-${index}`}
                    variant="outline"
                    onClick={() => handleQuizAnswer(choice)}
                    className="text-left hover:bg-blue-50"
                  >
                    {String.fromCharCode(65 + index)}. {choice}
                  </Button>
                ))}
              </div>
              <div className="text-xs text-muted-foreground mt-4">
                Choose the correct English meaning from 5 options
                {quizAttempted && (
                  <div className="text-orange-600 font-medium mt-1">
                    ⚠️ Retake Mode - No points will be awarded
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="text-center space-y-4">
              <div className="text-2xl font-bold text-green-600">
                Quiz Complete! 🎉
              </div>
              <div className="text-lg">
                Your Score: {getQuizScore()}%
              </div>
              <div className="text-sm text-muted-foreground">
                Correct Answers: {quizAnswers.filter((answer, index) => answer === vocabularyData[index].english).length} / {vocabularyData.length}
              </div>
              {quizAttempted && (
                <div className="text-sm bg-orange-100 text-orange-800 p-2 rounded-lg">
                  ℹ️ This was a retake - no points were awarded
                </div>
              )}
              <Button
                onClick={() => {
                  setQuizCurrentQuestion(0);
                  setQuizAnswers([]);
                  setShowQuizResults(false);
                }}
                variant={quizAttempted ? "outline" : "default"}
              >
                {quizAttempted ? "Practice Again (No Points)" : "Retake Quiz"}
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
      </div>
    </>
  );
}

// Main LessonPage component
export default function LessonPage() {
  const params = useParams();
  const lessonId = params.id as string;

  const [lessonData, setLessonData] = useState<LessonData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadLessonData();
  }, [lessonId]);

  const loadLessonData = async () => {
    try {
      setLoading(true);
      setError(null);

      const curriculumData = await curriculumService.getCurriculumData();

      // Find the specific lesson
      const lesson = curriculumData.lessons.find(l => l.id === lessonId);
      if (!lesson) {
        throw new Error(`Lesson not found with ID: ${lessonId}`);
      }

      // Find the unit for this lesson
      const unit = curriculumData.units.find(u => u.id === lesson.unitId);

      // Find the course for this unit
      const course = unit ? curriculumData.courses.find(c => c.id === unit.courseId) : null;

      // Get exercises for this lesson
      const exercises = curriculumService.getExercisesByLesson(curriculumData.exercises, lessonId);

      setLessonData({
        lesson,
        exercises,
        unit,
        course
      });

    } catch (err) {
      console.error('Error loading lesson data:', err);
      setError('Failed to load lesson content. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <MainLayout>
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center space-y-4">
            <Loader2 className="h-8 w-8 animate-spin mx-auto" />
            <p className="text-muted-foreground">Loading lesson content...</p>
          </div>
        </div>
      </MainLayout>
    );
  }

  if (error || !lessonData) {
    return (
      <MainLayout>
        <div className="flex items-center justify-center min-h-[400px]">
          <Card className="w-full max-w-md">
            <CardContent className="pt-6">
              <div className="text-center space-y-4">
                <div className="text-red-500">
                  <BookOpen className="h-12 w-12 mx-auto mb-4" />
                </div>
                <h3 className="text-lg font-semibold">Error Loading Lesson</h3>
                <p className="text-muted-foreground">{error}</p>
                <Button onClick={loadLessonData}>
                  Try Again
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </MainLayout>
    );
  }

  const { lesson } = lessonData;

  return (
    <MainLayout>
      <div className="container mx-auto px-4 py-8">
        <MultipleVocabularyElements lesson={lesson} />
      </div>
    </MainLayout>
  );
}