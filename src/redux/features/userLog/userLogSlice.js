import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';
import { LOCAL_API_URL, API_URL } from '../../../utils/apiConfig';

// Thunks
export const fetchUsers = createAsyncThunk(
  'userLog/fetchUsers',
  async (_, { rejectWithValue }) => {
    try {
      const response = await axios.get(`${API_URL}/api/getallusers`);
      return response.data.users;
    } catch (error) {
      return rejectWithValue(error.response.data);
    }
  }
);

export const fetchUserById = createAsyncThunk(
  'userLog/fetchUserById',
  async (userId, { rejectWithValue }) => {
    try {
      const response = await axios.get(`${API_URL}/api/getauser/${userId}`);
      return response.data.user;
    } catch (error) {
      return rejectWithValue(error.response.data);
    }
  }
);
export const fetchUserByUserName = createAsyncThunk(
  'userLog/fetchUserByUserName',
  async(userName,{rejectWithValue})=>{
    try{
      const response = await axios.get(`${API_URL}/api/get-user-by-userName/${userName}`);
      return response.data.user;
    }catch(error){
      return rejectWithValue(error.response.data);
    }
  }  
);
export const addUser = createAsyncThunk(
  'userLog/addUser',
  async (formData, { rejectWithValue }) => {
    try {
      const response = await axios.post(`${API_URL}/api/register`, formData, {
        headers: {
          'Content-Type': 'application/json',
        },
      });
      return response.data.storeData;
    } catch (error) {
      return rejectWithValue(error.response.data);
    }
  }
);

export const updateUser = createAsyncThunk(
  'userLog/updateUser',
  async ({ userId, userData }, { rejectWithValue }) => {
    try {
      const response = await axios.patch(`${API_URL}/api/edituser/${userId}`, userData, {
        headers: {
          'Content-Type': 'application/json',
        },
      });
      return response.data.user;
    } catch (error) {
      return rejectWithValue(error.response.data);
    }
  }
);


export const deleteUser = createAsyncThunk(
  'userLog/deleteUser',
  async (userName, { rejectWithValue }) => {
    try {
      const response = await axios.delete(`${API_URL}/api/deleteuser/${userName}`);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response.data);
    }
  }
);

// Slice
const userLogSlice = createSlice({
  name: 'userLog',
  initialState: {
    users: [],
    filteredUsers: [],
    selectedUser: null,
    loading: false,
    error: null,
  },
  reducers: {
    setFilteredUsers: (state, action) => {
      state.filteredUsers = action.payload;
    },
    clearState: (state) => {
      state.loading = false;
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchUsers.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchUsers.fulfilled, (state, action) => {
        state.loading = false;
        state.users = action.payload;
        state.filteredUsers = action.payload;
      })
      .addCase(fetchUsers.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(fetchUserById.pending, (state) => {
        state.loading = true;
        state.selectedUser = null;  // Clear previous selected user
      })
      .addCase(fetchUserById.fulfilled, (state, action) => {
        state.loading = false;
        state.selectedUser = action.payload;
      })
      .addCase(fetchUserById.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message;
      })
      .addCase(fetchUserByUserName.pending,(state)=>{
        state.loading = true;
      })
      .addCase(fetchUserByUserName.fulfilled,(state,action)=>{
        state.loading = false;
        state.users = action.payload ? [action.payload] : [];
      })
      .addCase(fetchUserByUserName.rejected,(state, action) => {
        state.loading = false;
        state.error = action.error.message;
      })
      .addCase(addUser.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(addUser.fulfilled, (state, action) => {
        state.loading = false;
        state.users.push(action.payload);
      })
      .addCase(addUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(updateUser.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateUser.fulfilled, (state, action) => {
        state.loading = false;
        const index = state.users.findIndex(user => user._id === action.payload._id);
        if (index !== -1) {
          state.users[index] = action.payload;
        }
      })
      .addCase(updateUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(deleteUser.pending, (state) => {
        state.loading = true;
      })
      .addCase(deleteUser.fulfilled, (state, action) => {
        state.loading = false;
        state.users = state.users.filter(user => user.userName !== action.payload.userName);
      })
      .addCase(deleteUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message;
      });
  },
});

export const { setFilteredUsers, clearState } = userLogSlice.actions;

export default userLogSlice.reducer;

