import React, { useState } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { globalStyles } from '../styles/globalStyles';
import Button from './Button';

/**
 * 传感器设置组件
 * 用于调整摇晃检测的敏感度和阈值
 */
export default function SensorSettings({
  threshold = 15,
  onThresholdChange,
  difficulty = 'normal',
  enabled = true
}) {
  const [currentThreshold, setCurrentThreshold] = useState(threshold);

  const thresholdPresets = {
    easy: { min: 8, max: 15, default: 12, label: '简单' },
    normal: { min: 12, max: 20, default: 15, label: '普通' },
    hard: { min: 15, max: 25, default: 18, label: '困难' }
  };

  const preset = thresholdPresets[difficulty] || thresholdPresets.normal;

  const adjustThreshold = (delta) => {
    const newThreshold = Math.max(
      preset.min,
      Math.min(preset.max, currentThreshold + delta)
    );

    if (newThreshold !== currentThreshold) {
      setCurrentThreshold(newThreshold);
      if (onThresholdChange) {
        onThresholdChange(newThreshold);
      }
    }
  };

  const resetToDefault = () => {
    setCurrentThreshold(preset.default);
    if (onThresholdChange) {
      onThresholdChange(preset.default);
    }
  };

  const getSensitivityLevel = () => {
    const ratio = (currentThreshold - preset.min) / (preset.max - preset.min);
    if (ratio < 0.3) return '非常敏感';
    if (ratio < 0.5) return '敏感';
    if (ratio < 0.7) return '标准';
    if (ratio < 0.9) return '不敏感';
    return '非常不敏感';
  };

  const getThresholdColor = () => {
    const ratio = (currentThreshold - preset.min) / (preset.max - preset.min);
    if (ratio < 0.3) return '#ff4444';
    if (ratio < 0.7) return '#ffaa00';
    return '#44ff44';
  };

  if (!enabled) {
    return (
      <View style={styles.container}>
        <Text style={styles.disabledText}>传感器已禁用</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>摇晃敏感度设置</Text>

      <View style={styles.infoContainer}>
        <Text style={styles.difficultyText}>
          当前难度: {preset.label}
        </Text>
        <Text style={styles.rangeText}>
          范围: {preset.min} - {preset.max}
        </Text>
      </View>

      <View style={styles.thresholdContainer}>
        <Text style={styles.thresholdLabel}>阈值</Text>
        <View style={styles.thresholdControls}>
          <Button
            title="-"
            onPress={() => adjustThreshold(-1)}
            disabled={currentThreshold <= preset.min}
            variant="secondary"
            style={styles.adjustButton}
          />

          <View style={styles.thresholdDisplay}>
            <Text style={[styles.thresholdValue, { color: getThresholdColor() }]}>
              {currentThreshold}
            </Text>
          </View>

          <Button
            title="+"
            onPress={() => adjustThreshold(1)}
            disabled={currentThreshold >= preset.max}
            variant="secondary"
            style={styles.adjustButton}
          />
        </View>
      </View>

      <Text style={[styles.sensitivityText, { color: getThresholdColor() }]}>
        {getSensitivityLevel()}
      </Text>

      <View style={styles.presetButtons}>
        <Button
          title="最敏感"
          onPress={() => {
            setCurrentThreshold(preset.min);
            onThresholdChange && onThresholdChange(preset.min);
          }}
          variant="secondary"
          style={styles.presetButton}
        />

        <Button
          title="默认"
          onPress={resetToDefault}
          variant="secondary"
          style={styles.presetButton}
        />

        <Button
          title="最不敏感"
          onPress={() => {
            setCurrentThreshold(preset.max);
            onThresholdChange && onThresholdChange(preset.max);
          }}
          variant="secondary"
          style={styles.presetButton}
        />
      </View>

      <View style={styles.helpContainer}>
        <Text style={styles.helpTitle}>说明:</Text>
        <Text style={styles.helpText}>
          • 阈值越低，传感器越敏感{'\n'}
          • 建议先用默认设置测试{'\n'}
          • 不同设备可能需要调整敏感度
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 20,
    backgroundColor: '#1a1a1a',
    borderRadius: 12,
    marginVertical: 10,
  },

  title: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#ffffff',
    textAlign: 'center',
    marginBottom: 15,
  },

  infoContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
  },

  difficultyText: {
    fontSize: 14,
    color: '#cccccc',
  },

  rangeText: {
    fontSize: 14,
    color: '#cccccc',
  },

  thresholdContainer: {
    alignItems: 'center',
    marginBottom: 15,
  },

  thresholdLabel: {
    fontSize: 16,
    color: '#ffffff',
    marginBottom: 10,
  },

  thresholdControls: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 15,
  },

  adjustButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    paddingHorizontal: 0,
  },

  thresholdDisplay: {
    backgroundColor: '#333333',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
    minWidth: 60,
    alignItems: 'center',
  },

  thresholdValue: {
    fontSize: 24,
    fontWeight: 'bold',
    fontFamily: 'monospace',
  },

  sensitivityText: {
    fontSize: 16,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 20,
  },

  presetButtons: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 20,
  },

  presetButton: {
    paddingHorizontal: 15,
    paddingVertical: 8,
  },

  helpContainer: {
    backgroundColor: '#333333',
    padding: 15,
    borderRadius: 8,
  },

  helpTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#ffffff',
    marginBottom: 8,
  },

  helpText: {
    fontSize: 12,
    color: '#cccccc',
    lineHeight: 18,
  },

  disabledText: {
    fontSize: 16,
    color: '#666666',
    textAlign: 'center',
    fontStyle: 'italic',
  },
});