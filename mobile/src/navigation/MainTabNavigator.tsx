import React from 'react'
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs'
import { useAppSelector } from '../store'
import { MainTabParamList } from './AppNavigator'

// Import screens (will be created later)
import { HomeScreen } from '../screens/HomeScreen'
import { LessonsScreen } from '../screens/LessonsScreen'
import { PracticeScreen } from '../screens/PracticeScreen'
import { ProgressScreen } from '../screens/ProgressScreen'
import { ProfileScreen } from '../screens/ProfileScreen'

const Tab = createBottomTabNavigator<MainTabParamList>()

// Tab bar icon component
const TabIcon = ({ name, focused }: { name: string; focused: boolean }) => {
  const iconMap: Record<string, string> = {
    Home: focused ? '🏠' : '🏡',
    Lessons: focused ? '📚' : '📖',
    Practice: focused ? '🎯' : '⭕',
    Progress: focused ? '📊' : '📈',
    Profile: focused ? '👤' : '👥',
  }
  
  return (
    <span style={{ fontSize: 24 }}>
      {iconMap[name] || '❓'}
    </span>
  )
}

export const MainTabNavigator: React.FC = () => {
  const { settings } = useAppSelector((state) => state.settings)
  const { profile } = useAppSelector((state) => state.user)
  const { isOnline } = useAppSelector((state) => state.offline)

  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused }) => (
          <TabIcon name={route.name} focused={focused} />
        ),
        tabBarActiveTintColor: '#1e40af',
        tabBarInactiveTintColor: '#6b7280',
        tabBarStyle: {
          backgroundColor: settings.display.theme === 'dark' ? '#1f2937' : '#ffffff',
          borderTopColor: settings.display.theme === 'dark' ? '#374151' : '#e5e7eb',
          height: 60,
          paddingBottom: 8,
          paddingTop: 8,
        },
        tabBarLabelStyle: {
          fontSize: settings.display.fontSize === 'large' ? 14 : 12,
          fontWeight: '600',
        },
        headerStyle: {
          backgroundColor: settings.display.theme === 'dark' ? '#1f2937' : '#ffffff',
          elevation: 0,
          shadowOpacity: 0,
          borderBottomWidth: 1,
          borderBottomColor: settings.display.theme === 'dark' ? '#374151' : '#e5e7eb',
        },
        headerTitleStyle: {
          color: settings.display.theme === 'dark' ? '#ffffff' : '#1f2937',
          fontSize: settings.display.fontSize === 'large' ? 20 : 18,
          fontWeight: '700',
        },
        headerTintColor: settings.display.theme === 'dark' ? '#ffffff' : '#1f2937',
      })}
      initialRouteName="Home"
    >
      <Tab.Screen 
        name="Home" 
        component={HomeScreen}
        options={{
          title: 'Home',
          headerTitle: `Welcome back, ${profile?.name?.split(' ')[0] || 'Learner'}!`,
          headerRight: () => (
            <div style={{ marginRight: 16, display: 'flex', alignItems: 'center' }}>
              {/* Online/Offline indicator */}
              <div
                style={{
                  width: 8,
                  height: 8,
                  borderRadius: 4,
                  backgroundColor: isOnline ? '#10b981' : '#ef4444',
                  marginRight: 8,
                }}
              />
              {/* Streak indicator */}
              <span style={{ fontSize: 16, marginRight: 8 }}>
                🔥 {profile?.streak || 0}
              </span>
              {/* XP indicator */}
              <span style={{ fontSize: 14, color: '#6b7280' }}>
                {profile?.totalXP || 0} XP
              </span>
            </div>
          ),
        }}
      />
      
      <Tab.Screen 
        name="Lessons" 
        component={LessonsScreen}
        options={{
          title: 'Lessons',
          headerTitle: 'Turkish Lessons',
          tabBarBadge: undefined, // Could show number of new lessons
        }}
      />
      
      <Tab.Screen 
        name="Practice" 
        component={PracticeScreen}
        options={{
          title: 'Practice',
          headerTitle: 'Practice & Review',
        }}
      />
      
      <Tab.Screen 
        name="Progress" 
        component={ProgressScreen}
        options={{
          title: 'Progress',
          headerTitle: 'Your Progress',
        }}
      />
      
      <Tab.Screen 
        name="Profile" 
        component={ProfileScreen}
        options={{
          title: 'Profile',
          headerTitle: 'Profile & Settings',
        }}
      />
    </Tab.Navigator>
  )
}

// Custom tab bar component (if needed for more customization)
export const CustomTabBar = ({ state, descriptors, navigation }: any) => {
  const { settings } = useAppSelector((state) => state.settings)
  
  return (
    <div
      style={{
        flexDirection: 'row',
        backgroundColor: settings.display.theme === 'dark' ? '#1f2937' : '#ffffff',
        borderTopWidth: 1,
        borderTopColor: settings.display.theme === 'dark' ? '#374151' : '#e5e7eb',
        height: 60,
        paddingBottom: 8,
        paddingTop: 8,
      }}
    >
      {state.routes.map((route: any, index: number) => {
        const { options } = descriptors[route.key]
        const label = options.tabBarLabel !== undefined 
          ? options.tabBarLabel 
          : options.title !== undefined 
          ? options.title 
          : route.name

        const isFocused = state.index === index

        const onPress = () => {
          const event = navigation.emit({
            type: 'tabPress',
            target: route.key,
            canPreventDefault: true,
          })

          if (!isFocused && !event.defaultPrevented) {
            navigation.navigate(route.name)
          }
        }

        return (
          <button
            key={route.key}
            onClick={onPress}
            style={{
              flex: 1,
              alignItems: 'center',
              justifyContent: 'center',
              backgroundColor: 'transparent',
              border: 'none',
              cursor: 'pointer',
              opacity: isFocused ? 1 : 0.6,
            }}
          >
            <TabIcon name={route.name} focused={isFocused} />
            <span
              style={{
                fontSize: settings.display.fontSize === 'large' ? 14 : 12,
                color: isFocused ? '#1e40af' : '#6b7280',
                fontWeight: '600',
                marginTop: 4,
              }}
            >
              {label}
            </span>
          </button>
        )
      })}
    </div>
  )
}
