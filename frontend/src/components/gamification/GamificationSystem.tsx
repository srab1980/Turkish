'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: string;
  points: number;
  unlocked: boolean;
  unlockedAt?: Date;
  category: 'vocabulary' | 'grammar' | 'streak' | 'completion' | 'speed';
}

interface Badge {
  id: string;
  name: string;
  icon: string;
  color: string;
  requirement: string;
  earned: boolean;
}

interface UserStats {
  totalPoints: number;
  currentStreak: number;
  longestStreak: number;
  lessonsCompleted: number;
  vocabularyMastered: number;
  timeSpent: number; // in minutes
  level: number;
  xpToNextLevel: number;
  totalXP: number;
}

interface GamificationSystemProps {
  userStats: UserStats;
  achievements: Achievement[];
  badges: Badge[];
  onAchievementUnlocked?: (achievement: Achievement) => void;
  onBadgeEarned?: (badge: Badge) => void;
}

export default function GamificationSystem({ 
  userStats, 
  achievements, 
  badges, 
  onAchievementUnlocked,
  onBadgeEarned 
}: GamificationSystemProps) {
  const [showAchievementPopup, setShowAchievementPopup] = useState<Achievement | null>(null);
  const [showBadgePopup, setShowBadgePopup] = useState<Badge | null>(null);
  const [activeTab, setActiveTab] = useState<'overview' | 'achievements' | 'badges'>('overview');

  // Calculate level progress
  const levelProgress = ((userStats.totalXP % 1000) / 1000) * 100;
  const nextLevelXP = (userStats.level + 1) * 1000;

  // Achievement categories
  const achievementCategories = {
    vocabulary: achievements.filter(a => a.category === 'vocabulary'),
    grammar: achievements.filter(a => a.category === 'grammar'),
    streak: achievements.filter(a => a.category === 'streak'),
    completion: achievements.filter(a => a.category === 'completion'),
    speed: achievements.filter(a => a.category === 'speed'),
  };

  // Check for new achievements
  useEffect(() => {
    const newAchievements = achievements.filter(a => 
      a.unlocked && 
      a.unlockedAt && 
      new Date(a.unlockedAt).getTime() > Date.now() - 5000 // Last 5 seconds
    );

    if (newAchievements.length > 0 && onAchievementUnlocked) {
      setShowAchievementPopup(newAchievements[0]);
      setTimeout(() => setShowAchievementPopup(null), 4000);
    }
  }, [achievements, onAchievementUnlocked]);

  const getStreakColor = (streak: number) => {
    if (streak >= 30) return 'text-purple-600';
    if (streak >= 14) return 'text-orange-600';
    if (streak >= 7) return 'text-yellow-600';
    if (streak >= 3) return 'text-green-600';
    return 'text-gray-600';
  };

  const getStreakIcon = (streak: number) => {
    if (streak >= 30) return '🔥🔥🔥';
    if (streak >= 14) return '🔥🔥';
    if (streak >= 7) return '🔥';
    if (streak >= 3) return '⭐';
    return '📚';
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      {/* Achievement Popup */}
      <AnimatePresence>
        {showAchievementPopup && (
          <motion.div
            initial={{ opacity: 0, y: -100, scale: 0.8 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -100, scale: 0.8 }}
            className="fixed top-4 left-1/2 transform -translate-x-1/2 z-50 bg-gradient-to-r from-yellow-400 to-orange-500 text-white p-6 rounded-lg shadow-2xl border-2 border-yellow-300"
          >
            <div className="text-center">
              <div className="text-4xl mb-2">{showAchievementPopup.icon}</div>
              <h3 className="text-xl font-bold mb-1">Achievement Unlocked!</h3>
              <p className="text-lg font-semibold">{showAchievementPopup.title}</p>
              <p className="text-sm opacity-90">{showAchievementPopup.description}</p>
              <p className="text-sm font-bold mt-2">+{showAchievementPopup.points} XP</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Header */}
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-gray-800 mb-2">Your Progress</h1>
        <div className="flex justify-center space-x-8 text-sm text-gray-600">
          <span>Level {userStats.level}</span>
          <span>{userStats.totalPoints.toLocaleString()} Points</span>
          <span className={getStreakColor(userStats.currentStreak)}>
            {getStreakIcon(userStats.currentStreak)} {userStats.currentStreak} Day Streak
          </span>
        </div>
      </div>

      {/* Level Progress */}
      <div className="mb-8 p-6 bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg border border-blue-200">
        <div className="flex items-center justify-between mb-3">
          <span className="text-lg font-semibold text-gray-800">Level {userStats.level}</span>
          <span className="text-sm text-gray-600">{userStats.totalXP} / {nextLevelXP} XP</span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-4 mb-2">
          <motion.div 
            className="bg-gradient-to-r from-blue-500 to-purple-600 h-4 rounded-full"
            initial={{ width: 0 }}
            animate={{ width: `${levelProgress}%` }}
            transition={{ duration: 1, ease: "easeOut" }}
          />
        </div>
        <div className="text-center text-sm text-gray-600">
          {userStats.xpToNextLevel} XP to Level {userStats.level + 1}
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex justify-center mb-6">
        <div className="bg-gray-100 rounded-lg p-1">
          {(['overview', 'achievements', 'badges'] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-6 py-2 rounded-md font-medium transition-all ${
                activeTab === tab
                  ? 'bg-white text-blue-600 shadow-sm'
                  : 'text-gray-600 hover:text-gray-800'
              }`}
            >
              {tab.charAt(0).toUpperCase() + tab.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {/* Overview Tab */}
      {activeTab === 'overview' && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"
        >
          <div className="bg-white p-6 rounded-lg shadow-md border border-gray-200">
            <div className="text-3xl mb-2">📚</div>
            <div className="text-2xl font-bold text-gray-800">{userStats.lessonsCompleted}</div>
            <div className="text-sm text-gray-600">Lessons Completed</div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-md border border-gray-200">
            <div className="text-3xl mb-2">📝</div>
            <div className="text-2xl font-bold text-gray-800">{userStats.vocabularyMastered}</div>
            <div className="text-sm text-gray-600">Words Mastered</div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-md border border-gray-200">
            <div className="text-3xl mb-2">⏱️</div>
            <div className="text-2xl font-bold text-gray-800">{Math.round(userStats.timeSpent / 60)}h</div>
            <div className="text-sm text-gray-600">Time Spent</div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-md border border-gray-200">
            <div className="text-3xl mb-2">🏆</div>
            <div className="text-2xl font-bold text-gray-800">{userStats.longestStreak}</div>
            <div className="text-sm text-gray-600">Longest Streak</div>
          </div>
        </motion.div>
      )}

      {/* Achievements Tab */}
      {activeTab === 'achievements' && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-6"
        >
          {Object.entries(achievementCategories).map(([category, categoryAchievements]) => (
            <div key={category} className="bg-white rounded-lg shadow-md border border-gray-200 p-6">
              <h3 className="text-xl font-semibold text-gray-800 mb-4 capitalize">
                {category} Achievements
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {categoryAchievements.map((achievement) => (
                  <motion.div
                    key={achievement.id}
                    className={`p-4 rounded-lg border-2 transition-all ${
                      achievement.unlocked
                        ? 'border-green-300 bg-green-50'
                        : 'border-gray-200 bg-gray-50'
                    }`}
                    whileHover={{ scale: 1.02 }}
                  >
                    <div className="text-center">
                      <div className={`text-3xl mb-2 ${achievement.unlocked ? '' : 'grayscale opacity-50'}`}>
                        {achievement.icon}
                      </div>
                      <h4 className={`font-semibold mb-1 ${
                        achievement.unlocked ? 'text-green-800' : 'text-gray-600'
                      }`}>
                        {achievement.title}
                      </h4>
                      <p className="text-sm text-gray-600 mb-2">{achievement.description}</p>
                      <div className={`text-xs font-bold ${
                        achievement.unlocked ? 'text-green-600' : 'text-gray-500'
                      }`}>
                        {achievement.points} XP
                      </div>
                      {achievement.unlocked && achievement.unlockedAt && (
                        <div className="text-xs text-green-600 mt-1">
                          Unlocked {new Date(achievement.unlockedAt).toLocaleDateString()}
                        </div>
                      )}
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          ))}
        </motion.div>
      )}

      {/* Badges Tab */}
      {activeTab === 'badges' && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-lg shadow-md border border-gray-200 p-6"
        >
          <h3 className="text-xl font-semibold text-gray-800 mb-6">Earned Badges</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
            {badges.map((badge) => (
              <motion.div
                key={badge.id}
                className={`p-4 rounded-lg text-center transition-all ${
                  badge.earned
                    ? `bg-${badge.color}-100 border-2 border-${badge.color}-300`
                    : 'bg-gray-100 border-2 border-gray-200'
                }`}
                whileHover={{ scale: 1.05 }}
                title={badge.requirement}
              >
                <div className={`text-2xl mb-2 ${badge.earned ? '' : 'grayscale opacity-50'}`}>
                  {badge.icon}
                </div>
                <div className={`text-sm font-semibold ${
                  badge.earned ? `text-${badge.color}-800` : 'text-gray-600'
                }`}>
                  {badge.name}
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>
      )}
    </div>
  );
}
