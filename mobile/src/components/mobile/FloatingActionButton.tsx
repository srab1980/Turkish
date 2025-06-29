import React, { useRef, useState, useEffect } from 'react'
import {
  View,
  Text,
  TouchableOpacity,
  Animated,
  PanGestureHandler,
  State,
  Dimensions,
  StyleSheet,
  Vibration,
  Platform,
} from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import { LinearGradient } from 'expo-linear-gradient'
import { useAppSelector } from '../../store'

const { width: screenWidth, height: screenHeight } = Dimensions.get('window')

interface FABAction {
  id: string
  icon: string
  label: string
  color?: string
  onPress: () => void
}

interface FloatingActionButtonProps {
  icon?: string
  size?: number
  color?: string
  backgroundColor?: string
  position?: 'bottom-right' | 'bottom-left' | 'bottom-center'
  actions?: FABAction[]
  onPress?: () => void
  onLongPress?: () => void
  draggable?: boolean
  autoHide?: boolean
  hideOnScroll?: boolean
  style?: any
}

export const FloatingActionButton: React.FC<FloatingActionButtonProps> = ({
  icon = 'add',
  size = 56,
  color = '#ffffff',
  backgroundColor = '#3b82f6',
  position = 'bottom-right',
  actions = [],
  onPress,
  onLongPress,
  draggable = false,
  autoHide = false,
  hideOnScroll = false,
  style,
}) => {
  const { display } = useAppSelector((state) => state.settings)
  const isDark = display.theme === 'dark'

  const [isExpanded, setIsExpanded] = useState(false)
  const [isVisible, setIsVisible] = useState(true)
  const [isDragging, setIsDragging] = useState(false)

  const translateX = useRef(new Animated.Value(0)).current
  const translateY = useRef(new Animated.Value(0)).current
  const scale = useRef(new Animated.Value(1)).current
  const rotation = useRef(new Animated.Value(0)).current
  const opacity = useRef(new Animated.Value(1)).current

  const actionAnimations = useRef(
    actions.map(() => ({
      scale: new Animated.Value(0),
      opacity: new Animated.Value(0),
      translateY: new Animated.Value(20),
    }))
  ).current

  useEffect(() => {
    if (autoHide) {
      const timer = setTimeout(() => {
        hideButton()
      }, 3000)
      return () => clearTimeout(timer)
    }
  }, [autoHide])

  const getPositionStyle = () => {
    const margin = 20
    switch (position) {
      case 'bottom-left':
        return { bottom: margin, left: margin }
      case 'bottom-center':
        return { bottom: margin, alignSelf: 'center' }
      case 'bottom-right':
      default:
        return { bottom: margin, right: margin }
    }
  }

  const handlePress = () => {
    if (actions.length > 0) {
      toggleActions()
    } else if (onPress) {
      // Haptic feedback
      if (Platform.OS === 'ios') {
        Vibration.vibrate(10)
      }
      
      // Scale animation
      Animated.sequence([
        Animated.spring(scale, {
          toValue: 0.9,
          useNativeDriver: true,
          tension: 300,
          friction: 10,
        }),
        Animated.spring(scale, {
          toValue: 1,
          useNativeDriver: true,
          tension: 300,
          friction: 10,
        }),
      ]).start()

      onPress()
    }
  }

  const handleLongPress = () => {
    if (onLongPress) {
      // Stronger haptic feedback
      if (Platform.OS === 'ios') {
        Vibration.vibrate([0, 50])
      }
      
      // Pulse animation
      Animated.sequence([
        Animated.spring(scale, {
          toValue: 1.1,
          useNativeDriver: true,
          tension: 300,
          friction: 10,
        }),
        Animated.spring(scale, {
          toValue: 1,
          useNativeDriver: true,
          tension: 300,
          friction: 10,
        }),
      ]).start()

      onLongPress()
    }
  }

  const toggleActions = () => {
    const newExpanded = !isExpanded
    setIsExpanded(newExpanded)

    // Rotate main button
    Animated.spring(rotation, {
      toValue: newExpanded ? 1 : 0,
      useNativeDriver: true,
      tension: 300,
      friction: 10,
    }).start()

    // Animate action buttons
    if (newExpanded) {
      const animations = actionAnimations.map((anim, index) =>
        Animated.parallel([
          Animated.spring(anim.scale, {
            toValue: 1,
            useNativeDriver: true,
            tension: 300,
            friction: 10,
            delay: index * 50,
          }),
          Animated.spring(anim.opacity, {
            toValue: 1,
            useNativeDriver: true,
            delay: index * 50,
          }),
          Animated.spring(anim.translateY, {
            toValue: -(size + 16) * (index + 1),
            useNativeDriver: true,
            tension: 300,
            friction: 10,
            delay: index * 50,
          }),
        ])
      )
      Animated.stagger(50, animations).start()
    } else {
      const animations = actionAnimations.map((anim) =>
        Animated.parallel([
          Animated.spring(anim.scale, {
            toValue: 0,
            useNativeDriver: true,
            tension: 300,
            friction: 10,
          }),
          Animated.spring(anim.opacity, {
            toValue: 0,
            useNativeDriver: true,
          }),
          Animated.spring(anim.translateY, {
            toValue: 20,
            useNativeDriver: true,
            tension: 300,
            friction: 10,
          }),
        ])
      )
      Animated.parallel(animations).start()
    }
  }

  const hideButton = () => {
    setIsVisible(false)
    Animated.parallel([
      Animated.spring(scale, {
        toValue: 0,
        useNativeDriver: true,
        tension: 300,
        friction: 10,
      }),
      Animated.timing(opacity, {
        toValue: 0,
        duration: 200,
        useNativeDriver: true,
      }),
    ]).start()
  }

  const showButton = () => {
    setIsVisible(true)
    Animated.parallel([
      Animated.spring(scale, {
        toValue: 1,
        useNativeDriver: true,
        tension: 300,
        friction: 10,
      }),
      Animated.timing(opacity, {
        toValue: 1,
        duration: 200,
        useNativeDriver: true,
      }),
    ]).start()
  }

  const handleGestureEvent = Animated.event(
    [{ nativeEvent: { translationX: translateX, translationY: translateY } }],
    { useNativeDriver: true }
  )

  const handleGestureStateChange = (event: any) => {
    const { state, translationX, translationY } = event.nativeEvent

    if (state === State.BEGAN) {
      setIsDragging(true)
      Animated.spring(scale, {
        toValue: 1.1,
        useNativeDriver: true,
        tension: 300,
        friction: 10,
      }).start()
    } else if (state === State.END || state === State.CANCELLED) {
      setIsDragging(false)
      
      // Snap to edges
      const finalX = translationX > screenWidth / 2 - size / 2 
        ? screenWidth - size - 20 
        : 20
      
      // Keep within screen bounds
      const finalY = Math.max(
        20,
        Math.min(
          screenHeight - size - 100, // Account for bottom safe area
          translationY
        )
      )

      Animated.parallel([
        Animated.spring(translateX, {
          toValue: finalX,
          useNativeDriver: true,
          tension: 300,
          friction: 10,
        }),
        Animated.spring(translateY, {
          toValue: finalY,
          useNativeDriver: true,
          tension: 300,
          friction: 10,
        }),
        Animated.spring(scale, {
          toValue: 1,
          useNativeDriver: true,
          tension: 300,
          friction: 10,
        }),
      ]).start()
    }
  }

  const handleActionPress = (action: FABAction) => {
    // Close actions first
    toggleActions()
    
    // Small delay to let animation complete
    setTimeout(() => {
      action.onPress()
    }, 100)
  }

  const rotateInterpolate = rotation.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '45deg'],
  })

  if (!isVisible) return null

  return (
    <View style={[styles.container, getPositionStyle(), style]}>
      {/* Action Buttons */}
      {actions.map((action, index) => (
        <Animated.View
          key={action.id}
          style={[
            styles.actionContainer,
            {
              transform: [
                { scale: actionAnimations[index].scale },
                { translateY: actionAnimations[index].translateY },
              ],
              opacity: actionAnimations[index].opacity,
            },
          ]}
        >
          <View style={styles.actionLabelContainer}>
            <Text style={[
              styles.actionLabel,
              { 
                backgroundColor: isDark ? '#374151' : '#ffffff',
                color: isDark ? '#ffffff' : '#1f2937',
              }
            ]}>
              {action.label}
            </Text>
          </View>
          
          <TouchableOpacity
            style={[
              styles.actionButton,
              { backgroundColor: action.color || '#6b7280' }
            ]}
            onPress={() => handleActionPress(action)}
          >
            <Ionicons name={action.icon as any} size={20} color="#ffffff" />
          </TouchableOpacity>
        </Animated.View>
      ))}

      {/* Main FAB */}
      <PanGestureHandler
        onGestureEvent={draggable ? handleGestureEvent : undefined}
        onHandlerStateChange={draggable ? handleGestureStateChange : undefined}
        enabled={draggable && !isExpanded}
      >
        <Animated.View
          style={[
            styles.fab,
            {
              width: size,
              height: size,
              borderRadius: size / 2,
              transform: [
                { translateX: draggable ? translateX : 0 },
                { translateY: draggable ? translateY : 0 },
                { scale },
                { rotate: rotateInterpolate },
              ],
              opacity,
            },
          ]}
        >
          <TouchableOpacity
            style={[styles.fabTouchable, { backgroundColor }]}
            onPress={handlePress}
            onLongPress={handleLongPress}
            activeOpacity={0.8}
          >
            <LinearGradient
              colors={[backgroundColor, backgroundColor]}
              style={styles.fabGradient}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
            >
              <Ionicons name={icon as any} size={size * 0.4} color={color} />
            </LinearGradient>
          </TouchableOpacity>
        </Animated.View>
      </PanGestureHandler>

      {/* Overlay for closing actions */}
      {isExpanded && (
        <TouchableOpacity
          style={styles.overlay}
          onPress={toggleActions}
          activeOpacity={1}
        />
      )}
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    alignItems: 'center',
  },
  fab: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  fabTouchable: {
    width: '100%',
    height: '100%',
    borderRadius: 1000,
    overflow: 'hidden',
  },
  fabGradient: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  actionContainer: {
    position: 'absolute',
    flexDirection: 'row',
    alignItems: 'center',
    right: 0,
  },
  actionLabelContainer: {
    marginRight: 12,
  },
  actionLabel: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    fontSize: 14,
    fontWeight: '500',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  actionButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 4,
  },
  overlay: {
    position: 'absolute',
    top: -screenHeight,
    left: -screenWidth,
    width: screenWidth * 2,
    height: screenHeight * 2,
    backgroundColor: 'transparent',
  },
})
