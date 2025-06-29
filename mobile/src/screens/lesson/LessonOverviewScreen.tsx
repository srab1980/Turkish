import React from 'react'
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native'
import { useAppSelector } from '../../store'

export const LessonOverviewScreen: React.FC = () => {
  const { display } = useAppSelector((state) => state.settings)
  const { currentLesson } = useAppSelector((state) => state.lessons)
  
  const isDark = display.theme === 'dark'
  
  return (
    <ScrollView style={[
      styles.container,
      { backgroundColor: isDark ? '#111827' : '#f9fafb' }
    ]}>
      {/* Lesson Header */}
      <View style={[
        styles.header,
        { backgroundColor: isDark ? '#1f2937' : '#ffffff' }
      ]}>
        <Text style={[
          styles.title,
          { color: isDark ? '#ffffff' : '#1f2937' }
        ]}>
          {currentLesson?.title || 'Lesson Overview'}
        </Text>
        
        <Text style={[
          styles.subtitle,
          { color: isDark ? '#d1d5db' : '#6b7280' }
        ]}>
          {currentLesson?.type || 'Vocabulary'} • Level {currentLesson?.level || 'A1'}
        </Text>
        
        <View style={styles.progressContainer}>
          <View style={styles.progressBar}>
            <View style={[
              styles.progressFill,
              { width: `${currentLesson?.progress || 0}%` }
            ]} />
          </View>
          <Text style={[
            styles.progressText,
            { color: isDark ? '#d1d5db' : '#6b7280' }
          ]}>
            {Math.round(currentLesson?.progress || 0)}% Complete
          </Text>
        </View>
      </View>

      {/* Lesson Content Preview */}
      <View style={[
        styles.section,
        { backgroundColor: isDark ? '#1f2937' : '#ffffff' }
      ]}>
        <Text style={[
          styles.sectionTitle,
          { color: isDark ? '#ffffff' : '#1f2937' }
        ]}>
          What You'll Learn
        </Text>
        
        <View style={styles.learningPoints}>
          <View style={styles.learningPoint}>
            <Text style={styles.bullet}>•</Text>
            <Text style={[
              styles.learningText,
              { color: isDark ? '#d1d5db' : '#6b7280' }
            ]}>
              Basic Turkish greetings and responses
            </Text>
          </View>
          
          <View style={styles.learningPoint}>
            <Text style={styles.bullet}>•</Text>
            <Text style={[
              styles.learningText,
              { color: isDark ? '#d1d5db' : '#6b7280' }
            ]}>
              Pronunciation and listening practice
            </Text>
          </View>
          
          <View style={styles.learningPoint}>
            <Text style={styles.bullet}>•</Text>
            <Text style={[
              styles.learningText,
              { color: isDark ? '#d1d5db' : '#6b7280' }
            ]}>
              Cultural context and usage
            </Text>
          </View>
        </View>
      </View>

      {/* Lesson Actions */}
      <View style={styles.actions}>
        <TouchableOpacity style={styles.primaryButton}>
          <Text style={styles.primaryButtonText}>
            {currentLesson?.progress ? 'Continue Lesson' : 'Start Lesson'}
          </Text>
        </TouchableOpacity>
        
        <TouchableOpacity style={[
          styles.secondaryButton,
          { borderColor: isDark ? '#374151' : '#d1d5db' }
        ]}>
          <Text style={[
            styles.secondaryButtonText,
            { color: isDark ? '#ffffff' : '#1f2937' }
          ]}>
            Practice Vocabulary
          </Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    padding: 24,
    marginBottom: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    marginBottom: 20,
  },
  progressContainer: {
    gap: 8,
  },
  progressBar: {
    height: 8,
    backgroundColor: '#e5e7eb',
    borderRadius: 4,
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#10b981',
    borderRadius: 4,
  },
  progressText: {
    fontSize: 14,
    fontWeight: '500',
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
  learningPoints: {
    gap: 12,
  },
  learningPoint: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
  },
  bullet: {
    color: '#1e40af',
    fontSize: 16,
    fontWeight: '700',
    marginTop: 2,
  },
  learningText: {
    flex: 1,
    fontSize: 16,
    lineHeight: 24,
  },
  actions: {
    padding: 20,
    gap: 12,
  },
  primaryButton: {
    backgroundColor: '#1e40af',
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
  },
  primaryButtonText: {
    color: '#ffffff',
    fontSize: 18,
    fontWeight: '600',
  },
  secondaryButton: {
    borderWidth: 2,
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
  },
  secondaryButtonText: {
    fontSize: 18,
    fontWeight: '600',
  },
})
