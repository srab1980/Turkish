import { configureStore, combineReducers } from '@reduxjs/toolkit'
import { persistStore, persistReducer } from 'redux-persist'
import AsyncStorage from '@react-native-async-storage/async-storage'
import { authSlice } from './slices/authSlice'
import { userSlice } from './slices/userSlice'
import { lessonsSlice } from './slices/lessonsSlice'
import { progressSlice } from './slices/progressSlice'
import { offlineSlice } from './slices/offlineSlice'
import { settingsSlice } from './slices/settingsSlice'

const persistConfig = {
  key: 'root',
  storage: AsyncStorage,
  whitelist: ['auth', 'user', 'progress', 'offline', 'settings'], // Only persist these reducers
  blacklist: ['lessons'], // Don't persist lessons (they should be fetched fresh)
}

const rootReducer = combineReducers({
  auth: authSlice.reducer,
  user: userSlice.reducer,
  lessons: lessonsSlice.reducer,
  progress: progressSlice.reducer,
  offline: offlineSlice.reducer,
  settings: settingsSlice.reducer,
})

const persistedReducer = persistReducer(persistConfig, rootReducer)

export const store = configureStore({
  reducer: persistedReducer,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: ['persist/PERSIST', 'persist/REHYDRATE'],
      },
    }),
  devTools: __DEV__,
})

export const persistor = persistStore(store)

export type RootState = ReturnType<typeof store.getState>
export type AppDispatch = typeof store.dispatch

// Typed hooks
import { useDispatch, useSelector, TypedUseSelectorHook } from 'react-redux'
export const useAppDispatch = () => useDispatch<AppDispatch>()
export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector
