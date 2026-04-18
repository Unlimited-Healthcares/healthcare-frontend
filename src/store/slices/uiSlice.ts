import { createSlice, PayloadAction } from '@reduxjs/toolkit'

interface UIState {
  isLoading: boolean
  notifications: NotificationItem[]
  sidebarOpen: boolean
  theme: 'light' | 'dark'
  activeTab: string
  breadcrumbs: BreadcrumbItem[]
}

interface NotificationItem {
  id: string
  type: 'success' | 'error' | 'warning' | 'info'
  title: string
  message: string
  timestamp: Date
  read: boolean
}

interface BreadcrumbItem {
  label: string
  path: string
  active: boolean
}

const initialState: UIState = {
  isLoading: false,
  notifications: [],
  sidebarOpen: false,
  theme: 'light',
  activeTab: 'dashboard',
  breadcrumbs: []
}

const uiSlice = createSlice({
  name: 'ui',
  initialState,
  reducers: {
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.isLoading = action.payload
    },
    addNotification: (state, action: PayloadAction<Omit<NotificationItem, 'id' | 'timestamp' | 'read'>>) => {
      const notification: NotificationItem = {
        ...action.payload,
        id: Date.now().toString(),
        timestamp: new Date(),
        read: false
      }
      state.notifications.unshift(notification)
    },
    removeNotification: (state, action: PayloadAction<string>) => {
      state.notifications = state.notifications.filter(n => n.id !== action.payload)
    },
    markNotificationAsRead: (state, action: PayloadAction<string>) => {
      const notification = state.notifications.find(n => n.id === action.payload)
      if (notification) {
        notification.read = true
      }
    },
    clearAllNotifications: (state) => {
      state.notifications = []
    },
    toggleSidebar: (state) => {
      state.sidebarOpen = !state.sidebarOpen
    },
    setSidebarOpen: (state, action: PayloadAction<boolean>) => {
      state.sidebarOpen = action.payload
    },
    setTheme: (state, action: PayloadAction<'light' | 'dark'>) => {
      state.theme = action.payload
    },
    setActiveTab: (state, action: PayloadAction<string>) => {
      state.activeTab = action.payload
    },
    setBreadcrumbs: (state, action: PayloadAction<BreadcrumbItem[]>) => {
      state.breadcrumbs = action.payload
    },
    addBreadcrumb: (state, action: PayloadAction<BreadcrumbItem>) => {
      state.breadcrumbs.push(action.payload)
    },
    clearBreadcrumbs: (state) => {
      state.breadcrumbs = []
    }
  }
})

export const {
  setLoading,
  addNotification,
  removeNotification,
  markNotificationAsRead,
  clearAllNotifications,
  toggleSidebar,
  setSidebarOpen,
  setTheme,
  setActiveTab,
  setBreadcrumbs,
  addBreadcrumb,
  clearBreadcrumbs
} = uiSlice.actions

export default uiSlice.reducer
