import React from 'react'
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native'
import { useAppSelector } from '../store'

export const HomeScreen: React.FC = () => {
  const { display } = useAppSelector((state) => state.settings)
  const { user } = useAppSelector((state) => state.auth)
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
          styles.greeting,
          { color: isDark ? '#d1d5db' : '#6b7280' }
        ]}>
          Good morning,
        </Text>
        <Text style={[
          styles.userName,
          { color: isDark ? '#ffffff' : '#1f2937' }
        ]}>
          {user?.name || 'Learner'}! 👋
        </Text>
      </View>

      {/* Stats Cards */}
      <View style={styles.statsContainer}>
        <View style={[
          styles.statCard,
          { backgroundColor: isDark ? '#1f2937' : '#ffffff' }
        ]}>
          <Text style={styles.statNumber}>{overallStats.currentStreak}</Text>
          <Text style={[
            styles.statLabel,
            { color: isDark ? '#d1d5db' : '#6b7280' }
          ]}>
            Day Streak 🔥
          </Text>
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
            Total XP ⭐
          </Text>
        </View>
      </View>

      {/* Continue Learning */}
      <View style={[
        styles.section,
        { backgroundColor: isDark ? '#1f2937' : '#ffffff' }
      ]}>
        <Text style={[
          styles.sectionTitle,
          { color: isDark ? '#ffffff' : '#1f2937' }
        ]}>
          Continue Learning
        </Text>
        
        <TouchableOpacity style={styles.continueButton}>
          <View style={styles.continueContent}>
            <View>
              <Text style={styles.continueTitle}>Basic Greetings</Text>
              <Text style={styles.continueSubtitle}>Unit 1 • Lesson 3</Text>
            </View>
            <View style={styles.progressBar}>
              <View style={[styles.progressFill, { width: '60%' }]} />
            </View>
          </View>
        </TouchableOpacity>
      </View>

      {/* Quick Actions */}
      <View style={[
        styles.section,
        { backgroundColor: isDark ? '#1f2937' : '#ffffff' }
      ]}>
        <Text style={[
          styles.sectionTitle,
          { color: isDark ? '#ffffff' : '#1f2937' }
        ]}>
          Quick Practice
        </Text>
        
        <View style={styles.quickActions}>
          <TouchableOpacity style={styles.actionButton}>
            <Text style={styles.actionIcon}>🗣️</Text>
            <Text style={styles.actionText}>Speaking</Text>
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.actionButton}>
            <Text style={styles.actionIcon}>👂</Text>
            <Text style={styles.actionText}>Listening</Text>
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.actionButton}>
            <Text style={styles.actionIcon}>📝</Text>
            <Text style={styles.actionText}>Writing</Text>
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.actionButton}>
            <Text style={styles.actionIcon}>📚</Text>
            <Text style={styles.actionText}>Vocabulary</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Daily Goal */}
      <View style={[
        styles.section,
        { backgroundColor: isDark ? '#1f2937' : '#ffffff' }
      ]}>
        <Text style={[
          styles.sectionTitle,
          { color: isDark ? '#ffffff' : '#1f2937' }
        ]}>
          Daily Goal
        </Text>
        
        <View style={styles.goalContainer}>
          <View style={styles.goalProgress}>
            <View style={[styles.goalFill, { width: '75%' }]} />
          </View>
          <Text style={[
            styles.goalText,
            { color: isDark ? '#d1d5db' : '#6b7280' }
          ]}>
            15 / 20 minutes completed
          </Text>
        </View>
      </View>
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
  greeting: {
    fontSize: 16,
    marginBottom: 4,
  },
  userName: {
    fontSize: 24,
    fontWeight: '700',
  },
  statsContainer: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    marginBottom: 16,
    gap: 12,
  },
  statCard: {
    flex: 1,
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
    fontSize: 28,
    fontWeight: '700',
    color: '#1e40af',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 14,
    textAlign: 'center',
  },
  section: {
    marginHorizontal: 20,
    marginBottom: 16,
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
  continueButton: {
    backgroundColor: '#1e40af',
    borderRadius: 8,
    padding: 16,
  },
  continueContent: {
    gap: 12,
  },
  continueTitle: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },
  continueSubtitle: {
    color: '#bfdbfe',
    fontSize: 14,
  },
  progressBar: {
    height: 4,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    borderRadius: 2,
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#10b981',
    borderRadius: 2,
  },
  quickActions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  actionButton: {
    flex: 1,
    minWidth: '45%',
    backgroundColor: '#f3f4f6',
    borderRadius: 8,
    padding: 16,
    alignItems: 'center',
    gap: 8,
  },
  actionIcon: {
    fontSize: 24,
  },
  actionText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#374151',
  },
  goalContainer: {
    gap: 8,
  },
  goalProgress: {
    height: 8,
    backgroundColor: '#e5e7eb',
    borderRadius: 4,
  },
  goalFill: {
    height: '100%',
    backgroundColor: '#10b981',
    borderRadius: 4,
  },
  goalText: {
    fontSize: 14,
  },
})
