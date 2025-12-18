import React from 'react';
import { View, ActivityIndicator, Text, StyleSheet, Modal } from 'react-native';
import { AppColors, AppTypography, AppSpacing } from '../../styles/AppStyles';

interface LoadingProps {
  visible: boolean;
  text?: string;
  overlay?: boolean;
}

export const Loading: React.FC<LoadingProps> = ({
  visible,
  text = 'Loading...',
  overlay = true,
}) => {
  if (!visible) return null;

  const content = (
    <View style={styles.container}>
      <View style={styles.content}>
        <ActivityIndicator size="large" color={AppColors.primary} />
        {text && <Text style={styles.text}>{text}</Text>}
      </View>
    </View>
  );

  if (overlay) {
    return (
      <Modal transparent visible={visible} animationType="fade">
        {content}
      </Modal>
    );
  }

  return content;
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  
  content: {
    backgroundColor: AppColors.background,
    padding: AppSpacing.xlarge,
    borderRadius: 12,
    alignItems: 'center',
    minWidth: 120,
  },
  
  text: {
    marginTop: AppSpacing.medium,
    fontSize: AppTypography.fontSize.body,
    color: AppColors.text.primary,
    textAlign: 'center',
  },
});

export default Loading;