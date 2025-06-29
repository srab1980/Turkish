import React from 'react'
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native'
import { useAppSelector } from '../store'

export const LessonsScreen: React.FC = () => {
  const { display } = useAppSelector((state) => state.settings)
  const { lessons } = useAppSelector((state) => state.lessons)
  
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
          Lessons
        </Text>
        <Text style={[
          styles.subtitle,
          { color: isDark ? '#d1d5db' : '#6b7280' }
        ]}>
          Choose a lesson to continue learning
        </Text>
      </View>

      {/* Lesson Units */}
      <View style={styles.content}>
        {/* Unit 1 */}
        <View style={[
          styles.unit,
          { backgroundColor: isDark ? '#1f2937' : '#ffffff' }
        ]}>
          <Text style={[
            styles.unitTitle,
            { color: isDark ? '#ffffff' : '#1f2937' }
          ]}>
            Unit 1: Basic Turkish
          </Text>
          <Text style={[
            styles.unitDescription,
            { color: isDark ? '#d1d5db' : '#6b7280' }
          ]}>
            Learn essential greetings and basic phrases
          </Text>
          
          <View style={styles.lessons}>
            <TouchableOpacity style={[styles.lesson, styles.lessonCompleted]}>
              <View style={styles.lessonIcon}>
                <Text style={styles.lessonIconText}>✓</Text>
              </View>
              <View style={styles.lessonContent}>
                <Text style={styles.lessonTitle}>Greetings</Text>
                <Text style={styles.lessonSubtitle}>Basic hello and goodbye</Text>
              </View>
            </TouchableOpacity>
            
            <TouchableOpacity style={[styles.lesson, styles.lessonCurrent]}>
              <View style={styles.lessonIcon}>
                <Text style={styles.lessonIconText}>2</Text>
              </View>
              <View style={styles.lessonContent}>
                <Text style={styles.lessonTitle}>Introductions</Text>
                <Text style={styles.lessonSubtitle}>How to introduce yourself</Text>
              </View>
              <View style={styles.progressIndicator}>
                <View style={[styles.progressFill, { width: '60%' }]} />
              </View>
            </TouchableOpacity>
            
            <TouchableOpacity style={[styles.lesson, styles.lessonLocked]}>
              <View style={styles.lessonIcon}>
                <Text style={styles.lessonIconText}>🔒</Text>
              </View>
              <View style={styles.lessonContent}>
                <Text style={[styles.lessonTitle, styles.lockedText]}>Numbers</Text>
                <Text style={[styles.lessonSubtitle, styles.lockedText]}>Learn numbers 1-10</Text>
              </View>
            </TouchableOpacity>
          </View>
        </View>

        {/* Unit 2 */}
        <View style={[
          styles.unit,
          { backgroundColor: isDark ? '#1f2937' : '#ffffff' }
        ]}>
          <Text style={[
            styles.unitTitle,
            { color: isDark ? '#ffffff' : '#1f2937' }
          ]}>
            Unit 2: Everyday Conversations
          </Text>
          <Text style={[
            styles.unitDescription,
            { color: isDark ? '#d1d5db' : '#6b7280' }
          ]}>
            Practice common daily interactions
          </Text>
          
          <View style={styles.lessons}>
            <TouchableOpacity style={[styles.lesson, styles.lessonLocked]}>
              <View style={styles.lessonIcon}>
                <Text style={styles.lessonIconText}>🔒</Text>
              </View>
              <View style={styles.lessonContent}>
                <Text style={[styles.lessonTitle, styles.lockedText]}>At the Café</Text>
                <Text style={[styles.lessonSubtitle, styles.lockedText]}>Ordering food and drinks</Text>
              </View>
            </TouchableOpacity>
          </View>
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
  unit: {
    marginBottom: 24,
    borderRadius: 12,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  unitTitle: {
    fontSize: 20,
    fontWeight: '600',
    marginBottom: 4,
  },
  unitDescription: {
    fontSize: 14,
    marginBottom: 16,
  },
  lessons: {
    gap: 12,
  },
  lesson: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 8,
    gap: 12,
  },
  lessonCompleted: {
    backgroundColor: '#dcfce7',
    borderColor: '#16a34a',
    borderWidth: 1,
  },
  lessonCurrent: {
    backgroundColor: '#dbeafe',
    borderColor: '#2563eb',
    borderWidth: 2,
  },
  lessonLocked: {
    backgroundColor: '#f3f4f6',
    opacity: 0.6,
  },
  lessonIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#ffffff',
    justifyContent: 'center',
    alignItems: 'center',
  },
  lessonIconText: {
    fontSize: 16,
    fontWeight: '600',
  },
  lessonContent: {
    flex: 1,
  },
  lessonTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1f2937',
    marginBottom: 2,
  },
  lessonSubtitle: {
    fontSize: 14,
    color: '#6b7280',
  },
  lockedText: {
    color: '#9ca3af',
  },
  progressIndicator: {
    width: 60,
    height: 4,
    backgroundColor: '#e5e7eb',
    borderRadius: 2,
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#2563eb',
    borderRadius: 2,
  },
})
