import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export interface Partner {
  id: string;
  name: string;
  code: string;
  type: 'INSURANCE_COMPANY' | 'BROKER' | 'AGENT';
  status: 'ACTIVE' | 'INACTIVE';
  createdAt: string;
  updatedAt: string;
}

interface PartnerState {
  partners: Partner[];
  currentPartner: Partner | null;
  loading: boolean;
  error: string | null;
  totalCount: number;
}

const initialState: PartnerState = {
  partners: [],
  currentPartner: null,
  loading: false,
  error: null,
  totalCount: 0,
};

const partnerSlice = createSlice({
  name: 'partners',
  initialState,
  reducers: {
    setCurrentPartner: (state, action: PayloadAction<Partner | null>) => {
      state.currentPartner = action.payload;
    },
    clearError: (state) => {
      state.error = null;
    },
  },
});

export const { setCurrentPartner, clearError } = partnerSlice.actions;
export default partnerSlice.reducer; 