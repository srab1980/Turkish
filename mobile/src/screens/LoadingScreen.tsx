import React from 'react'
import { View, Text, StyleSheet, ActivityIndicator } from 'react-native'
import { useAppSelector } from '../store'

interface LoadingScreenProps {
  message?: string
}

export const LoadingScreen: React.FC<LoadingScreenProps> = ({ 
  message = 'Loading...' 
}) => {
  const { display } = useAppSelector((state) => state.settings)
  
  const isDark = display.theme === 'dark'
  
  return (
    <View style={[
      styles.container,
      { backgroundColor: isDark ? '#1f2937' : '#ffffff' }
    ]}>
      <View style={styles.content}>
        {/* App Logo/Icon */}
        <View style={[
          styles.logoContainer,
          { backgroundColor: isDark ? '#374151' : '#f3f4f6' }
        ]}>
          <Text style={styles.logoText}>🇹🇷</Text>
        </View>
        
        {/* App Name */}
        <Text style={[
          styles.appName,
          { color: isDark ? '#ffffff' : '#1f2937' }
        ]}>
          Turkish Learning
        </Text>
        
        {/* Loading Indicator */}
        <ActivityIndicator 
          size="large" 
          color="#1e40af" 
          style={styles.spinner}
        />
        
        {/* Loading Message */}
        <Text style={[
          styles.message,
          { color: isDark ? '#d1d5db' : '#6b7280' }
        ]}>
          {message}
        </Text>
        
        {/* Progress Dots */}
        <View style={styles.dotsContainer}>
          <View style={[styles.dot, styles.dotActive]} />
          <View style={[styles.dot, styles.dotActive]} />
          <View style={[styles.dot, { backgroundColor: '#d1d5db' }]} />
        </View>
      </View>
      
      {/* Footer */}
      <View style={styles.footer}>
        <Text style={[
          styles.footerText,
          { color: isDark ? '#9ca3af' : '#9ca3af' }
        ]}>
          Powered by Istanbul Book Curriculum
        </Text>
      </View>
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
  content: {
    alignItems: 'center',
    justifyContent: 'center',
    flex: 1,
  },
  logoContainer: {
    width: 120,
    height: 120,
    borderRadius: 60,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 8,
  },
  logoText: {
    fontSize: 48,
  },
  appName: {
    fontSize: 28,
    fontWeight: '700',
    marginBottom: 40,
    textAlign: 'center',
  },
  spinner: {
    marginBottom: 24,
  },
  message: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 32,
    lineHeight: 24,
  },
  dotsContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginHorizontal: 4,
  },
  dotActive: {
    backgroundColor: '#1e40af',
  },
  footer: {
    position: 'absolute',
    bottom: 40,
    alignItems: 'center',
  },
  footerText: {
    fontSize: 12,
    textAlign: 'center',
  },
})
