import React from 'react'
import { NavigationContainer } from '@react-navigation/native'
import { createStackNavigator } from '@react-navigation/stack'
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs'
import { createDrawerNavigator } from '@react-navigation/drawer'
import { useAppSelector } from '../store'

// Import screens (will be created later)
import { AuthNavigator } from './AuthNavigator'
import { MainTabNavigator } from './MainTabNavigator'
import { LessonNavigator } from './LessonNavigator'
import { LoadingScreen } from '../screens/LoadingScreen'

// Navigation types
export type RootStackParamList = {
  Loading: undefined
  Auth: undefined
  Main: undefined
  Lesson: { lessonId: string; fromScreen?: string }
  Settings: undefined
  Profile: undefined
  Achievements: undefined
  Statistics: undefined
  Offline: undefined
}

export type AuthStackParamList = {
  Welcome: undefined
  Login: undefined
  Register: undefined
  ForgotPassword: undefined
  ResetPassword: { token: string }
}

export type MainTabParamList = {
  Home: undefined
  Lessons: undefined
  Practice: undefined
  Progress: undefined
  Profile: undefined
}

export type LessonStackParamList = {
  LessonOverview: { lessonId: string }
  LessonContent: { lessonId: string; sectionId?: string }
  Exercise: { lessonId: string; exerciseId: string }
  Review: { lessonId: string }
  Results: { lessonId: string; score: number; timeSpent: number }
}

const RootStack = createStackNavigator<RootStackParamList>()
const Drawer = createDrawerNavigator()

// Custom drawer content component
const DrawerContent = ({ navigation }: any) => {
  const { user } = useAppSelector((state) => state.auth)
  const { profile } = useAppSelector((state) => state.user)
  
  return (
    <div style={{ flex: 1, padding: 20 }}>
      {/* User info section */}
      <div style={{ marginBottom: 30, alignItems: 'center' }}>
        {profile?.avatar && (
          <img 
            src={profile.avatar} 
            alt="Profile" 
            style={{ width: 80, height: 80, borderRadius: 40, marginBottom: 10 }}
          />
        )}
        <h3>{user?.name || 'Guest'}</h3>
        <p>Level: {profile?.level || 'Beginner'}</p>
        <p>Streak: {profile?.streak || 0} days</p>
      </div>
      
      {/* Navigation items */}
      <button onClick={() => navigation.navigate('Main')}>
        🏠 Home
      </button>
      <button onClick={() => navigation.navigate('Settings')}>
        ⚙️ Settings
      </button>
      <button onClick={() => navigation.navigate('Achievements')}>
        🏆 Achievements
      </button>
      <button onClick={() => navigation.navigate('Statistics')}>
        📊 Statistics
      </button>
      <button onClick={() => navigation.navigate('Offline')}>
        📱 Offline Content
      </button>
    </div>
  )
}

// Main drawer navigator
const DrawerNavigator = () => {
  return (
    <Drawer.Navigator
      drawerContent={(props) => <DrawerContent {...props} />}
      screenOptions={{
        headerShown: false,
        drawerStyle: {
          backgroundColor: '#f8f9fa',
          width: 280,
        },
      }}
    >
      <Drawer.Screen name="MainTabs" component={MainTabNavigator} />
    </Drawer.Navigator>
  )
}

// Root navigator component
export const AppNavigator: React.FC = () => {
  const { isAuthenticated, isLoading: authLoading } = useAppSelector((state) => state.auth)
  const { isLoading: userLoading } = useAppSelector((state) => state.user)

  // Show loading screen while checking authentication
  if (authLoading || userLoading) {
    return (
      <NavigationContainer>
        <RootStack.Navigator screenOptions={{ headerShown: false }}>
          <RootStack.Screen name="Loading" component={LoadingScreen} />
        </RootStack.Navigator>
      </NavigationContainer>
    )
  }

  return (
    <NavigationContainer>
      <RootStack.Navigator 
        screenOptions={{ headerShown: false }}
        initialRouteName={isAuthenticated ? 'Main' : 'Auth'}
      >
        {!isAuthenticated ? (
          // Auth stack for non-authenticated users
          <RootStack.Screen name="Auth" component={AuthNavigator} />
        ) : (
          // Main app stack for authenticated users
          <>
            <RootStack.Screen name="Main" component={DrawerNavigator} />
            <RootStack.Screen 
              name="Lesson" 
              component={LessonNavigator}
              options={{
                presentation: 'modal',
                gestureEnabled: true,
              }}
            />
          </>
        )}
      </RootStack.Navigator>
    </NavigationContainer>
  )
}

// Navigation utilities
export const navigationRef = React.createRef<any>()

export const navigate = (name: string, params?: any) => {
  navigationRef.current?.navigate(name, params)
}

export const goBack = () => {
  navigationRef.current?.goBack()
}

export const reset = (routeName: string) => {
  navigationRef.current?.reset({
    index: 0,
    routes: [{ name: routeName }],
  })
}

// Hook for navigation
export const useNavigation = () => {
  return {
    navigate,
    goBack,
    reset,
  }
}
