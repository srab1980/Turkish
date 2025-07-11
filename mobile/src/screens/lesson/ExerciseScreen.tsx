import React from 'react'
import { View, Text, StyleSheet } from 'react-native'
import { useAppSelector } from '../../store'

export const ExerciseScreen: React.FC = () => {
  const { display } = useAppSelector((state) => state.settings)
  const isDark = display.theme === 'dark'
  
  return (
    <View style={[
      styles.container,
      { backgroundColor: isDark ? '#111827' : '#f9fafb' }
    ]}>
      <Text style={[
        styles.title,
        { color: isDark ? '#ffffff' : '#1f2937' }
      ]}>
        Exercise
      </Text>
      <Text style={[
        styles.subtitle,
        { color: isDark ? '#d1d5db' : '#6b7280' }
      ]}>
        Interactive exercises and practice activities will be implemented here.
      </Text>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    marginBottom: 16,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    textAlign: 'center',
    lineHeight: 24,
  },
})
