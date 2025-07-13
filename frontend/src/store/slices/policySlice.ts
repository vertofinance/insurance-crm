import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';

export interface Policy {
  id: string;
  policyNumber: string;
  customerId: string;
  productId: string;
  partnerId: string;
  status: 'ACTIVE' | 'PENDING' | 'EXPIRED' | 'CANCELLED';
  premium: number;
  coverage: number;
  startDate: string;
  endDate: string;
  createdAt: string;
  updatedAt: string;
}

interface PolicyState {
  policies: Policy[];
  currentPolicy: Policy | null;
  loading: boolean;
  error: string | null;
  totalCount: number;
}

const initialState: PolicyState = {
  policies: [],
  currentPolicy: null,
  loading: false,
  error: null,
  totalCount: 0,
};

const policySlice = createSlice({
  name: 'policies',
  initialState,
  reducers: {
    setCurrentPolicy: (state, action: PayloadAction<Policy | null>) => {
      state.currentPolicy = action.payload;
    },
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    // Add async thunks here when implemented
  },
});

export const { setCurrentPolicy, clearError } = policySlice.actions;
export default policySlice.reducer; 