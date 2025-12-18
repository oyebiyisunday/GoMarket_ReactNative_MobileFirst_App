import { useDispatch, useSelector, TypedUseSelectorHook } from 'react-redux';
import type { RootState, AppDispatch } from './index';

// Use throughout your app instead of plain `useDispatch` and `useSelector`
export const useAppDispatch = () => useDispatch<AppDispatch>();
export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector;

// Type-safe hooks for specific slices
export const useAuth = () => useAppSelector((state) => state.auth);
export const useBusiness = () => useAppSelector((state) => state.business);
export const useCatalog = () => useAppSelector((state) => state.catalog);