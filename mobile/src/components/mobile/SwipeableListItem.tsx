import React, { useRef, useState } from 'react'
import {
  View,
  Text,
  TouchableOpacity,
  Animated,
  StyleSheet,
  Dimensions,
  Vibration,
  Platform,
} from 'react-native'
import { PanGestureHandler, State } from 'react-native-gesture-handler'
import { Ionicons } from '@expo/vector-icons'
import { useAppSelector } from '../../store'

const { width: screenWidth } = Dimensions.get('window')
const SWIPE_THRESHOLD = 80
const MAX_SWIPE_DISTANCE = 120

interface SwipeAction {
  id: string
  icon: string
  label: string
  color: string
  backgroundColor: string
  onPress: () => void
}

interface SwipeableListItemProps {
  children: React.ReactNode
  leftActions?: SwipeAction[]
  rightActions?: SwipeAction[]
  onPress?: () => void
  onLongPress?: () => void
  disabled?: boolean
  style?: any
  contentStyle?: any
  swipeEnabled?: boolean
  hapticFeedback?: boolean
}

export const SwipeableListItem: React.FC<SwipeableListItemProps> = ({
  children,
  leftActions = [],
  rightActions = [],
  onPress,
  onLongPress,
  disabled = false,
  style,
  contentStyle,
  swipeEnabled = true,
  hapticFeedback = true,
}) => {
  const { display } = useAppSelector((state) => state.settings)
  const isDark = display.theme === 'dark'

  const translateX = useRef(new Animated.Value(0)).current
  const [isSwipeActive, setIsSwipeActive] = useState(false)
  const [currentSwipeDirection, setCurrentSwipeDirection] = useState<'left' | 'right' | null>(null)

  const backgroundColor = isDark ? '#1f2937' : '#ffffff'
  const borderColor = isDark ? '#374151' : '#e5e7eb'

  const resetPosition = () => {
    Animated.spring(translateX, {
      toValue: 0,
      useNativeDriver: true,
      tension: 300,
      friction: 25,
    }).start(() => {
      setCurrentSwipeDirection(null)
    })
  }

  const snapToAction = (direction: 'left' | 'right') => {
    const actions = direction === 'left' ? leftActions : rightActions
    const actionWidth = MAX_SWIPE_DISTANCE / Math.max(actions.length, 1)
    const snapDistance = direction === 'left' ? actionWidth : -actionWidth

    Animated.spring(translateX, {
      toValue: snapDistance,
      useNativeDriver: true,
      tension: 300,
      friction: 25,
    }).start()

    setCurrentSwipeDirection(direction)
  }

  const handleGestureEvent = Animated.event(
    [{ nativeEvent: { translationX: translateX } }],
    { 
      useNativeDriver: true,
      listener: (event: any) => {
        const { translationX } = event.nativeEvent
        
        // Limit swipe distance
        const maxLeft = leftActions.length > 0 ? MAX_SWIPE_DISTANCE : 0
        const maxRight = rightActions.length > 0 ? -MAX_SWIPE_DISTANCE : 0
        
        if (translationX > maxLeft) {
          translateX.setValue(maxLeft)
        } else if (translationX < maxRight) {
          translateX.setValue(maxRight)
        }

        // Haptic feedback at threshold
        if (hapticFeedback && Math.abs(translationX) > SWIPE_THRESHOLD && !isSwipeActive) {
          setIsSwipeActive(true)
          if (Platform.OS === 'ios') {
            Vibration.vibrate(10)
          }
        } else if (Math.abs(translationX) <= SWIPE_THRESHOLD && isSwipeActive) {
          setIsSwipeActive(false)
        }
      }
    }
  )

  const handleGestureStateChange = (event: any) => {
    const { state, translationX, velocityX } = event.nativeEvent

    if (state === State.END || state === State.CANCELLED) {
      setIsSwipeActive(false)
      
      const absTranslationX = Math.abs(translationX)
      const absVelocityX = Math.abs(velocityX)

      // Determine if swipe should trigger action or reset
      if (absTranslationX > SWIPE_THRESHOLD || absVelocityX > 500) {
        const direction = translationX > 0 ? 'left' : 'right'
        const actions = direction === 'left' ? leftActions : rightActions
        
        if (actions.length > 0) {
          snapToAction(direction)
        } else {
          resetPosition()
        }
      } else {
        resetPosition()
      }
    }
  }

  const handleActionPress = (action: SwipeAction) => {
    // Haptic feedback
    if (hapticFeedback && Platform.OS === 'ios') {
      Vibration.vibrate(50)
    }

    // Reset position first
    resetPosition()
    
    // Execute action after animation
    setTimeout(() => {
      action.onPress()
    }, 200)
  }

  const renderActions = (actions: SwipeAction[], direction: 'left' | 'right') => {
    if (actions.length === 0) return null

    const actionWidth = MAX_SWIPE_DISTANCE / actions.length
    const isVisible = currentSwipeDirection === direction

    return (
      <View style={[
        styles.actionsContainer,
        direction === 'left' ? styles.leftActions : styles.rightActions,
        { width: MAX_SWIPE_DISTANCE }
      ]}>
        {actions.map((action, index) => (
          <Animated.View
            key={action.id}
            style={[
              styles.actionWrapper,
              { 
                width: actionWidth,
                opacity: isVisible ? 1 : 0.7,
                transform: [{
                  scale: isVisible ? 1 : 0.9
                }]
              }
            ]}
          >
            <TouchableOpacity
              style={[
                styles.action,
                { backgroundColor: action.backgroundColor }
              ]}
              onPress={() => handleActionPress(action)}
              activeOpacity={0.8}
            >
              <Ionicons 
                name={action.icon as any} 
                size={20} 
                color={action.color} 
              />
              <Text style={[
                styles.actionLabel,
                { color: action.color }
              ]}>
                {action.label}
              </Text>
            </TouchableOpacity>
          </Animated.View>
        ))}
      </View>
    )
  }

  return (
    <View style={[styles.container, style]}>
      {/* Left Actions */}
      {renderActions(leftActions, 'left')}
      
      {/* Right Actions */}
      {renderActions(rightActions, 'right')}

      {/* Main Content */}
      <PanGestureHandler
        onGestureEvent={swipeEnabled ? handleGestureEvent : undefined}
        onHandlerStateChange={swipeEnabled ? handleGestureStateChange : undefined}
        enabled={swipeEnabled && !disabled}
        activeOffsetX={[-10, 10]}
        failOffsetY={[-20, 20]}
      >
        <Animated.View
          style={[
            styles.content,
            {
              backgroundColor,
              borderColor,
              transform: [{ translateX }],
            },
            contentStyle,
          ]}
        >
          <TouchableOpacity
            style={styles.contentTouchable}
            onPress={disabled ? undefined : onPress}
            onLongPress={disabled ? undefined : onLongPress}
            activeOpacity={disabled ? 1 : 0.7}
            disabled={disabled}
          >
            {children}
          </TouchableOpacity>
        </Animated.View>
      </PanGestureHandler>

      {/* Swipe Indicator */}
      {isSwipeActive && (
        <View style={[
          styles.swipeIndicator,
          { backgroundColor: isDark ? '#374151' : '#f3f4f6' }
        ]}>
          <Ionicons 
            name="swap-horizontal" 
            size={16} 
            color={isDark ? '#d1d5db' : '#6b7280'} 
          />
        </View>
      )}
    </View>
  )
}

// Utility component for common list item content
interface ListItemContentProps {
  title: string
  subtitle?: string
  description?: string
  leftIcon?: string
  rightIcon?: string
  badge?: string | number
  avatar?: string
  onIconPress?: () => void
  style?: any
}

export const ListItemContent: React.FC<ListItemContentProps> = ({
  title,
  subtitle,
  description,
  leftIcon,
  rightIcon,
  badge,
  avatar,
  onIconPress,
  style,
}) => {
  const { display } = useAppSelector((state) => state.settings)
  const isDark = display.theme === 'dark'

  const textColor = isDark ? '#ffffff' : '#1f2937'
  const subtextColor = isDark ? '#d1d5db' : '#6b7280'

  return (
    <View style={[styles.listItemContent, style]}>
      {/* Left Icon/Avatar */}
      {(leftIcon || avatar) && (
        <TouchableOpacity
          style={[
            styles.leftIconContainer,
            { backgroundColor: isDark ? '#374151' : '#f3f4f6' }
          ]}
          onPress={onIconPress}
          disabled={!onIconPress}
        >
          {leftIcon && (
            <Ionicons name={leftIcon as any} size={24} color={textColor} />
          )}
          {avatar && (
            <Text style={[styles.avatarText, { color: textColor }]}>
              {avatar}
            </Text>
          )}
        </TouchableOpacity>
      )}

      {/* Content */}
      <View style={styles.textContent}>
        <Text style={[styles.title, { color: textColor }]} numberOfLines={1}>
          {title}
        </Text>
        
        {subtitle && (
          <Text style={[styles.subtitle, { color: subtextColor }]} numberOfLines={1}>
            {subtitle}
          </Text>
        )}
        
        {description && (
          <Text style={[styles.description, { color: subtextColor }]} numberOfLines={2}>
            {description}
          </Text>
        )}
      </View>

      {/* Right Content */}
      <View style={styles.rightContent}>
        {badge && (
          <View style={[
            styles.badge,
            { backgroundColor: '#ef4444' }
          ]}>
            <Text style={styles.badgeText}>
              {typeof badge === 'number' && badge > 99 ? '99+' : badge}
            </Text>
          </View>
        )}
        
        {rightIcon && (
          <Ionicons name={rightIcon as any} size={20} color={subtextColor} />
        )}
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    position: 'relative',
    marginVertical: 1,
  },
  actionsContainer: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    flexDirection: 'row',
    alignItems: 'center',
    zIndex: 1,
  },
  leftActions: {
    left: 0,
    justifyContent: 'flex-start',
  },
  rightActions: {
    right: 0,
    justifyContent: 'flex-end',
  },
  actionWrapper: {
    height: '100%',
    justifyContent: 'center',
  },
  action: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 8,
    minHeight: 60,
  },
  actionLabel: {
    fontSize: 12,
    fontWeight: '600',
    marginTop: 4,
    textAlign: 'center',
  },
  content: {
    borderBottomWidth: 1,
    zIndex: 2,
  },
  contentTouchable: {
    padding: 16,
  },
  swipeIndicator: {
    position: 'absolute',
    top: 8,
    right: 8,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    zIndex: 3,
  },
  listItemContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  leftIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    fontSize: 18,
    fontWeight: '600',
  },
  textContent: {
    flex: 1,
    gap: 2,
  },
  title: {
    fontSize: 16,
    fontWeight: '600',
  },
  subtitle: {
    fontSize: 14,
    fontWeight: '500',
  },
  description: {
    fontSize: 12,
    lineHeight: 16,
  },
  rightContent: {
    alignItems: 'center',
    gap: 8,
  },
  badge: {
    minWidth: 20,
    height: 20,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 6,
  },
  badgeText: {
    color: '#ffffff',
    fontSize: 12,
    fontWeight: '700',
  },
})
