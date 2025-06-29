import React from 'react'
import { createStackNavigator } from '@react-navigation/stack'
import { AuthStackParamList } from './AppNavigator'

// Import auth screens (will be created later)
import { WelcomeScreen } from '../screens/auth/WelcomeScreen'
import { LoginScreen } from '../screens/auth/LoginScreen'
import { RegisterScreen } from '../screens/auth/RegisterScreen'
import { ForgotPasswordScreen } from '../screens/auth/ForgotPasswordScreen'
import { ResetPasswordScreen } from '../screens/auth/ResetPasswordScreen'

const AuthStack = createStackNavigator<AuthStackParamList>()

export const AuthNavigator: React.FC = () => {
  return (
    <AuthStack.Navigator
      screenOptions={{
        headerShown: false,
        gestureEnabled: true,
        cardStyleInterpolator: ({ current, layouts }) => {
          return {
            cardStyle: {
              transform: [
                {
                  translateX: current.progress.interpolate({
                    inputRange: [0, 1],
                    outputRange: [layouts.screen.width, 0],
                  }),
                },
              ],
            },
          }
        },
      }}
      initialRouteName="Welcome"
    >
      <AuthStack.Screen 
        name="Welcome" 
        component={WelcomeScreen}
        options={{
          gestureEnabled: false, // Disable swipe back on welcome screen
        }}
      />
      
      <AuthStack.Screen 
        name="Login" 
        component={LoginScreen}
        options={{
          headerShown: true,
          title: 'Sign In',
          headerStyle: {
            backgroundColor: '#1e40af',
            elevation: 0,
            shadowOpacity: 0,
          },
          headerTitleStyle: {
            color: '#ffffff',
            fontSize: 18,
            fontWeight: '700',
          },
          headerTintColor: '#ffffff',
        }}
      />
      
      <AuthStack.Screen 
        name="Register" 
        component={RegisterScreen}
        options={{
          headerShown: true,
          title: 'Create Account',
          headerStyle: {
            backgroundColor: '#1e40af',
            elevation: 0,
            shadowOpacity: 0,
          },
          headerTitleStyle: {
            color: '#ffffff',
            fontSize: 18,
            fontWeight: '700',
          },
          headerTintColor: '#ffffff',
        }}
      />
      
      <AuthStack.Screen 
        name="ForgotPassword" 
        component={ForgotPasswordScreen}
        options={{
          headerShown: true,
          title: 'Reset Password',
          headerStyle: {
            backgroundColor: '#1e40af',
            elevation: 0,
            shadowOpacity: 0,
          },
          headerTitleStyle: {
            color: '#ffffff',
            fontSize: 18,
            fontWeight: '700',
          },
          headerTintColor: '#ffffff',
        }}
      />
      
      <AuthStack.Screen 
        name="ResetPassword" 
        component={ResetPasswordScreen}
        options={{
          headerShown: true,
          title: 'New Password',
          headerStyle: {
            backgroundColor: '#1e40af',
            elevation: 0,
            shadowOpacity: 0,
          },
          headerTitleStyle: {
            color: '#ffffff',
            fontSize: 18,
            fontWeight: '700',
          },
          headerTintColor: '#ffffff',
          headerLeft: () => null, // Disable back button on reset password
        }}
      />
    </AuthStack.Navigator>
  )
}
