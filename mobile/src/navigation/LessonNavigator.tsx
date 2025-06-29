import React from 'react'
import { createStackNavigator } from '@react-navigation/stack'
import { useAppSelector } from '../store'
import { LessonStackParamList } from './AppNavigator'

// Import lesson screens (will be created later)
import { LessonOverviewScreen } from '../screens/lesson/LessonOverviewScreen'
import { LessonContentScreen } from '../screens/lesson/LessonContentScreen'
import { ExerciseScreen } from '../screens/lesson/ExerciseScreen'
import { ReviewScreen } from '../screens/lesson/ReviewScreen'
import { ResultsScreen } from '../screens/lesson/ResultsScreen'

const LessonStack = createStackNavigator<LessonStackParamList>()

export const LessonNavigator: React.FC = () => {
  const { settings } = useAppSelector((state) => state.settings)
  const { currentLesson } = useAppSelector((state) => state.lessons)

  return (
    <LessonStack.Navigator
      screenOptions={{
        headerStyle: {
          backgroundColor: settings.display.theme === 'dark' ? '#1f2937' : '#1e40af',
          elevation: 0,
          shadowOpacity: 0,
        },
        headerTitleStyle: {
          color: '#ffffff',
          fontSize: settings.display.fontSize === 'large' ? 20 : 18,
          fontWeight: '700',
        },
        headerTintColor: '#ffffff',
        gestureEnabled: true,
        cardStyleInterpolator: ({ current, layouts }) => {
          return {
            cardStyle: {
              transform: [
                {
                  translateY: current.progress.interpolate({
                    inputRange: [0, 1],
                    outputRange: [layouts.screen.height, 0],
                  }),
                },
              ],
              opacity: current.progress.interpolate({
                inputRange: [0, 0.5, 1],
                outputRange: [0, 0.5, 1],
              }),
            },
          }
        },
      }}
      initialRouteName="LessonOverview"
    >
      <LessonStack.Screen 
        name="LessonOverview" 
        component={LessonOverviewScreen}
        options={({ route }) => ({
          title: currentLesson?.title || 'Lesson',
          headerRight: () => (
            <div style={{ marginRight: 16, display: 'flex', alignItems: 'center' }}>
              {/* Lesson progress indicator */}
              <div
                style={{
                  width: 40,
                  height: 6,
                  backgroundColor: 'rgba(255, 255, 255, 0.3)',
                  borderRadius: 3,
                  marginRight: 8,
                }}
              >
                <div
                  style={{
                    width: `${currentLesson?.progress || 0}%`,
                    height: '100%',
                    backgroundColor: '#10b981',
                    borderRadius: 3,
                  }}
                />
              </div>
              <span style={{ color: '#ffffff', fontSize: 12, fontWeight: '600' }}>
                {Math.round(currentLesson?.progress || 0)}%
              </span>
            </div>
          ),
        })}
      />
      
      <LessonStack.Screen 
        name="LessonContent" 
        component={LessonContentScreen}
        options={{
          title: 'Learn',
          headerBackTitle: 'Overview',
        }}
      />
      
      <LessonStack.Screen 
        name="Exercise" 
        component={ExerciseScreen}
        options={({ route }) => ({
          title: 'Exercise',
          headerBackTitle: 'Content',
          headerLeft: () => (
            <button
              style={{
                marginLeft: 16,
                backgroundColor: 'transparent',
                border: 'none',
                color: '#ffffff',
                fontSize: 16,
                cursor: 'pointer',
              }}
              onClick={() => {
                // Show exit confirmation dialog
                if (window.confirm('Are you sure you want to exit? Your progress will be saved.')) {
                  // Navigate back to lesson overview
                }
              }}
            >
              ✕
            </button>
          ),
          headerRight: () => (
            <div style={{ marginRight: 16, display: 'flex', alignItems: 'center' }}>
              {/* Exercise timer */}
              <span style={{ color: '#ffffff', fontSize: 14, fontWeight: '600' }}>
                ⏱️ 00:45
              </span>
            </div>
          ),
        })}
      />
      
      <LessonStack.Screen 
        name="Review" 
        component={ReviewScreen}
        options={{
          title: 'Review',
          headerBackTitle: 'Exercise',
          gestureEnabled: false, // Prevent accidental swipe back during review
        }}
      />
      
      <LessonStack.Screen 
        name="Results" 
        component={ResultsScreen}
        options={{
          title: 'Results',
          headerLeft: () => null, // Remove back button
          gestureEnabled: false, // Prevent swipe back
          headerRight: () => (
            <button
              style={{
                marginRight: 16,
                backgroundColor: 'rgba(255, 255, 255, 0.2)',
                border: 'none',
                color: '#ffffff',
                fontSize: 14,
                fontWeight: '600',
                padding: '8px 16px',
                borderRadius: 20,
                cursor: 'pointer',
              }}
              onClick={() => {
                // Navigate to home or lessons
              }}
            >
              Done
            </button>
          ),
        }}
      />
    </LessonStack.Navigator>
  )
}

// Custom header component for lesson screens
export const LessonHeader = ({ 
  title, 
  progress, 
  showTimer = false, 
  timeElapsed = 0,
  onExit 
}: {
  title: string
  progress?: number
  showTimer?: boolean
  timeElapsed?: number
  onExit?: () => void
}) => {
  const { settings } = useAppSelector((state) => state.settings)
  
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
  }

  return (
    <div
      style={{
        backgroundColor: settings.display.theme === 'dark' ? '#1f2937' : '#1e40af',
        padding: '12px 16px',
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
      }}
    >
      {/* Left side - Exit button */}
      {onExit && (
        <button
          onClick={onExit}
          style={{
            backgroundColor: 'transparent',
            border: 'none',
            color: '#ffffff',
            fontSize: 18,
            cursor: 'pointer',
            padding: 8,
          }}
        >
          ✕
        </button>
      )}
      
      {/* Center - Title and progress */}
      <div style={{ flex: 1, alignItems: 'center' }}>
        <h2 style={{ color: '#ffffff', fontSize: 18, fontWeight: '700', margin: 0 }}>
          {title}
        </h2>
        {progress !== undefined && (
          <div
            style={{
              width: 120,
              height: 4,
              backgroundColor: 'rgba(255, 255, 255, 0.3)',
              borderRadius: 2,
              marginTop: 4,
            }}
          >
            <div
              style={{
                width: `${progress}%`,
                height: '100%',
                backgroundColor: '#10b981',
                borderRadius: 2,
              }}
            />
          </div>
        )}
      </div>
      
      {/* Right side - Timer */}
      {showTimer && (
        <div style={{ alignItems: 'center' }}>
          <span style={{ color: '#ffffff', fontSize: 14, fontWeight: '600' }}>
            ⏱️ {formatTime(timeElapsed)}
          </span>
        </div>
      )}
    </div>
  )
}
