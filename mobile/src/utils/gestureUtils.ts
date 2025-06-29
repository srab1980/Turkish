import { Animated, Dimensions, Platform, Vibration } from 'react-native'

const { width: screenWidth, height: screenHeight } = Dimensions.get('window')

// Gesture configuration constants
export const GESTURE_CONFIG = {
  SWIPE_THRESHOLD: 50,
  VELOCITY_THRESHOLD: 500,
  LONG_PRESS_DURATION: 500,
  DOUBLE_TAP_DELAY: 300,
  PINCH_THRESHOLD: 0.1,
  ROTATION_THRESHOLD: 0.1,
  HAPTIC_FEEDBACK_DURATION: 10,
  ANIMATION_DURATION: 250,
  SPRING_CONFIG: {
    tension: 300,
    friction: 20,
  },
}

// Gesture direction enum
export enum GestureDirection {
  UP = 'up',
  DOWN = 'down',
  LEFT = 'left',
  RIGHT = 'right',
}

// Gesture state interface
export interface GestureState {
  isActive: boolean
  direction: GestureDirection | null
  distance: number
  velocity: number
  scale: number
  rotation: number
}

// Haptic feedback utility
export const hapticFeedback = {
  light: () => {
    if (Platform.OS === 'ios') {
      Vibration.vibrate(GESTURE_CONFIG.HAPTIC_FEEDBACK_DURATION)
    }
  },
  
  medium: () => {
    if (Platform.OS === 'ios') {
      Vibration.vibrate(25)
    }
  },
  
  heavy: () => {
    if (Platform.OS === 'ios') {
      Vibration.vibrate(50)
    }
  },
  
  success: () => {
    if (Platform.OS === 'ios') {
      Vibration.vibrate([0, 10, 10, 10])
    }
  },
  
  error: () => {
    if (Platform.OS === 'ios') {
      Vibration.vibrate([0, 50, 50, 50])
    }
  },
}

// Animation utilities
export const animationUtils = {
  // Spring animation with default config
  spring: (
    value: Animated.Value,
    toValue: number,
    config?: Partial<typeof GESTURE_CONFIG.SPRING_CONFIG>
  ) => {
    return Animated.spring(value, {
      toValue,
      useNativeDriver: true,
      ...GESTURE_CONFIG.SPRING_CONFIG,
      ...config,
    })
  },

  // Timing animation
  timing: (
    value: Animated.Value,
    toValue: number,
    duration: number = GESTURE_CONFIG.ANIMATION_DURATION
  ) => {
    return Animated.timing(value, {
      toValue,
      duration,
      useNativeDriver: true,
    })
  },

  // Scale animation for press feedback
  pressScale: (scale: Animated.Value, pressed: boolean) => {
    return Animated.spring(scale, {
      toValue: pressed ? 0.95 : 1,
      useNativeDriver: true,
      tension: 400,
      friction: 10,
    })
  },

  // Bounce animation
  bounce: (value: Animated.Value, intensity: number = 1.1) => {
    return Animated.sequence([
      Animated.spring(value, {
        toValue: intensity,
        useNativeDriver: true,
        tension: 400,
        friction: 10,
      }),
      Animated.spring(value, {
        toValue: 1,
        useNativeDriver: true,
        tension: 400,
        friction: 10,
      }),
    ])
  },

  // Shake animation
  shake: (translateX: Animated.Value, intensity: number = 10) => {
    return Animated.sequence([
      Animated.timing(translateX, { toValue: intensity, duration: 50, useNativeDriver: true }),
      Animated.timing(translateX, { toValue: -intensity, duration: 50, useNativeDriver: true }),
      Animated.timing(translateX, { toValue: intensity, duration: 50, useNativeDriver: true }),
      Animated.timing(translateX, { toValue: 0, duration: 50, useNativeDriver: true }),
    ])
  },

  // Pulse animation
  pulse: (scale: Animated.Value, intensity: number = 1.05) => {
    return Animated.loop(
      Animated.sequence([
        Animated.timing(scale, {
          toValue: intensity,
          duration: 1000,
          useNativeDriver: true,
        }),
        Animated.timing(scale, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: true,
        }),
      ])
    )
  },
}

// Gesture detection utilities
export const gestureUtils = {
  // Determine swipe direction
  getSwipeDirection: (translationX: number, translationY: number): GestureDirection | null => {
    const absX = Math.abs(translationX)
    const absY = Math.abs(translationY)
    
    if (absX < GESTURE_CONFIG.SWIPE_THRESHOLD && absY < GESTURE_CONFIG.SWIPE_THRESHOLD) {
      return null
    }
    
    if (absX > absY) {
      return translationX > 0 ? GestureDirection.RIGHT : GestureDirection.LEFT
    } else {
      return translationY > 0 ? GestureDirection.DOWN : GestureDirection.UP
    }
  },

  // Check if gesture meets velocity threshold
  isVelocityThresholdMet: (velocityX: number, velocityY: number): boolean => {
    const velocity = Math.sqrt(velocityX * velocityX + velocityY * velocityY)
    return velocity > GESTURE_CONFIG.VELOCITY_THRESHOLD
  },

  // Calculate distance between two points
  getDistance: (x1: number, y1: number, x2: number, y2: number): number => {
    return Math.sqrt(Math.pow(x2 - x1, 2) + Math.pow(y2 - y1, 2))
  },

  // Normalize value to 0-1 range
  normalize: (value: number, min: number, max: number): number => {
    return Math.max(0, Math.min(1, (value - min) / (max - min)))
  },

  // Clamp value between min and max
  clamp: (value: number, min: number, max: number): number => {
    return Math.max(min, Math.min(max, value))
  },

  // Check if point is within bounds
  isWithinBounds: (
    x: number,
    y: number,
    bounds: { x: number; y: number; width: number; height: number }
  ): boolean => {
    return (
      x >= bounds.x &&
      x <= bounds.x + bounds.width &&
      y >= bounds.y &&
      y <= bounds.y + bounds.height
    )
  },

  // Calculate snap position
  getSnapPosition: (
    currentPosition: number,
    snapPoints: number[],
    threshold: number = 20
  ): number => {
    let closestSnap = snapPoints[0]
    let minDistance = Math.abs(currentPosition - closestSnap)

    for (const snapPoint of snapPoints) {
      const distance = Math.abs(currentPosition - snapPoint)
      if (distance < minDistance && distance <= threshold) {
        minDistance = distance
        closestSnap = snapPoint
      }
    }

    return closestSnap
  },
}

// Touch area utilities
export const touchUtils = {
  // Minimum touch target size (44pt on iOS, 48dp on Android)
  MIN_TOUCH_SIZE: Platform.OS === 'ios' ? 44 : 48,

  // Expand touch area for small elements
  expandTouchArea: (size: number) => {
    const expansion = Math.max(0, (touchUtils.MIN_TOUCH_SIZE - size) / 2)
    return {
      top: expansion,
      bottom: expansion,
      left: expansion,
      right: expansion,
    }
  },

  // Check if touch target meets accessibility guidelines
  isAccessibleTouchTarget: (width: number, height: number): boolean => {
    return width >= touchUtils.MIN_TOUCH_SIZE && height >= touchUtils.MIN_TOUCH_SIZE
  },
}

// Screen utilities
export const screenUtils = {
  width: screenWidth,
  height: screenHeight,
  
  // Check if device is in landscape mode
  isLandscape: () => screenWidth > screenHeight,
  
  // Get safe area for different screen sizes
  getSafeArea: () => {
    const isIPhoneX = Platform.OS === 'ios' && screenHeight >= 812
    return {
      top: isIPhoneX ? 44 : 20,
      bottom: isIPhoneX ? 34 : 0,
    }
  },
  
  // Convert percentage to pixels
  percentageToPixels: (percentage: number, dimension: 'width' | 'height'): number => {
    const screenDimension = dimension === 'width' ? screenWidth : screenHeight
    return (percentage / 100) * screenDimension
  },
  
  // Responsive font size based on screen width
  responsiveFontSize: (baseSize: number): number => {
    const scale = screenWidth / 375 // iPhone 6/7/8 width as base
    return Math.round(baseSize * scale)
  },
}

// Gesture hook utilities
export const createGestureHook = () => {
  const translateX = new Animated.Value(0)
  const translateY = new Animated.Value(0)
  const scale = new Animated.Value(1)
  const rotation = new Animated.Value(0)
  const opacity = new Animated.Value(1)

  const reset = () => {
    Animated.parallel([
      animationUtils.spring(translateX, 0),
      animationUtils.spring(translateY, 0),
      animationUtils.spring(scale, 1),
      animationUtils.spring(rotation, 0),
      animationUtils.spring(opacity, 1),
    ]).start()
  }

  return {
    values: { translateX, translateY, scale, rotation, opacity },
    animations: animationUtils,
    reset,
  }
}

// Performance optimization utilities
export const performanceUtils = {
  // Throttle function calls
  throttle: <T extends (...args: any[]) => any>(
    func: T,
    delay: number
  ): ((...args: Parameters<T>) => void) => {
    let timeoutId: NodeJS.Timeout | null = null
    let lastExecTime = 0
    
    return (...args: Parameters<T>) => {
      const currentTime = Date.now()
      
      if (currentTime - lastExecTime > delay) {
        func(...args)
        lastExecTime = currentTime
      } else {
        if (timeoutId) clearTimeout(timeoutId)
        timeoutId = setTimeout(() => {
          func(...args)
          lastExecTime = Date.now()
        }, delay - (currentTime - lastExecTime))
      }
    }
  },

  // Debounce function calls
  debounce: <T extends (...args: any[]) => any>(
    func: T,
    delay: number
  ): ((...args: Parameters<T>) => void) => {
    let timeoutId: NodeJS.Timeout | null = null
    
    return (...args: Parameters<T>) => {
      if (timeoutId) clearTimeout(timeoutId)
      timeoutId = setTimeout(() => func(...args), delay)
    }
  },
}
