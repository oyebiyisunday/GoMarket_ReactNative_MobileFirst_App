import React from 'react';
import { TouchableOpacity, Text, StyleSheet, ActivityIndicator, ViewStyle, TextStyle } from 'react-native';
import { AppColors, AppTypography, AppSpacing } from '../../styles/AppStyles';

interface CustomButtonProps {
  title: string;
  onPress: () => void;
  variant?: 'primary' | 'secondary' | 'outline';
  size?: 'small' | 'medium' | 'large';
  disabled?: boolean;
  loading?: boolean;
  style?: ViewStyle;
  textStyle?: TextStyle;
  icon?: React.ReactNode;
}

export const CustomButton: React.FC<CustomButtonProps> = ({
  title,
  onPress,
  variant = 'primary',
  size = 'medium',
  disabled = false,
  loading = false,
  style,
  textStyle,
  icon,
}) => {
  const buttonStyle = [
    styles.base,
    styles[variant],
    styles[size],
    disabled && styles.disabled,
    style,
  ];

  const buttonTextStyle = [
    styles.baseText,
    styles[`${variant}Text`],
    styles[`${size}Text`],
    disabled && styles.disabledText,
    textStyle,
  ];

  return (
    <TouchableOpacity
      style={buttonStyle}
      onPress={onPress}
      disabled={disabled || loading}
      activeOpacity={0.7}
    >
      {loading ? (
        <ActivityIndicator 
          color={variant === 'primary' ? AppColors.text.white : AppColors.primary} 
          size="small" 
        />
      ) : (
        <>
          {icon && icon}
          <Text style={buttonTextStyle}>{title}</Text>
        </>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  base: {
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
  },
  
  // Variants
  primary: {
    backgroundColor: AppColors.primary,
  },
  secondary: {
    backgroundColor: AppColors.secondary,
  },
  outline: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: AppColors.primary,
  },
  
  // Sizes
  small: {
    paddingVertical: AppSpacing.small,
    paddingHorizontal: AppSpacing.medium,
  },
  medium: {
    paddingVertical: AppSpacing.medium,
    paddingHorizontal: AppSpacing.large,
  },
  large: {
    paddingVertical: AppSpacing.large,
    paddingHorizontal: AppSpacing.xlarge,
  },
  
  // Disabled state
  disabled: {
    opacity: 0.5,
  },
  
  // Text styles
  baseText: {
    fontWeight: AppTypography.fontWeight.medium,
    textAlign: 'center',
  },
  primaryText: {
    color: AppColors.text.white,
  },
  secondaryText: {
    color: AppColors.text.white,
  },
  outlineText: {
    color: AppColors.primary,
  },
  disabledText: {
    opacity: 0.7,
  },
  
  // Text sizes
  smallText: {
    fontSize: AppTypography.fontSize.small,
  },
  mediumText: {
    fontSize: AppTypography.fontSize.body,
  },
  largeText: {
    fontSize: AppTypography.fontSize.title,
  },
});

export default CustomButton;