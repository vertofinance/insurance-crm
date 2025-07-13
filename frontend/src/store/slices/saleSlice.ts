import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export interface Sale {
  id: string;
  policyId: string;
  userId: string;
  amount: number;
  commission: number;
  saleDate: string;
  createdAt: string;
  updatedAt: string;
}

interface SaleState {
  sales: Sale[];
  currentSale: Sale | null;
  loading: boolean;
  error: string | null;
  totalCount: number;
}

const initialState: SaleState = {
  sales: [],
  currentSale: null,
  loading: false,
  error: null,
  totalCount: 0,
};

const saleSlice = createSlice({
  name: 'sales',
  initialState,
  reducers: {
    setCurrentSale: (state, action: PayloadAction<Sale | null>) => {
      state.currentSale = action.payload;
    },
    clearError: (state) => {
      state.error = null;
    },
  },
});

export const { setCurrentSale, clearError } = saleSlice.actions;
export default saleSlice.reducer; 