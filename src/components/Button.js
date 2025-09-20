import React, { useState } from 'react';
import { TouchableOpacity, Text, StyleSheet, ActivityIndicator, View, Animated } from 'react-native';
import { globalStyles } from '../styles/globalStyles';

/**
 * 增强的通用按钮组件
 * 支持加载状态、动画反馈、防重复点击等功能
 */
export default function Button({
  title,
  onPress,
  style,
  textStyle,
  variant = 'primary',
  disabled = false,
  loading = false,
  loadingText = '处理中...',
  debounceMs = 300, // 防重复点击间隔
  showFeedback = true // 是否显示点击反馈动画
}) {
  const [lastPressTime, setLastPressTime] = useState(0);
  const [isPressed, setIsPressed] = useState(false);
  const scaleValue = useState(new Animated.Value(1))[0];

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

  const getLoadingColor = () => {
    switch (variant) {
      case 'secondary':
        return '#ffffff';
      case 'danger':
        return '#ffffff';
      default:
        return '#000000';
    }
  };

  const handlePress = () => {
    if (loading || disabled) return;

    const now = Date.now();
    if (now - lastPressTime < debounceMs) {
      return; // 防重复点击
    }

    setLastPressTime(now);

    if (showFeedback) {
      setIsPressed(true);

      // 按压动画
      Animated.sequence([
        Animated.timing(scaleValue, {
          toValue: 0.95,
          duration: 100,
          useNativeDriver: true,
        }),
        Animated.timing(scaleValue, {
          toValue: 1,
          duration: 100,
          useNativeDriver: true,
        }),
      ]).start(() => {
        setIsPressed(false);
      });
    }

    if (onPress) {
      onPress();
    }
  };

  const renderContent = () => {
    if (loading) {
      return (
        <View style={styles.loadingContainer}>
          <ActivityIndicator
            size="small"
            color={getLoadingColor()}
            style={styles.loadingIndicator}
          />
          <Text style={[getTextStyle(), textStyle, styles.loadingText]}>
            {loadingText}
          </Text>
        </View>
      );
    }

    return (
      <Text style={[getTextStyle(), textStyle]}>
        {title}
      </Text>
    );
  };

  const buttonStyle = [
    getButtonStyle(),
    (disabled || loading) && styles.disabled,
    isPressed && styles.pressed,
    style
  ];

  if (showFeedback) {
    return (
      <Animated.View style={{ transform: [{ scale: scaleValue }] }}>
        <TouchableOpacity
          style={buttonStyle}
          onPress={handlePress}
          disabled={disabled || loading}
          activeOpacity={0.8}
        >
          {renderContent()}
        </TouchableOpacity>
      </Animated.View>
    );
  }

  return (
    <TouchableOpacity
      style={buttonStyle}
      onPress={handlePress}
      disabled={disabled || loading}
      activeOpacity={0.8}
    >
      {renderContent()}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  disabled: {
    opacity: 0.5,
  },

  pressed: {
    opacity: 0.8,
  },

  loadingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },

  loadingIndicator: {
    marginRight: 8,
  },

  loadingText: {
    opacity: 0.8,
  },
});