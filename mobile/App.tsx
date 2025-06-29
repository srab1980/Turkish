import React, { useEffect } from 'react'
import { StatusBar } from 'expo-status-bar'
import { Provider } from 'react-redux'
import { PersistGate } from 'redux-persist/integration/react'
import { GestureHandlerRootView } from 'react-native-gesture-handler'
import { SafeAreaProvider } from 'react-native-safe-area-context'
import * as Font from 'expo-font'
import * as SplashScreen from 'expo-splash-screen'
import { store, persistor } from './src/store'
import { AppNavigator } from './src/navigation/AppNavigator'
import { LoadingScreen } from './src/screens/LoadingScreen'
import { ErrorBoundary } from './src/components/ErrorBoundary'
import { NetworkProvider } from './src/providers/NetworkProvider'
import { NotificationProvider } from './src/providers/NotificationProvider'
import { AudioProvider } from './src/providers/AudioProvider'

// Keep the splash screen visible while we fetch resources
SplashScreen.preventAutoHideAsync()

// Custom fonts (if needed)
const customFonts = {
  // Add custom fonts here if needed
  // 'CustomFont-Regular': require('./assets/fonts/CustomFont-Regular.ttf'),
  // 'CustomFont-Bold': require('./assets/fonts/CustomFont-Bold.ttf'),
}

export default function App() {
  const [fontsLoaded, setFontsLoaded] = React.useState(false)

  useEffect(() => {
    async function loadResourcesAndDataAsync() {
      try {
        // Load fonts
        if (Object.keys(customFonts).length > 0) {
          await Font.loadAsync(customFonts)
        }

        // Simulate minimum loading time for better UX
        await new Promise(resolve => setTimeout(resolve, 1000))

        setFontsLoaded(true)
      } catch (e) {
        console.warn('Error loading resources:', e)
        setFontsLoaded(true) // Continue even if fonts fail to load
      } finally {
        await SplashScreen.hideAsync()
      }
    }

    loadResourcesAndDataAsync()
  }, [])

  if (!fontsLoaded) {
    return <LoadingScreen />
  }

  return (
    <ErrorBoundary>
      <Provider store={store}>
        <PersistGate loading={<LoadingScreen />} persistor={persistor}>
          <SafeAreaProvider>
            <GestureHandlerRootView style={{ flex: 1 }}>
              <NetworkProvider>
                <NotificationProvider>
                  <AudioProvider>
                    <AppNavigator />
                    <StatusBar style="auto" />
                  </AudioProvider>
                </NotificationProvider>
              </NetworkProvider>
            </GestureHandlerRootView>
          </SafeAreaProvider>
        </PersistGate>
      </Provider>
    </ErrorBoundary>
  )
}
