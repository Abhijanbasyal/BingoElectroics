import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';
import APIEndPoints from '../middleware/APIEndPoints';

export const loginUser = createAsyncThunk(
  'auth/loginUser',
  async (formData, { rejectWithValue }) => {
    try {
      const response = await axios({
        method: APIEndPoints.login.method,
        url: APIEndPoints.login.url,
        data: { identifier: formData.identifier, password: formData.password },
        withCredentials: true,
      });
      const { token, user } = response.data;
      localStorage.setItem('token', token);
      console.log('Login success:', { user, token });
      return user;
    } catch (error) {
      console.error('Login error:', {
        message: error.message,
        status: error.response?.status,
        data: error.response?.data,
      });
      return rejectWithValue(error.response?.data || { message: 'Login failed' });
    }
  }
);

export const fetchCurrentUser = createAsyncThunk(
  'auth/fetchCurrentUser',
  async (_, { rejectWithValue }) => {
    const token = localStorage.getItem('token');
    if (!token) {
      console.log('No token found for fetchCurrentUser');
      return rejectWithValue({ message: 'No token found' });
    }
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 5000);
      const response = await axios({
        method: APIEndPoints.currentUser.method,
        url: APIEndPoints.currentUser.url,
        headers: { Authorization: `Bearer ${token}` },
        withCredentials: true,
        signal: controller.signal,
      });
      clearTimeout(timeoutId);
      console.log('Fetch current user success:', response.data.user);
      return response.data.user;
    } catch (error) {
      console.error('Fetch current user error:', {
        message: error.message,
        status: error.response?.status,
        data: error.response?.data,
      });
      if (error.name === 'AbortError') {
        return rejectWithValue({ message: 'Request timed out' });
      }
      if (error.response?.status === 401 || error.response?.status === 404) {
        localStorage.removeItem('token');
      }
      return rejectWithValue(error.response?.data || { message: 'Failed to fetch user' });
    }
  }
);

export const signupUser = createAsyncThunk(
  'auth/signupUser',
  async (formData, { rejectWithValue }) => {
    try {
      const response = await axios({
        method: APIEndPoints.signUp.method,
        url: APIEndPoints.signUp.url,
        data: { ...formData, roles: formData.roles || 'Customer' },
      });
      const { token, user } = response.data;
      localStorage.setItem('token', token);
      console.log('Signup success:', { user, token });
      return user;
    } catch (error) {
      console.error('Signup error:', {
        message: error.message,
        status: error.response?.status,
        data: error.response?.data,
      });
      return rejectWithValue(error.response?.data || { message: 'Signup failed' });
    }
  }
);

export const createUser = createAsyncThunk(
  'auth/createUser',
  async (formData, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        console.log('No token found for createUser');
        return rejectWithValue({ message: 'No token found' });
      }
      const response = await axios({
        method: APIEndPoints.register.method, // Use register endpoint
        url: APIEndPoints.register.url, // e.g., /api/auth/register
        data: { ...formData, roles: formData.roles || 'Customer' },
        headers: { Authorization: `Bearer ${token}` },
        withCredentials: true,
      });
      console.log('Create user success:', response.data.user);
      return response.data.user;
    } catch (error) {
      console.error('Create user error:', {
        message: error.message,
        status: error.response?.status,
        data: error.response?.data,
      });
      return rejectWithValue(error.response?.data || { message: 'Failed to create user' });
    }
  }
);

export const updateUser = createAsyncThunk(
  'auth/updateUser',
  async ({ id, formData }, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        console.log('No token found for updateUser');
        return rejectWithValue({ message: 'No token found' });
      }
      const submitData = { ...formData };
      if (!submitData.password) delete submitData.password;
      const response = await axios({
        method: APIEndPoints.updateUser.method,
        url: `${APIEndPoints.updateUser.url}/${id}`, // e.g., /api/auth/users/:id
        data: submitData,
        headers: { Authorization: `Bearer ${token}` },
        withCredentials: true,
      });
      console.log('Update user success:', response.data.user);
      return response.data.user;
    } catch (error) {
      console.error('Update user error:', {
        message: error.message,
        status: error.response?.status,
        data: error.response?.data,
      });
      return rejectWithValue(error.response?.data || { message: 'Failed to update user' });
    }
  }
);

export const logoutUser = createAsyncThunk(
  'auth/logoutUser',
  async (_, { rejectWithValue }) => {
    try {
      const response = await axios({
        method: APIEndPoints.logout.method,
        url: APIEndPoints.logout.url,
        headers: { Authorization: `Bearer ${localStorage.getItem('token') || ''}` },
        withCredentials: true,
      });
      localStorage.removeItem('token');
      console.log('Logout success:', response.data);
      return response.data;
    } catch (error) {
      console.error('Logout error:', {
        message: error.message,
        status: error.response?.status,
        data: error.response?.data,
      });
      localStorage.removeItem('token');
      return rejectWithValue(error.response?.data || { message: 'Logout failed' });
    }
  }
);

const authSlice = createSlice({
  name: 'auth',
  initialState: {
    user: null,
    isAuthenticated: false,
    loading: false,
    error: null,
  },
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(loginUser.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(loginUser.fulfilled, (state, action) => {
        state.loading = false;
        state.isAuthenticated = true;
        state.user = action.payload;
      })
      .addCase(loginUser.rejected, (state, action) => {
        state.loading = false;
        state.isAuthenticated = false;
        state.user = null;
        state.error = action.payload.message || 'Login failed';
      })
      .addCase(fetchCurrentUser.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchCurrentUser.fulfilled, (state, action) => {
        state.loading = false;
        state.isAuthenticated = true;
        state.user = action.payload;
      })
      .addCase(fetchCurrentUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload.message || 'Failed to fetch user';
        if (action.payload.message.includes('Unauthorized') || action.payload.message.includes('No token found')) {
          state.isAuthenticated = false;
          state.user = null;
          window.location.href = '/login';
        }
      })
      .addCase(signupUser.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(signupUser.fulfilled, (state, action) => {
        state.loading = false;
        state.isAuthenticated = true;
        state.user = action.payload;
      })
      .addCase(signupUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload.message || 'Signup failed';
      })
      .addCase(createUser.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createUser.fulfilled, (state) => {
        state.loading = false;
      })
      .addCase(createUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload.message || 'Failed to create user';
      })
      .addCase(updateUser.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateUser.fulfilled, (state) => {
        state.loading = false;
      })
      .addCase(updateUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload.message || 'Failed to update user';
      })
      .addCase(logoutUser.fulfilled, (state) => {
        state.user = null;
        state.isAuthenticated = false;
        state.error = null;
      })
      .addCase(logoutUser.rejected, (state) => {
        state.user = null;
        state.isAuthenticated = false;
        state.error = null;
      });
  },
});

export const { clearError } = authSlice.actions;
export default authSlice.reducer;