import React from 'react';
import { TouchableOpacity, Text, StyleSheet } from 'react-native';
import { globalStyles } from '../styles/globalStyles';

/**
 * 通用按钮组件
 */
export default function Button({
  title,
  onPress,
  style,
  textStyle,
  variant = 'primary',
  disabled = false
}) {
  const getButtonStyle = () => {
    switch (variant) {
      case 'secondary':
        return globalStyles.secondaryButton;
      case 'danger':
        return globalStyles.dangerButton;
      default:
        return globalStyles.button;
    }
  };

  const getTextStyle = () => {
    switch (variant) {
      case 'secondary':
        return globalStyles.secondaryButtonText;
      case 'danger':
        return globalStyles.dangerButtonText;
      default:
        return globalStyles.buttonText;
    }
  };

  return (
    <TouchableOpacity
      style={[
        getButtonStyle(),
        disabled && styles.disabled,
        style
      ]}
      onPress={onPress}
      disabled={disabled}
      activeOpacity={0.7}
    >
      <Text style={[getTextStyle(), textStyle]}>
        {title}
      </Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  disabled: {
    opacity: 0.5,
  },
});