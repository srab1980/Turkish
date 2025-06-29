import React from 'react'
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native'
import { useNavigation } from '@react-navigation/native'
import { useAppSelector } from '../../store'

export const WelcomeScreen: React.FC = () => {
  const navigation = useNavigation()
  const { display } = useAppSelector((state) => state.settings)
  
  const isDark = display.theme === 'dark'
  
  return (
    <View style={[
      styles.container,
      { backgroundColor: isDark ? '#111827' : '#ffffff' }
    ]}>
      <View style={styles.content}>
        {/* Logo */}
        <View style={styles.logoContainer}>
          <Text style={styles.logo}>🇹🇷</Text>
        </View>
        
        {/* Title */}
        <Text style={[
          styles.title,
          { color: isDark ? '#ffffff' : '#1f2937' }
        ]}>
          Learn Turkish
        </Text>
        
        {/* Subtitle */}
        <Text style={[
          styles.subtitle,
          { color: isDark ? '#d1d5db' : '#6b7280' }
        ]}>
          Master Turkish with interactive lessons based on the Istanbul Book curriculum
        </Text>
        
        {/* Features */}
        <View style={styles.features}>
          <View style={styles.feature}>
            <Text style={styles.featureIcon}>🎯</Text>
            <Text style={[
              styles.featureText,
              { color: isDark ? '#d1d5db' : '#6b7280' }
            ]}>
              Structured curriculum
            </Text>
          </View>
          
          <View style={styles.feature}>
            <Text style={styles.featureIcon}>🗣️</Text>
            <Text style={[
              styles.featureText,
              { color: isDark ? '#d1d5db' : '#6b7280' }
            ]}>
              Speaking practice
            </Text>
          </View>
          
          <View style={styles.feature}>
            <Text style={styles.featureIcon}>📱</Text>
            <Text style={[
              styles.featureText,
              { color: isDark ? '#d1d5db' : '#6b7280' }
            ]}>
              Learn anywhere
            </Text>
          </View>
        </View>
      </View>
      
      {/* Buttons */}
      <View style={styles.buttons}>
        <TouchableOpacity 
          style={styles.primaryButton}
          onPress={() => navigation.navigate('Register' as never)}
        >
          <Text style={styles.primaryButtonText}>Get Started</Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={[
            styles.secondaryButton,
            { borderColor: isDark ? '#374151' : '#d1d5db' }
          ]}
          onPress={() => navigation.navigate('Login' as never)}
        >
          <Text style={[
            styles.secondaryButtonText,
            { color: isDark ? '#ffffff' : '#1f2937' }
          ]}>
            I already have an account
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 24,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  logoContainer: {
    marginBottom: 32,
  },
  logo: {
    fontSize: 80,
  },
  title: {
    fontSize: 32,
    fontWeight: '700',
    textAlign: 'center',
    marginBottom: 16,
  },
  subtitle: {
    fontSize: 18,
    textAlign: 'center',
    lineHeight: 26,
    marginBottom: 48,
    paddingHorizontal: 20,
  },
  features: {
    gap: 20,
  },
  feature: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  featureIcon: {
    fontSize: 24,
  },
  featureText: {
    fontSize: 16,
  },
  buttons: {
    gap: 16,
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
