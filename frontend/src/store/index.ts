import { configureStore } from '@reduxjs/toolkit';
import authReducer from './slices/authSlice';
import customerReducer from './slices/customerSlice';
import policyReducer from './slices/policySlice';
import partnerReducer from './slices/partnerSlice';
import productReducer from './slices/productSlice';
import saleReducer from './slices/saleSlice';
import userReducer from './slices/userSlice';

export const store = configureStore({
  reducer: {
    auth: authReducer,
    customers: customerReducer,
    policies: policyReducer,
    partners: partnerReducer,
    products: productReducer,
    sales: saleReducer,
    users: userReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: ['persist/PERSIST'],
      },
    }),
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch; 