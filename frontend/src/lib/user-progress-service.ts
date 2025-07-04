// User Progress Service for Turkish Learning App
// Manages user progress, achievements, and statistics

export interface UserProgress {
  userId: string;
  currentStreak: number;
  longestStreak: number;
  dailyXP: number;
  dailyGoal: number;
  totalXP: number;
  level: string;
  levelProgress: number;
  completedLessons: string[];
  totalLessons: number;
  achievements: Achievement[];
  lastActiveDate: Date;
  studyTimeToday: number; // in minutes
  totalStudyTime: number; // in minutes
  vocabularyMastered: number;
  grammarTopicsCompleted: number;
  readingPassagesCompleted: number;
  speakingExercisesCompleted: number;
}

export interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: string;
  unlockedAt: Date;
  category: 'streak' | 'lessons' | 'vocabulary' | 'grammar' | 'speaking' | 'reading';
}

export interface DailyStats {
  date: Date;
  xpEarned: number;
  lessonsCompleted: number;
  timeSpent: number;
  exercisesCompleted: number;
}

class UserProgressService {
  private readonly STORAGE_KEY = 'turkish_app_user_progress';
  private readonly DAILY_STATS_KEY = 'turkish_app_daily_stats';

  // Initialize default user progress
  private getDefaultProgress(): UserProgress {
    return {
      userId: 'default_user',
      currentStreak: 0,
      longestStreak: 0,
      dailyXP: 0,
      dailyGoal: 200,
      totalXP: 0,
      level: 'A1 Beginner',
      levelProgress: 0,
      completedLessons: [],
      totalLessons: 0,
      achievements: [],
      lastActiveDate: new Date(),
      studyTimeToday: 0,
      totalStudyTime: 0,
      vocabularyMastered: 0,
      grammarTopicsCompleted: 0,
      readingPassagesCompleted: 0,
      speakingExercisesCompleted: 0,
    };
  }

  // Load user progress from localStorage
  getUserProgress(): UserProgress {
    try {
      const stored = localStorage.getItem(this.STORAGE_KEY);
      if (stored) {
        const progress = JSON.parse(stored);
        // Convert date strings back to Date objects
        progress.lastActiveDate = new Date(progress.lastActiveDate);
        progress.achievements = progress.achievements.map((achievement: any) => ({
          ...achievement,
          unlockedAt: new Date(achievement.unlockedAt)
        }));
        
        // Check if it's a new day and reset daily stats
        const today = new Date().toDateString();
        const lastActive = progress.lastActiveDate.toDateString();
        
        if (today !== lastActive) {
          progress.dailyXP = 0;
          progress.studyTimeToday = 0;
          progress.lastActiveDate = new Date();
          
          // Update streak
          const daysDiff = Math.floor((new Date().getTime() - new Date(lastActive).getTime()) / (1000 * 60 * 60 * 24));
          if (daysDiff === 1) {
            // Consecutive day - maintain streak
          } else if (daysDiff > 1) {
            // Missed days - reset streak
            progress.currentStreak = 0;
          }
        }
        
        return progress;
      }
    } catch (error) {
      console.error('Error loading user progress:', error);
    }
    
    return this.getDefaultProgress();
  }

  // Save user progress to localStorage
  saveUserProgress(progress: UserProgress): void {
    try {
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(progress));
    } catch (error) {
      console.error('Error saving user progress:', error);
    }
  }

  // Update XP and check for level progression
  addXP(amount: number): UserProgress {
    const progress = this.getUserProgress();
    progress.totalXP += amount;
    progress.dailyXP += amount;
    
    // Check for daily goal achievement
    if (progress.dailyXP >= progress.dailyGoal) {
      progress.currentStreak += 1;
      if (progress.currentStreak > progress.longestStreak) {
        progress.longestStreak = progress.currentStreak;
      }
      
      // Award streak achievements
      this.checkStreakAchievements(progress);
    }
    
    // Check for level progression
    this.updateLevel(progress);
    
    this.saveUserProgress(progress);
    return progress;
  }

  // Complete a lesson
  completeLesson(lessonId: string, xpEarned: number, timeSpent: number): UserProgress {
    const progress = this.getUserProgress();
    
    if (!progress.completedLessons.includes(lessonId)) {
      progress.completedLessons.push(lessonId);
      progress.totalStudyTime += timeSpent;
      progress.studyTimeToday += timeSpent;
      
      // Add XP
      this.addXP(xpEarned);
      
      // Check for lesson-based achievements
      this.checkLessonAchievements(progress);
    }
    
    this.saveUserProgress(progress);
    return progress;
  }

  // Update level based on total XP
  private updateLevel(progress: UserProgress): void {
    const xpThresholds = {
      'A1 Beginner': 0,
      'A1 Intermediate': 1000,
      'A1 Advanced': 2000,
      'A2 Beginner': 3500,
      'A2 Intermediate': 5000,
      'A2 Advanced': 7000,
      'B1 Beginner': 9500,
    };
    
    let newLevel = 'A1 Beginner';
    let nextThreshold = 1000;
    
    for (const [level, threshold] of Object.entries(xpThresholds)) {
      if (progress.totalXP >= threshold) {
        newLevel = level;
        // Find next threshold
        const levels = Object.keys(xpThresholds);
        const currentIndex = levels.indexOf(level);
        if (currentIndex < levels.length - 1) {
          const nextLevel = levels[currentIndex + 1];
          nextThreshold = xpThresholds[nextLevel as keyof typeof xpThresholds];
        }
      }
    }
    
    if (progress.level !== newLevel) {
      progress.level = newLevel;
      // Award level achievement
      this.unlockAchievement(progress, {
        id: `level_${newLevel.replace(/\s+/g, '_').toLowerCase()}`,
        title: `${newLevel} Achieved!`,
        description: `You've reached ${newLevel} level`,
        icon: '🎓',
        category: 'lessons'
      });
    }
    
    // Calculate level progress
    const currentThreshold = xpThresholds[newLevel as keyof typeof xpThresholds];
    progress.levelProgress = Math.round(((progress.totalXP - currentThreshold) / (nextThreshold - currentThreshold)) * 100);
  }

  // Check and unlock streak achievements
  private checkStreakAchievements(progress: UserProgress): void {
    const streakMilestones = [3, 7, 14, 30, 50, 100];
    
    for (const milestone of streakMilestones) {
      if (progress.currentStreak === milestone) {
        this.unlockAchievement(progress, {
          id: `streak_${milestone}`,
          title: `${milestone} Day Streak!`,
          description: `Maintained a ${milestone} day learning streak`,
          icon: progress.currentStreak >= 30 ? '🔥' : progress.currentStreak >= 7 ? '⭐' : '📚',
          category: 'streak'
        });
      }
    }
  }

  // Check and unlock lesson achievements
  private checkLessonAchievements(progress: UserProgress): void {
    const lessonMilestones = [1, 5, 10, 25, 50, 100];
    const completedCount = progress.completedLessons.length;
    
    for (const milestone of lessonMilestones) {
      if (completedCount === milestone) {
        this.unlockAchievement(progress, {
          id: `lessons_${milestone}`,
          title: `${milestone} Lessons Complete!`,
          description: `Completed ${milestone} Turkish lessons`,
          icon: milestone >= 50 ? '🏆' : milestone >= 10 ? '🎖️' : '📖',
          category: 'lessons'
        });
      }
    }
  }

  // Unlock an achievement
  private unlockAchievement(progress: UserProgress, achievement: Omit<Achievement, 'unlockedAt'>): void {
    // Check if achievement already exists
    if (!progress.achievements.find(a => a.id === achievement.id)) {
      progress.achievements.push({
        ...achievement,
        unlockedAt: new Date()
      });
    }
  }

  // Get daily statistics
  getDailyStats(days: number = 7): DailyStats[] {
    try {
      const stored = localStorage.getItem(this.DAILY_STATS_KEY);
      if (stored) {
        const stats = JSON.parse(stored);
        return stats.slice(-days).map((stat: any) => ({
          ...stat,
          date: new Date(stat.date)
        }));
      }
    } catch (error) {
      console.error('Error loading daily stats:', error);
    }
    
    return [];
  }

  // Record daily activity
  recordDailyActivity(xpEarned: number, lessonsCompleted: number, timeSpent: number, exercisesCompleted: number): void {
    try {
      const today = new Date().toDateString();
      const stored = localStorage.getItem(this.DAILY_STATS_KEY);
      let stats: DailyStats[] = stored ? JSON.parse(stored) : [];
      
      // Find or create today's entry
      let todayStats = stats.find(s => new Date(s.date).toDateString() === today);
      
      if (todayStats) {
        todayStats.xpEarned += xpEarned;
        todayStats.lessonsCompleted += lessonsCompleted;
        todayStats.timeSpent += timeSpent;
        todayStats.exercisesCompleted += exercisesCompleted;
      } else {
        stats.push({
          date: new Date(),
          xpEarned,
          lessonsCompleted,
          timeSpent,
          exercisesCompleted
        });
      }
      
      // Keep only last 30 days
      stats = stats.slice(-30);
      
      localStorage.setItem(this.DAILY_STATS_KEY, JSON.stringify(stats));
    } catch (error) {
      console.error('Error recording daily activity:', error);
    }
  }

  // Reset progress (for testing)
  resetProgress(): void {
    localStorage.removeItem(this.STORAGE_KEY);
    localStorage.removeItem(this.DAILY_STATS_KEY);
  }
}

export const userProgressService = new UserProgressService();
