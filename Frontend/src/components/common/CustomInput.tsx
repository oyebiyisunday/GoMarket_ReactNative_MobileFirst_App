import React from 'react';
import { TextInput, Text, View, StyleSheet, TextInputProps, ViewStyle, TextStyle } from 'react-native';
import { AppColors, AppTypography, AppSpacing } from '../../styles/AppStyles';

interface CustomInputProps extends TextInputProps {
  label?: string;
  error?: string;
  containerStyle?: ViewStyle;
  labelStyle?: TextStyle;
  inputStyle?: TextStyle;
  errorStyle?: TextStyle;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

export const CustomInput: React.FC<CustomInputProps> = ({
  label,
  error,
  containerStyle,
  labelStyle,
  inputStyle,
  errorStyle,
  leftIcon,
  rightIcon,
  ...inputProps
}) => {
  return (
    <View style={[styles.container, containerStyle]}>
      {label && <Text style={[styles.label, labelStyle]}>{label}</Text>}
      
      <View style={[styles.inputContainer, error && styles.inputError]}>
        {leftIcon && <View style={styles.leftIcon}>{leftIcon}</View>}
        
        <TextInput
          style={[
            styles.input,
            leftIcon ? styles.inputWithLeftIcon : null,
            rightIcon ? styles.inputWithRightIcon : null,
            inputStyle,
          ]}
          placeholderTextColor={AppColors.text.light}
          {...inputProps}
        />
        
        {rightIcon && <View style={styles.rightIcon}>{rightIcon}</View>}
      </View>
      
      {error && <Text style={[styles.error, errorStyle]}>{error}</Text>}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: AppSpacing.medium,
  },
  
  label: {
    fontSize: AppTypography.fontSize.body,
    fontWeight: AppTypography.fontWeight.medium,
    color: AppColors.text.primary,
    marginBottom: AppSpacing.small,
  },
  
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: AppColors.border,
    borderRadius: 8,
    backgroundColor: AppColors.background,
  },
  
  inputError: {
    borderColor: AppColors.error,
  },
  
  input: {
    flex: 1,
    paddingVertical: AppSpacing.medium,
    paddingHorizontal: AppSpacing.medium,
    fontSize: AppTypography.fontSize.body,
    color: AppColors.text.primary,
  },
  
  inputWithLeftIcon: {
    paddingLeft: AppSpacing.small,
  },
  
  inputWithRightIcon: {
    paddingRight: AppSpacing.small,
  },
  
  leftIcon: {
    paddingLeft: AppSpacing.medium,
  },
  
  rightIcon: {
    paddingRight: AppSpacing.medium,
  },
  
  error: {
    fontSize: AppTypography.fontSize.small,
    color: AppColors.error,
    marginTop: AppSpacing.small,
  },
});

export default CustomInput;