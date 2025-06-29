import React from 'react'
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native'
import { useAppSelector } from '../store'

export const PracticeScreen: React.FC = () => {
  const { display } = useAppSelector((state) => state.settings)
  
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
          Practice
        </Text>
        <Text style={[
          styles.subtitle,
          { color: isDark ? '#d1d5db' : '#6b7280' }
        ]}>
          Strengthen your skills with focused practice
        </Text>
      </View>

      {/* Practice Categories */}
      <View style={styles.content}>
        <TouchableOpacity style={[
          styles.practiceCard,
          { backgroundColor: isDark ? '#1f2937' : '#ffffff' }
        ]}>
          <View style={styles.cardHeader}>
            <Text style={styles.cardIcon}>🗣️</Text>
            <View style={styles.cardContent}>
              <Text style={[
                styles.cardTitle,
                { color: isDark ? '#ffffff' : '#1f2937' }
              ]}>
                Speaking Practice
              </Text>
              <Text style={[
                styles.cardDescription,
                { color: isDark ? '#d1d5db' : '#6b7280' }
              ]}>
                Practice pronunciation and speaking
              </Text>
            </View>
          </View>
          <View style={styles.cardStats}>
            <Text style={styles.statText}>5 exercises available</Text>
          </View>
        </TouchableOpacity>

        <TouchableOpacity style={[
          styles.practiceCard,
          { backgroundColor: isDark ? '#1f2937' : '#ffffff' }
        ]}>
          <View style={styles.cardHeader}>
            <Text style={styles.cardIcon}>👂</Text>
            <View style={styles.cardContent}>
              <Text style={[
                styles.cardTitle,
                { color: isDark ? '#ffffff' : '#1f2937' }
              ]}>
                Listening Practice
              </Text>
              <Text style={[
                styles.cardDescription,
                { color: isDark ? '#d1d5db' : '#6b7280' }
              ]}>
                Improve your listening comprehension
              </Text>
            </View>
          </View>
          <View style={styles.cardStats}>
            <Text style={styles.statText}>8 exercises available</Text>
          </View>
        </TouchableOpacity>

        <TouchableOpacity style={[
          styles.practiceCard,
          { backgroundColor: isDark ? '#1f2937' : '#ffffff' }
        ]}>
          <View style={styles.cardHeader}>
            <Text style={styles.cardIcon}>📝</Text>
            <View style={styles.cardContent}>
              <Text style={[
                styles.cardTitle,
                { color: isDark ? '#ffffff' : '#1f2937' }
              ]}>
                Writing Practice
              </Text>
              <Text style={[
                styles.cardDescription,
                { color: isDark ? '#d1d5db' : '#6b7280' }
              ]}>
                Practice writing Turkish sentences
              </Text>
            </View>
          </View>
          <View style={styles.cardStats}>
            <Text style={styles.statText}>3 exercises available</Text>
          </View>
        </TouchableOpacity>

        <TouchableOpacity style={[
          styles.practiceCard,
          { backgroundColor: isDark ? '#1f2937' : '#ffffff' }
        ]}>
          <View style={styles.cardHeader}>
            <Text style={styles.cardIcon}>📚</Text>
            <View style={styles.cardContent}>
              <Text style={[
                styles.cardTitle,
                { color: isDark ? '#ffffff' : '#1f2937' }
              ]}>
                Vocabulary Review
              </Text>
              <Text style={[
                styles.cardDescription,
                { color: isDark ? '#d1d5db' : '#6b7280' }
              ]}>
                Review words you've learned
              </Text>
            </View>
          </View>
          <View style={styles.cardStats}>
            <Text style={styles.statText}>12 words due for review</Text>
          </View>
        </TouchableOpacity>

        <TouchableOpacity style={[
          styles.practiceCard,
          { backgroundColor: isDark ? '#1f2937' : '#ffffff' }
        ]}>
          <View style={styles.cardHeader}>
            <Text style={styles.cardIcon}>⚡</Text>
            <View style={styles.cardContent}>
              <Text style={[
                styles.cardTitle,
                { color: isDark ? '#ffffff' : '#1f2937' }
              ]}>
                Quick Quiz
              </Text>
              <Text style={[
                styles.cardDescription,
                { color: isDark ? '#d1d5db' : '#6b7280' }
              ]}>
                Test your knowledge with a quick quiz
              </Text>
            </View>
          </View>
          <View style={styles.cardStats}>
            <Text style={styles.statText}>Mixed topics</Text>
          </View>
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
    gap: 16,
  },
  practiceCard: {
    borderRadius: 12,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    gap: 16,
  },
  cardIcon: {
    fontSize: 32,
  },
  cardContent: {
    flex: 1,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 4,
  },
  cardDescription: {
    fontSize: 14,
  },
  cardStats: {
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#e5e7eb',
  },
  statText: {
    fontSize: 12,
    color: '#6b7280',
    fontWeight: '500',
  },
})
