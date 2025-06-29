import React, { useState } from 'react'
import { View, Text, StyleSheet, TextInput, TouchableOpacity, Alert } from 'react-native'
import { useNavigation } from '@react-navigation/native'
import { useAppSelector, useAppDispatch } from '../../store'
import { loginUser } from '../../store/slices/authSlice'

export const LoginScreen: React.FC = () => {
  const navigation = useNavigation()
  const dispatch = useAppDispatch()
  const { display } = useAppSelector((state) => state.settings)
  const { isLoading } = useAppSelector((state) => state.auth)
  
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  
  const isDark = display.theme === 'dark'
  
  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert('Error', 'Please fill in all fields')
      return
    }
    
    try {
      await dispatch(loginUser({ email, password })).unwrap()
      // Navigation will be handled by the auth state change
    } catch (error: any) {
      Alert.alert('Login Failed', error.message || 'Please check your credentials')
    }
  }
  
  return (
    <View style={[
      styles.container,
      { backgroundColor: isDark ? '#111827' : '#ffffff' }
    ]}>
      <View style={styles.content}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={[
            styles.title,
            { color: isDark ? '#ffffff' : '#1f2937' }
          ]}>
            Welcome Back
          </Text>
          <Text style={[
            styles.subtitle,
            { color: isDark ? '#d1d5db' : '#6b7280' }
          ]}>
            Sign in to continue learning Turkish
          </Text>
        </View>
        
        {/* Form */}
        <View style={styles.form}>
          <View style={styles.inputGroup}>
            <Text style={[
              styles.label,
              { color: isDark ? '#d1d5db' : '#374151' }
            ]}>
              Email
            </Text>
            <TextInput
              style={[
                styles.input,
                { 
                  backgroundColor: isDark ? '#374151' : '#f9fafb',
                  color: isDark ? '#ffffff' : '#1f2937',
                  borderColor: isDark ? '#4b5563' : '#d1d5db'
                }
              ]}
              value={email}
              onChangeText={setEmail}
              placeholder="Enter your email"
              placeholderTextColor={isDark ? '#9ca3af' : '#6b7280'}
              keyboardType="email-address"
              autoCapitalize="none"
              autoCorrect={false}
            />
          </View>
          
          <View style={styles.inputGroup}>
            <Text style={[
              styles.label,
              { color: isDark ? '#d1d5db' : '#374151' }
            ]}>
              Password
            </Text>
            <TextInput
              style={[
                styles.input,
                { 
                  backgroundColor: isDark ? '#374151' : '#f9fafb',
                  color: isDark ? '#ffffff' : '#1f2937',
                  borderColor: isDark ? '#4b5563' : '#d1d5db'
                }
              ]}
              value={password}
              onChangeText={setPassword}
              placeholder="Enter your password"
              placeholderTextColor={isDark ? '#9ca3af' : '#6b7280'}
              secureTextEntry
            />
          </View>
          
          <TouchableOpacity 
            style={styles.forgotPassword}
            onPress={() => navigation.navigate('ForgotPassword' as never)}
          >
            <Text style={styles.forgotPasswordText}>Forgot Password?</Text>
          </TouchableOpacity>
        </View>
        
        {/* Login Button */}
        <TouchableOpacity 
          style={[
            styles.loginButton,
            { opacity: isLoading ? 0.7 : 1 }
          ]}
          onPress={handleLogin}
          disabled={isLoading}
        >
          <Text style={styles.loginButtonText}>
            {isLoading ? 'Signing In...' : 'Sign In'}
          </Text>
        </TouchableOpacity>
        
        {/* Sign Up Link */}
        <View style={styles.signUpContainer}>
          <Text style={[
            styles.signUpText,
            { color: isDark ? '#d1d5db' : '#6b7280' }
          ]}>
            Don't have an account?{' '}
          </Text>
          <TouchableOpacity onPress={() => navigation.navigate('Register' as never)}>
            <Text style={styles.signUpLink}>Sign Up</Text>
          </TouchableOpacity>
        </View>
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
  },
  header: {
    marginBottom: 32,
    alignItems: 'center',
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    textAlign: 'center',
  },
  form: {
    marginBottom: 32,
  },
  inputGroup: {
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    fontWeight: '500',
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
  },
  forgotPassword: {
    alignItems: 'flex-end',
    marginTop: 8,
  },
  forgotPasswordText: {
    color: '#1e40af',
    fontSize: 14,
    fontWeight: '500',
  },
  loginButton: {
    backgroundColor: '#1e40af',
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
    marginBottom: 24,
  },
  loginButtonText: {
    color: '#ffffff',
    fontSize: 18,
    fontWeight: '600',
  },
  signUpContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  signUpText: {
    fontSize: 16,
  },
  signUpLink: {
    color: '#1e40af',
    fontSize: 16,
    fontWeight: '600',
  },
})
