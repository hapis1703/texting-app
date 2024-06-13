import {createSlice} from '@reduxjs/toolkit';

export const userSlice = createSlice({
  name: 'user',
  initialState: {
    isLogin: false,
  },
  reducers: {
    userSignIn: state => {
      state.isLogin = true;
    },
    userSignOut: state => {
      state.isLogin = false;
    },
  },
});

export const {userSignIn, userSignOut} = userSlice.actions;
export default userSlice.reducer;
