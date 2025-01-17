
import { createSlice } from '@reduxjs/toolkit';

const userSlice = createSlice({
  name: 'user',
  // Initialize state from localStorage if available
  initialState: localStorage.getItem('user') 
    ? JSON.parse(localStorage.getItem('user')) 
    : null,
  reducers: {
    addUser: (state, action) => {
      // Store in localStorage when adding user
      localStorage.setItem('user', JSON.stringify(action.payload));
      return action.payload;
    },
    removeUser: (state) => {
      // Clear localStorage when removing user
      localStorage.removeItem('user');
      return null;
    },
  },
});

export const { addUser, removeUser } = userSlice.actions;
export default userSlice.reducer;