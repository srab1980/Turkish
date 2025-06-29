import React from 'react'
import { View, Text, StyleSheet, ScrollView } from 'react-native'
import { useAppSelector } from '../store'

export const ProgressScreen: React.FC = () => {
  const { display } = useAppSelector((state) => state.settings)
  const { overallStats } = useAppSelector((state) => state.progress)
  
  const isDark = display.theme === 'dark'
  
  return (
    <ScrollView style={[
      styles.container,
      { backgroundColor: isDark ? '#111827' : '#f9fafb' }
    ]}>
      {/* Header */}
      <View style={[
        styles.header,
        { backgroundColor: isDark ? '#1f2937' : '#ffffff' }
      ]}>
        <Text style={[
          styles.title,
          { color: isDark ? '#ffffff' : '#1f2937' }
        ]}>
          Your Progress
        </Text>
        <Text style={[
          styles.subtitle,
          { color: isDark ? '#d1d5db' : '#6b7280' }
        ]}>
          Track your learning journey
        </Text>
      </View>

      {/* Stats Overview */}
      <View style={styles.content}>
        <View style={styles.statsGrid}>
          <View style={[
            styles.statCard,
            { backgroundColor: isDark ? '#1f2937' : '#ffffff' }
          ]}>
            <Text style={styles.statNumber}>{overallStats.currentStreak}</Text>
            <Text style={[
              styles.statLabel,
              { color: isDark ? '#d1d5db' : '#6b7280' }
            ]}>
              Current Streak
            </Text>
            <Text style={styles.statIcon}>🔥</Text>
          </View>

          <View style={[
            styles.statCard,
            { backgroundColor: isDark ? '#1f2937' : '#ffffff' }
          ]}>
            <Text style={styles.statNumber}>{overallStats.totalXP}</Text>
            <Text style={[
              styles.statLabel,
              { color: isDark ? '#d1d5db' : '#6b7280' }
            ]}>
              Total XP
            </Text>
            <Text style={styles.statIcon}>⭐</Text>
          </View>

          <View style={[
            styles.statCard,
            { backgroundColor: isDark ? '#1f2937' : '#ffffff' }
          ]}>
            <Text style={styles.statNumber}>{overallStats.lessonsCompleted}</Text>
            <Text style={[
              styles.statLabel,
              { color: isDark ? '#d1d5db' : '#6b7280' }
            ]}>
              Lessons Completed
            </Text>
            <Text style={styles.statIcon}>📚</Text>
          </View>

          <View style={[
            styles.statCard,
            { backgroundColor: isDark ? '#1f2937' : '#ffffff' }
          ]}>
            <Text style={styles.statNumber}>{Math.round(overallStats.averageAccuracy)}%</Text>
            <Text style={[
              styles.statLabel,
              { color: isDark ? '#d1d5db' : '#6b7280' }
            ]}>
              Accuracy
            </Text>
            <Text style={styles.statIcon}>🎯</Text>
          </View>
        </View>

        {/* Weekly Progress */}
        <View style={[
          styles.section,
          { backgroundColor: isDark ? '#1f2937' : '#ffffff' }
        ]}>
          <Text style={[
            styles.sectionTitle,
            { color: isDark ? '#ffffff' : '#1f2937' }
          ]}>
            This Week
          </Text>
          
          <View style={styles.weeklyChart}>
            {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((day, index) => (
              <View key={day} style={styles.dayColumn}>
                <View style={[
                  styles.dayBar,
                  { 
                    height: Math.random() * 60 + 20,
                    backgroundColor: index < 4 ? '#10b981' : '#e5e7eb'
                  }
                ]} />
                <Text style={[
                  styles.dayLabel,
                  { color: isDark ? '#d1d5db' : '#6b7280' }
                ]}>
                  {day}
                </Text>
              </View>
            ))}
          </View>
        </View>

        {/* Achievements */}
        <View style={[
          styles.section,
          { backgroundColor: isDark ? '#1f2937' : '#ffffff' }
        ]}>
          <Text style={[
            styles.sectionTitle,
            { color: isDark ? '#ffffff' : '#1f2937' }
          ]}>
            Recent Achievements
          </Text>
          
          <View style={styles.achievements}>
            <View style={styles.achievement}>
              <Text style={styles.achievementIcon}>🏆</Text>
              <View style={styles.achievementContent}>
                <Text style={[
                  styles.achievementTitle,
                  { color: isDark ? '#ffffff' : '#1f2937' }
                ]}>
                  First Lesson Complete
                </Text>
                <Text style={[
                  styles.achievementDescription,
                  { color: isDark ? '#d1d5db' : '#6b7280' }
                ]}>
                  Completed your first Turkish lesson
                </Text>
              </View>
            </View>

            <View style={styles.achievement}>
              <Text style={styles.achievementIcon}>🔥</Text>
              <View style={styles.achievementContent}>
                <Text style={[
                  styles.achievementTitle,
                  { color: isDark ? '#ffffff' : '#1f2937' }
                ]}>
                  3-Day Streak
                </Text>
                <Text style={[
                  styles.achievementDescription,
                  { color: isDark ? '#d1d5db' : '#6b7280' }
                ]}>
                  Practiced for 3 days in a row
                </Text>
              </View>
            </View>
          </View>
        </View>
      </div>
    </ScrollView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    padding: 20,
    marginBottom: 16,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 16,
  },
  content: {
    paddingHorizontal: 20,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginBottom: 24,
  },
  statCard: {
    width: '48%',
    padding: 20,
    borderRadius: 12,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  statNumber: {
    fontSize: 32,
    fontWeight: '700',
    color: '#1e40af',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    textAlign: 'center',
    marginBottom: 8,
  },
  statIcon: {
    fontSize: 20,
  },
  section: {
    marginBottom: 24,
    padding: 20,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 16,
  },
  weeklyChart: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    height: 100,
  },
  dayColumn: {
    alignItems: 'center',
    flex: 1,
  },
  dayBar: {
    width: 20,
    backgroundColor: '#10b981',
    borderRadius: 4,
    marginBottom: 8,
  },
  dayLabel: {
    fontSize: 12,
  },
  achievements: {
    gap: 16,
  },
  achievement: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  achievementIcon: {
    fontSize: 24,
  },
  achievementContent: {
    flex: 1,
  },
  achievementTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 2,
  },
  achievementDescription: {
    fontSize: 14,
  },
})
