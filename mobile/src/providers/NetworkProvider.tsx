import React, { useEffect, useState } from 'react'
import NetInfo from '@react-native-community/netinfo'
import { useAppDispatch } from '../store'
import { setOnlineStatus } from '../store/slices/offlineSlice'

interface NetworkProviderProps {
  children: React.ReactNode
}

export const NetworkProvider: React.FC<NetworkProviderProps> = ({ children }) => {
  const dispatch = useAppDispatch()
  const [isInitialized, setIsInitialized] = useState(false)

  useEffect(() => {
    // Subscribe to network state changes
    const unsubscribe = NetInfo.addEventListener(state => {
      const isConnected = state.isConnected && state.isInternetReachable
      dispatch(setOnlineStatus(isConnected || false))
      
      if (!isInitialized) {
        setIsInitialized(true)
      }
    })

    // Get initial network state
    NetInfo.fetch().then(state => {
      const isConnected = state.isConnected && state.isInternetReachable
      dispatch(setOnlineStatus(isConnected || false))
      setIsInitialized(true)
    })

    return () => {
      unsubscribe()
    }
  }, [dispatch, isInitialized])

  // Don't render children until network state is initialized
  if (!isInitialized) {
    return null
  }

  return <>{children}</>
}
