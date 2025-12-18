// Example UI-focused hook
import { useContext } from 'react';
import ThemeContext from '../theme/ThemeContext';

export default function useTheme() {
  return useContext(ThemeContext);
}
