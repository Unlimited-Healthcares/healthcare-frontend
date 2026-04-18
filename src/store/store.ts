import { configureStore } from '@reduxjs/toolkit'
import authReducer from './slices/authSlice'
import userReducer from './slices/userSlice'
import uiReducer from './slices/uiSlice'

// Ensure reducers are properly imported
if (!authReducer || !userReducer || !uiReducer) {
  throw new Error('One or more reducers failed to import')
}

// Create store with error handling
let store: any

try {
  store = configureStore({
    reducer: {
      auth: authReducer,
      user: userReducer,
      ui: uiReducer,
    },
    middleware: (getDefaultMiddleware) =>
      getDefaultMiddleware({
        serializableCheck: {
          ignoredActions: ['persist/PERSIST'],
        },
      }),
    // Add preloadedState to ensure store is initialized with proper state
    preloadedState: {
      auth: {
        user: null,
        token: localStorage.getItem('authToken'),
        isAuthenticated: !!localStorage.getItem('authToken'),
        isLoading: false,
        error: null,
        profileCompletion: 0,
      },
      user: {
        profile: null,
        profileCompletion: {
          percentage: 0,
          missingFields: [],
          completedSections: [],
          requiredFields: [],
          optionalFields: []
        },
        isLoading: false,
        error: null,
        preferences: {
          notifications: true,
          emailUpdates: true,
          emergencyContacts: []
        }
      },
      ui: {
        isLoading: false,
        notifications: [],
        sidebarOpen: false,
        theme: 'light',
        activeTab: 'dashboard',
        breadcrumbs: []
      },
    },
  })
} catch (error) {
  console.error('Failed to create Redux store:', error)
  throw new Error('Failed to create Redux store')
}

// Ensure store is properly initialized
if (!store || !store.getState) {
  throw new Error('Store failed to initialize properly')
}

export { store }
export type RootState = ReturnType<typeof store.getState>
export type AppDispatch = typeof store.dispatch
