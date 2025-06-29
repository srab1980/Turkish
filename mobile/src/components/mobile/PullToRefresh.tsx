import React, { useRef, useState, useEffect } from 'react'
import {
  View,
  ScrollView,
  Animated,
  StyleSheet,
  Dimensions,
  Platform,
  ActivityIndicator,
  Text,
} from 'react-native'
import { PanGestureHandler, State } from 'react-native-gesture-handler'
import { Ionicons } from '@expo/vector-icons'
import { LinearGradient } from 'expo-linear-gradient'
import { useAppSelector } from '../../store'

const { height: screenHeight } = Dimensions.get('window')
const REFRESH_HEIGHT = 80
const TRIGGER_HEIGHT = 120

interface PullToRefreshProps {
  children: React.ReactNode
  onRefresh: () => Promise<void>
  refreshing?: boolean
  enabled?: boolean
  colors?: string[]
  backgroundColor?: string
  tintColor?: string
  title?: string
  titleColor?: string
  style?: any
  contentContainerStyle?: any
}

export const PullToRefresh: React.FC<PullToRefreshProps> = ({
  children,
  onRefresh,
  refreshing = false,
  enabled = true,
  colors = ['#3b82f6', '#8b5cf6'],
  backgroundColor,
  tintColor,
  title = 'Pull to refresh',
  titleColor,
  style,
  contentContainerStyle,
}) => {
  const { display } = useAppSelector((state) => state.settings)
  const isDark = display.theme === 'dark'

  const [isRefreshing, setIsRefreshing] = useState(false)
  const [pullDistance, setPullDistance] = useState(0)
  const [canRefresh, setCanRefresh] = useState(false)

  const translateY = useRef(new Animated.Value(0)).current
  const pullProgress = useRef(new Animated.Value(0)).current
  const rotation = useRef(new Animated.Value(0)).current
  const scale = useRef(new Animated.Value(0)).current
  const opacity = useRef(new Animated.Value(0)).current

  const scrollViewRef = useRef<ScrollView>(null)
  const [scrollOffset, setScrollOffset] = useState(0)

  const defaultBackgroundColor = isDark ? '#111827' : '#f9fafb'
  const defaultTintColor = isDark ? '#ffffff' : '#1f2937'
  const defaultTitleColor = isDark ? '#d1d5db' : '#6b7280'

  useEffect(() => {
    setIsRefreshing(refreshing)
  }, [refreshing])

  useEffect(() => {
    if (isRefreshing) {
      startRefreshAnimation()
    } else {
      stopRefreshAnimation()
    }
  }, [isRefreshing])

  const startRefreshAnimation = () => {
    Animated.parallel([
      Animated.spring(translateY, {
        toValue: REFRESH_HEIGHT,
        useNativeDriver: true,
        tension: 300,
        friction: 20,
      }),
      Animated.timing(scale, {
        toValue: 1,
        duration: 200,
        useNativeDriver: true,
      }),
      Animated.timing(opacity, {
        toValue: 1,
        duration: 200,
        useNativeDriver: true,
      }),
      Animated.loop(
        Animated.timing(rotation, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: true,
        })
      ),
    ]).start()
  }

  const stopRefreshAnimation = () => {
    rotation.stopAnimation()
    
    Animated.parallel([
      Animated.spring(translateY, {
        toValue: 0,
        useNativeDriver: true,
        tension: 300,
        friction: 20,
      }),
      Animated.timing(scale, {
        toValue: 0,
        duration: 200,
        useNativeDriver: true,
      }),
      Animated.timing(opacity, {
        toValue: 0,
        duration: 200,
        useNativeDriver: true,
      }),
      Animated.timing(rotation, {
        toValue: 0,
        duration: 200,
        useNativeDriver: true,
      }),
    ]).start()
  }

  const handleGestureEvent = Animated.event(
    [{ nativeEvent: { translationY: translateY } }],
    {
      useNativeDriver: true,
      listener: (event: any) => {
        const { translationY } = event.nativeEvent
        
        // Only allow pull down when at top of scroll view
        if (scrollOffset > 0 || translationY < 0) {
          return
        }

        const distance = Math.max(0, translationY)
        setPullDistance(distance)

        // Update progress
        const progress = Math.min(distance / TRIGGER_HEIGHT, 1)
        pullProgress.setValue(progress)

        // Update scale and opacity based on progress
        scale.setValue(progress)
        opacity.setValue(progress)

        // Check if can refresh
        const shouldRefresh = distance >= TRIGGER_HEIGHT
        if (shouldRefresh !== canRefresh) {
          setCanRefresh(shouldRefresh)
        }

        // Rotate icon based on progress
        rotation.setValue(progress)
      },
    }
  )

  const handleGestureStateChange = async (event: any) => {
    const { state, translationY } = event.nativeEvent

    if (state === State.END || state === State.CANCELLED) {
      const distance = Math.max(0, translationY)

      if (distance >= TRIGGER_HEIGHT && enabled && !isRefreshing) {
        // Trigger refresh
        setIsRefreshing(true)
        setCanRefresh(false)
        
        try {
          await onRefresh()
        } catch (error) {
          console.error('Refresh failed:', error)
        } finally {
          setIsRefreshing(false)
        }
      } else {
        // Reset position
        stopRefreshAnimation()
        setCanRefresh(false)
      }

      setPullDistance(0)
    }
  }

  const handleScroll = (event: any) => {
    const { contentOffset } = event.nativeEvent
    setScrollOffset(contentOffset.y)
  }

  const rotateInterpolate = rotation.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  })

  const progressInterpolate = pullProgress.interpolate({
    inputRange: [0, 0.5, 1],
    outputRange: [0, 0.5, 1],
    extrapolate: 'clamp',
  })

  const renderRefreshIndicator = () => {
    if (isRefreshing) {
      return (
        <View style={styles.refreshIndicator}>
          <ActivityIndicator
            size="small"
            color={tintColor || defaultTintColor}
          />
          <Text style={[
            styles.refreshText,
            { color: titleColor || defaultTitleColor }
          ]}>
            Refreshing...
          </Text>
        </View>
      )
    }

    return (
      <Animated.View
        style={[
          styles.refreshIndicator,
          {
            transform: [{ scale }, { rotate: rotateInterpolate }],
            opacity,
          },
        ]}
      >
        <LinearGradient
          colors={colors}
          style={styles.iconContainer}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
        >
          <Ionicons
            name={canRefresh ? 'refresh' : 'arrow-down'}
            size={20}
            color="#ffffff"
          />
        </LinearGradient>
        
        <Text style={[
          styles.refreshText,
          { color: titleColor || defaultTitleColor }
        ]}>
          {canRefresh ? 'Release to refresh' : title}
        </Text>

        {/* Progress indicator */}
        <View style={[
          styles.progressContainer,
          { backgroundColor: isDark ? '#374151' : '#e5e7eb' }
        ]}>
          <Animated.View
            style={[
              styles.progressBar,
              {
                width: progressInterpolate.interpolate({
                  inputRange: [0, 1],
                  outputRange: ['0%', '100%'],
                }),
              },
            ]}
          >
            <LinearGradient
              colors={colors}
              style={styles.progressFill}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
            />
          </Animated.View>
        </View>
      </Animated.View>
    )
  }

  return (
    <View style={[
      styles.container,
      { backgroundColor: backgroundColor || defaultBackgroundColor },
      style,
    ]}>
      {/* Refresh Header */}
      <Animated.View
        style={[
          styles.refreshHeader,
          {
            backgroundColor: backgroundColor || defaultBackgroundColor,
            transform: [{ translateY }],
          },
        ]}
      >
        {renderRefreshIndicator()}
      </Animated.View>

      {/* Scrollable Content */}
      <PanGestureHandler
        onGestureEvent={enabled ? handleGestureEvent : undefined}
        onHandlerStateChange={enabled ? handleGestureStateChange : undefined}
        enabled={enabled && scrollOffset <= 0}
        activeOffsetY={[10, 1000]}
        failOffsetX={[-50, 50]}
      >
        <Animated.View style={styles.scrollContainer}>
          <ScrollView
            ref={scrollViewRef}
            style={styles.scrollView}
            contentContainerStyle={[
              styles.contentContainer,
              contentContainerStyle,
            ]}
            onScroll={handleScroll}
            scrollEventThrottle={16}
            showsVerticalScrollIndicator={true}
            bounces={Platform.OS === 'ios'}
          >
            {children}
          </ScrollView>
        </Animated.View>
      </PanGestureHandler>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  refreshHeader: {
    position: 'absolute',
    top: -REFRESH_HEIGHT,
    left: 0,
    right: 0,
    height: REFRESH_HEIGHT,
    zIndex: 1000,
    justifyContent: 'center',
    alignItems: 'center',
  },
  refreshIndicator: {
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  iconContainer: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  refreshText: {
    fontSize: 14,
    fontWeight: '500',
  },
  progressContainer: {
    width: 60,
    height: 3,
    borderRadius: 1.5,
    overflow: 'hidden',
    marginTop: 4,
  },
  progressBar: {
    height: '100%',
  },
  progressFill: {
    flex: 1,
  },
  scrollContainer: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  contentContainer: {
    flexGrow: 1,
  },
})

// Utility hook for managing refresh state
export const usePullToRefresh = (refreshFunction: () => Promise<void>) => {
  const [refreshing, setRefreshing] = useState(false)

  const handleRefresh = async () => {
    if (refreshing) return

    setRefreshing(true)
    try {
      await refreshFunction()
    } catch (error) {
      console.error('Refresh failed:', error)
    } finally {
      setRefreshing(false)
    }
  }

  return {
    refreshing,
    onRefresh: handleRefresh,
  }
}
