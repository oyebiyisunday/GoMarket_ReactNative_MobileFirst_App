import { StyleSheet, Dimensions, Platform } from 'react-native';

const { width, height } = Dimensions.get('window');

// Color palette
export const AppColors = {
  primary: '#120005', // near-black burgundy
  secondary: '#B30F1F', // vivid red accent
  accent: '#FF002E',
  background: '#FFFFFF',
  surface: '#FFFFFF',
  text: {
    primary: '#2A050D',
    secondary: '#B30F1F',
    light: '#8A5C6A',
    white: '#FFFFFF',
  },
  border: '#E5E5E5',
  success: '#4CAF50',
  warning: '#FF9800',
  error: '#F44336',
  info: '#2196F3',
};

// Typography
export const AppTypography = {
  fontSize: {
    tiny: 10,
    small: 12,
    body: 14,
    title: 16,
    heading: 18,
    large: 20,
    xlarge: 24,
    xxlarge: 28,
  },
  fontWeight: {
    light: '300' as const,
    normal: '400' as const,
    medium: '500' as const,
    bold: '700' as const,
  },
};

// Spacing
export const AppSpacing = {
  tiny: 4,
  small: 8,
  medium: 16,
  large: 24,
  xlarge: 32,
  xxlarge: 48,
};

// Common styles
export const AppStyles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: AppColors.background,
  },
  safeArea: {
    flex: 1,
    backgroundColor: AppColors.background,
  },
  centerContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  spaceBetween: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  // Card styles
  card: {
    backgroundColor: AppColors.surface,
    borderRadius: 8,
    padding: AppSpacing.medium,
    marginBottom: AppSpacing.medium,
    ...(Platform.OS === 'web'
      ? ({ boxShadow: '0px 2px 4px rgba(0,0,0,0.1)' } as any)
      : {}),
    elevation: 5,
  },
  // Button styles
  button: {
    backgroundColor: AppColors.primary,
    paddingVertical: AppSpacing.medium,
    paddingHorizontal: AppSpacing.large,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonText: {
    color: AppColors.text.white,
    fontSize: AppTypography.fontSize.title,
    fontWeight: AppTypography.fontWeight.medium,
  },
  secondaryButton: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: AppColors.primary,
  },
  secondaryButtonText: {
    color: AppColors.primary,
    fontSize: AppTypography.fontSize.title,
    fontWeight: AppTypography.fontWeight.medium,
  },
  // Input styles
  input: {
    borderWidth: 1,
    borderColor: AppColors.border,
    borderRadius: 8,
    paddingVertical: AppSpacing.medium,
    paddingHorizontal: AppSpacing.medium,
    fontSize: AppTypography.fontSize.body,
    backgroundColor: AppColors.background,
  },
  inputLabel: {
    fontSize: AppTypography.fontSize.body,
    fontWeight: AppTypography.fontWeight.medium,
    color: AppColors.text.primary,
    marginBottom: AppSpacing.small,
  },
  // Text styles
  title: {
    fontSize: AppTypography.fontSize.heading,
    fontWeight: AppTypography.fontWeight.bold,
    color: AppColors.text.primary,
  },
  subtitle: {
    fontSize: AppTypography.fontSize.title,
    fontWeight: AppTypography.fontWeight.medium,
    color: AppColors.text.secondary,
  },
  body: {
    fontSize: AppTypography.fontSize.body,
    color: AppColors.text.primary,
  },
  caption: {
    fontSize: AppTypography.fontSize.small,
    color: AppColors.text.light,
  },
  // Layout helpers
  padding: {
    padding: AppSpacing.medium,
  },
  paddingHorizontal: {
    paddingHorizontal: AppSpacing.medium,
  },
  paddingVertical: {
    paddingVertical: AppSpacing.medium,
  },
  margin: {
    margin: AppSpacing.medium,
  },
  marginBottom: {
    marginBottom: AppSpacing.medium,
  },
  marginTop: {
    marginTop: AppSpacing.medium,
  },
});

// Screen dimensions
export const AppDimensions = {
  screen: {
    width,
    height,
  },
  isSmallDevice: width < 375,
  isTablet: width >= 768,
};

// Common component styles
export const ComponentStyles = {
  header: {
    height: 60,
    backgroundColor: AppColors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: AppSpacing.medium,
  },
  headerTitle: {
    color: AppColors.text.white,
    fontSize: AppTypography.fontSize.heading,
    fontWeight: AppTypography.fontWeight.bold,
  },
  listItem: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    padding: AppSpacing.medium,
    backgroundColor: AppColors.background,
    borderBottomWidth: 1,
    borderBottomColor: AppColors.border,
  },
  separator: {
    height: 1,
    backgroundColor: AppColors.border,
    marginVertical: AppSpacing.small,
  },
};

export default AppStyles;
