import React, { useEffect, useRef, useState } from 'react'
import {
  View,
  Text,
  Modal,
  Animated,
  PanGestureHandler,
  State,
  Dimensions,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  StatusBar,
  Platform,
} from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import { useAppSelector } from '../../store'

const { height: screenHeight, width: screenWidth } = Dimensions.get('window')
const SNAP_POINTS = [0.3, 0.6, 0.9] // Percentage of screen height

interface BottomSheetProps {
  visible: boolean
  onClose: () => void
  title?: string
  children: React.ReactNode
  snapPoints?: number[]
  initialSnapPoint?: number
  enablePanGesture?: boolean
  showHandle?: boolean
  showCloseButton?: boolean
  backgroundColor?: string
  overlayOpacity?: number
  onSnapPointChange?: (snapPoint: number) => void
}

export const BottomSheet: React.FC<BottomSheetProps> = ({
  visible,
  onClose,
  title,
  children,
  snapPoints = SNAP_POINTS,
  initialSnapPoint = 0,
  enablePanGesture = true,
  showHandle = true,
  showCloseButton = true,
  backgroundColor,
  overlayOpacity = 0.5,
  onSnapPointChange,
}) => {
  const { display } = useAppSelector((state) => state.settings)
  const isDark = display.theme === 'dark'

  const translateY = useRef(new Animated.Value(screenHeight)).current
  const overlayOpacity_ = useRef(new Animated.Value(0)).current
  const [currentSnapPoint, setCurrentSnapPoint] = useState(initialSnapPoint)
  const [isGestureActive, setIsGestureActive] = useState(false)

  const defaultBackgroundColor = isDark ? '#1f2937' : '#ffffff'
  const sheetBackgroundColor = backgroundColor || defaultBackgroundColor

  useEffect(() => {
    if (visible) {
      showBottomSheet()
    } else {
      hideBottomSheet()
    }
  }, [visible])

  const showBottomSheet = () => {
    const targetHeight = screenHeight * (1 - snapPoints[currentSnapPoint])
    
    Animated.parallel([
      Animated.spring(translateY, {
        toValue: targetHeight,
        useNativeDriver: true,
        tension: 100,
        friction: 8,
      }),
      Animated.timing(overlayOpacity_, {
        toValue: overlayOpacity,
        duration: 300,
        useNativeDriver: true,
      }),
    ]).start()
  }

  const hideBottomSheet = () => {
    Animated.parallel([
      Animated.spring(translateY, {
        toValue: screenHeight,
        useNativeDriver: true,
        tension: 100,
        friction: 8,
      }),
      Animated.timing(overlayOpacity_, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }),
    ]).start(() => {
      setCurrentSnapPoint(initialSnapPoint)
    })
  }

  const snapToPoint = (pointIndex: number) => {
    const targetHeight = screenHeight * (1 - snapPoints[pointIndex])
    
    Animated.spring(translateY, {
      toValue: targetHeight,
      useNativeDriver: true,
      tension: 100,
      friction: 8,
    }).start()

    setCurrentSnapPoint(pointIndex)
    if (onSnapPointChange) {
      onSnapPointChange(pointIndex)
    }
  }

  const findClosestSnapPoint = (currentY: number): number => {
    const currentPercentage = 1 - (currentY / screenHeight)
    let closestIndex = 0
    let minDistance = Math.abs(snapPoints[0] - currentPercentage)

    snapPoints.forEach((point, index) => {
      const distance = Math.abs(point - currentPercentage)
      if (distance < minDistance) {
        minDistance = distance
        closestIndex = index
      }
    })

    return closestIndex
  }

  const handleGestureEvent = Animated.event(
    [{ nativeEvent: { translationY: translateY } }],
    { 
      useNativeDriver: true,
      listener: (event: any) => {
        const { translationY } = event.nativeEvent
        const baseHeight = screenHeight * (1 - snapPoints[currentSnapPoint])
        const newY = baseHeight + translationY

        // Prevent dragging above the highest snap point
        const maxHeight = screenHeight * (1 - snapPoints[snapPoints.length - 1])
        if (newY < maxHeight) {
          translateY.setValue(maxHeight)
        }
        // Prevent dragging below the screen
        else if (newY > screenHeight) {
          translateY.setValue(screenHeight)
        }
      }
    }
  )

  const handleGestureStateChange = (event: any) => {
    const { state, translationY, velocityY } = event.nativeEvent

    if (state === State.BEGAN) {
      setIsGestureActive(true)
    } else if (state === State.END || state === State.CANCELLED) {
      setIsGestureActive(false)
      
      const currentY = screenHeight * (1 - snapPoints[currentSnapPoint]) + translationY

      // If dragged down significantly or with high velocity, close
      if (currentY > screenHeight * 0.8 || velocityY > 1000) {
        onClose()
        return
      }

      // Find closest snap point
      const closestSnapPoint = findClosestSnapPoint(currentY)
      snapToPoint(closestSnapPoint)
    }
  }

  const handleOverlayPress = () => {
    if (!isGestureActive) {
      onClose()
    }
  }

  return (
    <Modal
      visible={visible}
      transparent
      animationType="none"
      statusBarTranslucent
      onRequestClose={onClose}
    >
      <View style={styles.container}>
        {/* Overlay */}
        <Animated.View
          style={[
            styles.overlay,
            { opacity: overlayOpacity_ }
          ]}
        >
          <TouchableOpacity
            style={styles.overlayTouchable}
            onPress={handleOverlayPress}
            activeOpacity={1}
          />
        </Animated.View>

        {/* Bottom Sheet */}
        <PanGestureHandler
          onGestureEvent={enablePanGesture ? handleGestureEvent : undefined}
          onHandlerStateChange={enablePanGesture ? handleGestureStateChange : undefined}
          enabled={enablePanGesture}
        >
          <Animated.View
            style={[
              styles.bottomSheet,
              {
                backgroundColor: sheetBackgroundColor,
                transform: [{ translateY }],
              }
            ]}
          >
            <SafeAreaView style={styles.safeArea}>
              {/* Handle */}
              {showHandle && (
                <View style={styles.handleContainer}>
                  <View style={[
                    styles.handle,
                    { backgroundColor: isDark ? '#4b5563' : '#d1d5db' }
                  ]} />
                </View>
              )}

              {/* Header */}
              {(title || showCloseButton) && (
                <View style={styles.header}>
                  <View style={styles.headerLeft}>
                    {title && (
                      <Text style={[
                        styles.title,
                        { color: isDark ? '#ffffff' : '#1f2937' }
                      ]}>
                        {title}
                      </Text>
                    )}
                  </View>
                  
                  {showCloseButton && (
                    <TouchableOpacity
                      style={[
                        styles.closeButton,
                        { backgroundColor: isDark ? '#374151' : '#f3f4f6' }
                      ]}
                      onPress={onClose}
                    >
                      <Ionicons 
                        name="close" 
                        size={20} 
                        color={isDark ? '#ffffff' : '#1f2937'} 
                      />
                    </TouchableOpacity>
                  )}
                </View>
              )}

              {/* Content */}
              <View style={styles.content}>
                {children}
              </View>

              {/* Snap Point Indicators */}
              {snapPoints.length > 1 && (
                <View style={styles.snapIndicators}>
                  {snapPoints.map((_, index) => (
                    <TouchableOpacity
                      key={index}
                      style={[
                        styles.snapIndicator,
                        {
                          backgroundColor: index === currentSnapPoint
                            ? '#3b82f6'
                            : (isDark ? '#4b5563' : '#d1d5db')
                        }
                      ]}
                      onPress={() => snapToPoint(index)}
                    />
                  ))}
                </View>
              )}
            </SafeAreaView>
          </Animated.View>
        </PanGestureHandler>
      </View>
    </Modal>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: '#000000',
  },
  overlayTouchable: {
    flex: 1,
  },
  bottomSheet: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    height: screenHeight,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.25,
    shadowRadius: 16,
    elevation: 16,
  },
  safeArea: {
    flex: 1,
  },
  handleContainer: {
    alignItems: 'center',
    paddingVertical: 12,
  },
  handle: {
    width: 40,
    height: 4,
    borderRadius: 2,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0, 0, 0, 0.1)',
  },
  headerLeft: {
    flex: 1,
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
  },
  closeButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 16,
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 16,
  },
  snapIndicators: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 16,
    gap: 8,
  },
  snapIndicator: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
})

// Utility hook for managing bottom sheet state
export const useBottomSheet = (initialVisible = false) => {
  const [visible, setVisible] = useState(initialVisible)
  const [snapPoint, setSnapPoint] = useState(0)

  const show = () => setVisible(true)
  const hide = () => setVisible(false)
  const toggle = () => setVisible(!visible)

  return {
    visible,
    snapPoint,
    show,
    hide,
    toggle,
    setSnapPoint,
  }
}
