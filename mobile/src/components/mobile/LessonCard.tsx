import React, { useState } from 'react'
import { 
  View, 
  Text, 
  TouchableOpacity, 
  StyleSheet, 
  Dimensions, 
  Animated,
  PanGestureHandler,
  State,
  GestureHandlerRootView
} from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import { LinearGradient } from 'expo-linear-gradient'
import { useAppSelector } from '../../store'

const { width: screenWidth } = Dimensions.get('window')
const CARD_WIDTH = screenWidth - 32 // 16px margin on each side

interface LessonCardProps {
  lesson: {
    id: string
    title: string
    description: string
    difficulty: 'beginner' | 'intermediate' | 'advanced'
    duration: number // in minutes
    progress: number // 0-100
    isCompleted: boolean
    isLocked: boolean
    lessonNumber: number
    topics: string[]
    audioCount: number
    exerciseCount: number
  }
  onPress: () => void
  onLongPress?: () => void
  onSwipeLeft?: () => void
  onSwipeRight?: () => void
  style?: any
}

export const LessonCard: React.FC<LessonCardProps> = ({
  lesson,
  onPress,
  onLongPress,
  onSwipeLeft,
  onSwipeRight,
  style,
}) => {
  const { display } = useAppSelector((state) => state.settings)
  const isDark = display.theme === 'dark'

  const [isPressed, setIsPressed] = useState(false)
  const translateX = new Animated.Value(0)
  const scale = new Animated.Value(1)

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'beginner': return ['#10b981', '#34d399']
      case 'intermediate': return ['#f59e0b', '#fbbf24']
      case 'advanced': return ['#ef4444', '#f87171']
      default: return ['#6b7280', '#9ca3af']
    }
  }

  const getDifficultyIcon = (difficulty: string) => {
    switch (difficulty) {
      case 'beginner': return 'leaf'
      case 'intermediate': return 'flash'
      case 'advanced': return 'flame'
      default: return 'help-circle'
    }
  }

  const handlePressIn = () => {
    setIsPressed(true)
    Animated.spring(scale, {
      toValue: 0.98,
      useNativeDriver: true,
    }).start()
  }

  const handlePressOut = () => {
    setIsPressed(false)
    Animated.spring(scale, {
      toValue: 1,
      useNativeDriver: true,
    }).start()
  }

  const handleGestureEvent = Animated.event(
    [{ nativeEvent: { translationX: translateX } }],
    { useNativeDriver: true }
  )

  const handleGestureStateChange = (event: any) => {
    if (event.nativeEvent.state === State.END) {
      const { translationX, velocityX } = event.nativeEvent
      
      // Determine swipe direction and trigger appropriate action
      if (Math.abs(translationX) > 100 || Math.abs(velocityX) > 500) {
        if (translationX > 0 && onSwipeRight) {
          onSwipeRight()
        } else if (translationX < 0 && onSwipeLeft) {
          onSwipeLeft()
        }
      }
      
      // Reset position
      Animated.spring(translateX, {
        toValue: 0,
        useNativeDriver: true,
      }).start()
    }
  }

  const formatDuration = (minutes: number): string => {
    if (minutes < 60) return `${minutes}m`
    const hours = Math.floor(minutes / 60)
    const remainingMinutes = minutes % 60
    return remainingMinutes > 0 ? `${hours}h ${remainingMinutes}m` : `${hours}h`
  }

  const cardBackgroundColor = isDark ? '#1f2937' : '#ffffff'
  const textColor = isDark ? '#ffffff' : '#1f2937'
  const subtextColor = isDark ? '#d1d5db' : '#6b7280'
  const difficultyColors = getDifficultyColor(lesson.difficulty)

  return (
    <GestureHandlerRootView>
      <PanGestureHandler
        onGestureEvent={handleGestureEvent}
        onHandlerStateChange={handleGestureStateChange}
        enabled={!lesson.isLocked}
      >
        <Animated.View
          style={[
            styles.container,
            {
              transform: [{ translateX }, { scale }],
              backgroundColor: cardBackgroundColor,
              opacity: lesson.isLocked ? 0.6 : 1,
            },
            style,
          ]}
        >
          <TouchableOpacity
            style={styles.touchable}
            onPress={lesson.isLocked ? undefined : onPress}
            onLongPress={lesson.isLocked ? undefined : onLongPress}
            onPressIn={handlePressIn}
            onPressOut={handlePressOut}
            activeOpacity={0.9}
            disabled={lesson.isLocked}
          >
            {/* Header */}
            <View style={styles.header}>
              <View style={styles.lessonNumber}>
                <Text style={[styles.lessonNumberText, { color: textColor }]}>
                  {lesson.lessonNumber}
                </Text>
              </View>
              
              <View style={styles.headerRight}>
                {lesson.isCompleted && (
                  <View style={[styles.completedBadge, { backgroundColor: '#10b981' }]}>
                    <Ionicons name="checkmark" size={16} color="#ffffff" />
                  </View>
                )}
                
                {lesson.isLocked && (
                  <View style={[styles.lockedBadge, { backgroundColor: '#6b7280' }]}>
                    <Ionicons name="lock-closed" size={16} color="#ffffff" />
                  </View>
                )}
              </View>
            </View>

            {/* Content */}
            <View style={styles.content}>
              <Text style={[styles.title, { color: textColor }]} numberOfLines={2}>
                {lesson.title}
              </Text>
              
              <Text style={[styles.description, { color: subtextColor }]} numberOfLines={3}>
                {lesson.description}
              </Text>

              {/* Topics */}
              <View style={styles.topicsContainer}>
                {lesson.topics.slice(0, 3).map((topic, index) => (
                  <View 
                    key={index} 
                    style={[
                      styles.topicTag,
                      { backgroundColor: isDark ? '#374151' : '#f3f4f6' }
                    ]}
                  >
                    <Text style={[styles.topicText, { color: subtextColor }]}>
                      {topic}
                    </Text>
                  </View>
                ))}
                {lesson.topics.length > 3 && (
                  <Text style={[styles.moreTopics, { color: subtextColor }]}>
                    +{lesson.topics.length - 3} more
                  </Text>
                )}
              </View>
            </View>

            {/* Progress Bar */}
            {lesson.progress > 0 && !lesson.isCompleted && (
              <View style={styles.progressContainer}>
                <View style={[styles.progressBar, { backgroundColor: isDark ? '#374151' : '#e5e7eb' }]}>
                  <LinearGradient
                    colors={difficultyColors}
                    style={[styles.progressFill, { width: `${lesson.progress}%` }]}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 0 }}
                  />
                </View>
                <Text style={[styles.progressText, { color: subtextColor }]}>
                  {lesson.progress}%
                </Text>
              </View>
            )}

            {/* Footer */}
            <View style={styles.footer}>
              <View style={styles.footerLeft}>
                <LinearGradient
                  colors={difficultyColors}
                  style={styles.difficultyBadge}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                >
                  <Ionicons 
                    name={getDifficultyIcon(lesson.difficulty)} 
                    size={14} 
                    color="#ffffff" 
                  />
                  <Text style={styles.difficultyText}>
                    {lesson.difficulty}
                  </Text>
                </LinearGradient>

                <View style={styles.statsContainer}>
                  <View style={styles.stat}>
                    <Ionicons name="time" size={14} color={subtextColor} />
                    <Text style={[styles.statText, { color: subtextColor }]}>
                      {formatDuration(lesson.duration)}
                    </Text>
                  </View>
                  
                  <View style={styles.stat}>
                    <Ionicons name="volume-high" size={14} color={subtextColor} />
                    <Text style={[styles.statText, { color: subtextColor }]}>
                      {lesson.audioCount}
                    </Text>
                  </View>
                  
                  <View style={styles.stat}>
                    <Ionicons name="create" size={14} color={subtextColor} />
                    <Text style={[styles.statText, { color: subtextColor }]}>
                      {lesson.exerciseCount}
                    </Text>
                  </View>
                </View>
              </View>

              <TouchableOpacity 
                style={[
                  styles.actionButton,
                  { backgroundColor: lesson.isLocked ? '#6b7280' : '#3b82f6' }
                ]}
                onPress={lesson.isLocked ? undefined : onPress}
                disabled={lesson.isLocked}
              >
                <Ionicons 
                  name={lesson.isCompleted ? "refresh" : lesson.progress > 0 ? "play" : "arrow-forward"} 
                  size={20} 
                  color="#ffffff" 
                />
              </TouchableOpacity>
            </View>
          </TouchableOpacity>
        </Animated.View>
      </PanGestureHandler>
    </GestureHandlerRootView>
  )
}

const styles = StyleSheet.create({
  container: {
    width: CARD_WIDTH,
    borderRadius: 16,
    marginHorizontal: 16,
    marginVertical: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  touchable: {
    padding: 20,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  lessonNumber: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(59, 130, 246, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  lessonNumberText: {
    fontSize: 18,
    fontWeight: '700',
  },
  headerRight: {
    flexDirection: 'row',
    gap: 8,
  },
  completedBadge: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  lockedBadge: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  content: {
    marginBottom: 16,
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
    marginBottom: 8,
    lineHeight: 28,
  },
  description: {
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 12,
  },
  topicsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'center',
    gap: 6,
  },
  topicTag: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  topicText: {
    fontSize: 12,
    fontWeight: '500',
  },
  moreTopics: {
    fontSize: 12,
    fontStyle: 'italic',
  },
  progressContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    gap: 12,
  },
  progressBar: {
    flex: 1,
    height: 6,
    borderRadius: 3,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 3,
  },
  progressText: {
    fontSize: 12,
    fontWeight: '600',
    minWidth: 35,
    textAlign: 'right',
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  footerLeft: {
    flex: 1,
    gap: 12,
  },
  difficultyBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 16,
    gap: 4,
    alignSelf: 'flex-start',
  },
  difficultyText: {
    color: '#ffffff',
    fontSize: 12,
    fontWeight: '600',
    textTransform: 'capitalize',
  },
  statsContainer: {
    flexDirection: 'row',
    gap: 16,
  },
  stat: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  statText: {
    fontSize: 12,
    fontWeight: '500',
  },
  actionButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 16,
  },
})
