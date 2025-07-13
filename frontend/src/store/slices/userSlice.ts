import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: string;
  agencyId: string;
  isActive: boolean;
  lastLogin?: string;
  createdAt: string;
  agency?: {
    id: string;
    name: string;
    code: string;
  };
}

interface UserState {
  users: User[];
  currentUser: User | null;
  loading: boolean;
  error: string | null;
  totalCount: number;
}

const initialState: UserState = {
  users: [],
  currentUser: null,
  loading: false,
  error: null,
  totalCount: 0,
};

const userSlice = createSlice({
  name: 'users',
  initialState,
  reducers: {
    setCurrentUser: (state, action: PayloadAction<User | null>) => {
      state.currentUser = action.payload;
    },
    clearError: (state) => {
      state.error = null;
    },
  },
});

export const { setCurrentUser, clearError } = userSlice.actions;
export default userSlice.reducer; 