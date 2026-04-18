import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit'
import { userApi } from '@/services/userApi'
import { UserProfile, ProfileCompletion } from '@/types/auth'

interface UserState {
  profile: UserProfile | null
  profileCompletion: ProfileCompletion
  isLoading: boolean
  error: string | null
  preferences: {
    notifications: boolean
    emailUpdates: boolean
    emergencyContacts: string[]
  }
}

const initialState: UserState = {
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
}

// Async thunks
export const fetchUserProfile = createAsyncThunk(
  'user/fetchProfile',
  async (_, { rejectWithValue }) => {
    try {
      const response = await userApi.getProfile()
      return response
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch profile')
    }
  }
)

export const updateUserProfile = createAsyncThunk(
  'user/updateProfile',
  async (profileData: Partial<UserProfile>, { rejectWithValue }) => {
    try {
      const response = await userApi.updateProfile(profileData)
      return response
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to update profile')
    }
  }
)

export const fetchProfileCompletion = createAsyncThunk(
  'user/fetchProfileCompletion',
  async (_, { rejectWithValue }) => {
    try {
      const response = await userApi.getProfileCompletion()
      return response
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch profile completion')
    }
  }
)

export const updateUserPreferences = createAsyncThunk(
  'user/updatePreferences',
  async (preferences: Partial<UserState['preferences']>, { rejectWithValue }) => {
    try {
      const response = await userApi.updatePreferences(preferences)
      return response
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to update preferences')
    }
  }
)

const userSlice = createSlice({
  name: 'user',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null
    },
    setProfileCompletion: (state, action: PayloadAction<ProfileCompletion>) => {
      state.profileCompletion = action.payload
    },
    updateLocalProfile: (state, action: PayloadAction<Partial<UserProfile>>) => {
      if (state.profile) {
        state.profile = { ...state.profile, ...action.payload }
      }
    },
    resetUserState: (state) => {
      state.profile = null
      state.profileCompletion = {
        percentage: 0,
        missingFields: [],
        completedSections: [],
        requiredFields: [],
        optionalFields: []
      }
      state.preferences = {
        notifications: true,
        emailUpdates: true,
        emergencyContacts: []
      }
    }
  },
  extraReducers: (builder) => {
    builder
      // Fetch profile
      .addCase(fetchUserProfile.pending, (state) => {
        state.isLoading = true
        state.error = null
      })
      .addCase(fetchUserProfile.fulfilled, (state, action: PayloadAction<UserProfile>) => {
        state.isLoading = false
        state.profile = action.payload
        state.error = null
      })
      .addCase(fetchUserProfile.rejected, (state, action) => {
        state.isLoading = false
        state.error = action.payload as string
      })
      // Update profile
      .addCase(updateUserProfile.pending, (state) => {
        state.isLoading = true
        state.error = null
      })
      .addCase(updateUserProfile.fulfilled, (state, action: PayloadAction<UserProfile>) => {
        state.isLoading = false
        state.profile = action.payload
        state.error = null
      })
      .addCase(updateUserProfile.rejected, (state, action) => {
        state.isLoading = false
        state.error = action.payload as string
      })
      // Profile completion
      .addCase(fetchProfileCompletion.pending, (state) => {
        state.isLoading = true
        state.error = null
      })
      .addCase(fetchProfileCompletion.fulfilled, (state, action: PayloadAction<ProfileCompletion>) => {
        state.isLoading = false
        state.profileCompletion = action.payload
        state.error = null
      })
      .addCase(fetchProfileCompletion.rejected, (state, action) => {
        state.isLoading = false
        state.error = action.payload as string
      })
      // Update preferences
      .addCase(updateUserPreferences.fulfilled, (state, action: PayloadAction<Partial<UserState['preferences']>>) => {
        state.preferences = { ...state.preferences, ...action.payload }
      })
  },
})

export const { 
  clearError, 
  setProfileCompletion, 
  updateLocalProfile, 
  resetUserState 
} = userSlice.actions
export default userSlice.reducer
