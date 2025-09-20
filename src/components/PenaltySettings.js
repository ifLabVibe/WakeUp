import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, Alert } from 'react-native';
import { globalStyles } from '../styles/globalStyles';
import Button from './Button';
import { StorageService } from '../services/storageService';
import { PenaltyService } from '../services/penaltyService';

/**
 * 惩罚设置组件
 * 允许用户自定义扣款规则和费率
 */
export default function PenaltySettings({ onSettingsChange }) {
  const [settings, setSettings] = useState({
    baseAmount: 5,
    penaltyType: 'progressive', // 'fixed', 'progressive', 'exponential'
    progressiveRate: 1.5,
    maxPenalty: 50,
    maxSnoozes: 3,
    enabled: true
  });

  const [previewData, setPreviewData] = useState([]);

  useEffect(() => {
    loadSettings();
  }, []);

  useEffect(() => {
    updatePreview();
  }, [settings]);

  const loadSettings = async () => {
    try {
      const savedSettings = await StorageService.getPenaltySettings();
      if (savedSettings) {
        setSettings({ ...settings, ...savedSettings });
      }
    } catch (error) {
      console.error('加载惩罚设置失败:', error);
    }
  };

  const saveSettings = async () => {
    try {
      await StorageService.savePenaltySettings(settings);

      if (onSettingsChange) {
        onSettingsChange(settings);
      }

      Alert.alert('成功', '惩罚设置已保存');
    } catch (error) {
      console.error('保存惩罚设置失败:', error);
      Alert.alert('错误', '保存设置失败');
    }
  };

  const updatePreview = () => {
    const schedule = PenaltyService.getPenaltySchedule({
      maxSnoozes: settings.maxSnoozes,
      baseAmount: settings.baseAmount,
      penaltyType: settings.penaltyType,
      progressiveRate: settings.progressiveRate,
      maxPenalty: settings.maxPenalty
    });

    setPreviewData(schedule);
  };

  const adjustSetting = (key, delta) => {
    setSettings(prev => {
      const newValue = prev[key] + delta;

      // 设置边界值
      const boundaries = {
        baseAmount: { min: 1, max: 100 },
        progressiveRate: { min: 1, max: 5 },
        maxPenalty: { min: 10, max: 500 },
        maxSnoozes: { min: 1, max: 10 }
      };

      const boundary = boundaries[key];
      if (boundary) {
        return {
          ...prev,
          [key]: Math.max(boundary.min, Math.min(boundary.max, newValue))
        };
      }

      return { ...prev, [key]: newValue };
    });
  };

  const resetToDefaults = () => {
    Alert.alert(
      '确认重置',
      '确定要重置为默认设置吗？',
      [
        { text: '取消', style: 'cancel' },
        {
          text: '重置',
          onPress: () => {
            setSettings({
              baseAmount: 5,
              penaltyType: 'progressive',
              progressiveRate: 1.5,
              maxPenalty: 50,
              maxSnoozes: 3,
              enabled: true
            });
          }
        }
      ]
    );
  };

  const renderAdjustableField = (key, label, value, unit = '') => (
    <View style={styles.fieldContainer}>
      <Text style={styles.fieldLabel}>{label}</Text>
      <View style={styles.adjustContainer}>
        <Button
          title="-"
          onPress={() => adjustSetting(key, -1)}
          variant="secondary"
          style={styles.adjustButton}
        />
        <View style={styles.valueContainer}>
          <Text style={styles.valueText}>
            {unit}{value}
          </Text>
        </View>
        <Button
          title="+"
          onPress={() => adjustSetting(key, 1)}
          variant="secondary"
          style={styles.adjustButton}
        />
      </View>
    </View>
  );

  const renderPenaltyTypeSelector = () => (
    <View style={styles.fieldContainer}>
      <Text style={styles.fieldLabel}>惩罚类型</Text>
      <View style={styles.typeSelector}>
        {[
          { key: 'fixed', label: '固定金额', desc: '每次相同扣款' },
          { key: 'progressive', label: '累进费率', desc: '逐次增加扣款' },
          { key: 'exponential', label: '指数增长', desc: '翻倍式扣款' }
        ].map(type => (
          <Button
            key={type.key}
            title={type.label}
            onPress={() => setSettings(prev => ({ ...prev, penaltyType: type.key }))}
            variant={settings.penaltyType === type.key ? 'primary' : 'secondary'}
            style={styles.typeButton}
          />
        ))}
      </View>
      <Text style={styles.typeDescription}>
        {settings.penaltyType === 'fixed' && '每次贪睡扣款金额固定'}
        {settings.penaltyType === 'progressive' && '每次贪睡扣款按倍率递增'}
        {settings.penaltyType === 'exponential' && '每次贪睡扣款翻倍增长'}
      </Text>
    </View>
  );

  const renderPreview = () => (
    <View style={styles.previewContainer}>
      <Text style={styles.previewTitle}>扣款预览</Text>
      <View style={styles.previewTable}>
        <View style={styles.previewHeader}>
          <Text style={styles.previewHeaderText}>次数</Text>
          <Text style={styles.previewHeaderText}>本次扣款</Text>
          <Text style={styles.previewHeaderText}>累计扣款</Text>
        </View>
        {previewData.map((item, index) => (
          <View key={index} style={styles.previewRow}>
            <Text style={styles.previewCell}>{item.snoozeCount}</Text>
            <Text style={[styles.previewCell, styles.penaltyAmount]}>
              ¥{item.penaltyAmount}
            </Text>
            <Text style={[styles.previewCell, styles.totalAmount]}>
              ¥{item.totalPenalty}
            </Text>
          </View>
        ))}
      </View>
    </View>
  );

  const getPenaltyTypeInfo = () => {
    const info = {
      fixed: '固定扣款，每次贪睡都是相同金额',
      progressive: '累进扣款，每次增加 基础金额 × 倍率',
      exponential: '指数扣款，每次翻倍增长（谨慎使用）'
    };
    return info[settings.penaltyType] || '';
  };

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>惩罚设置</Text>

      {/* 启用开关 */}
      <View style={styles.toggleContainer}>
        <Text style={styles.toggleLabel}>启用惩罚机制</Text>
        <Button
          title={settings.enabled ? '已启用' : '已禁用'}
          onPress={() => setSettings(prev => ({ ...prev, enabled: !prev.enabled }))}
          variant={settings.enabled ? 'primary' : 'secondary'}
          style={styles.toggleButton}
        />
      </View>

      {settings.enabled && (
        <>
          {/* 基础设置 */}
          {renderAdjustableField('baseAmount', '基础金额', settings.baseAmount, '¥')}
          {renderAdjustableField('maxSnoozes', '最大贪睡次数', settings.maxSnoozes)}
          {renderAdjustableField('maxPenalty', '最高扣款', settings.maxPenalty, '¥')}

          {/* 惩罚类型 */}
          {renderPenaltyTypeSelector()}

          {/* 累进费率（仅在累进模式下显示） */}
          {settings.penaltyType === 'progressive' && (
            <View style={styles.fieldContainer}>
              <Text style={styles.fieldLabel}>累进倍率</Text>
              <View style={styles.adjustContainer}>
                <Button
                  title="-"
                  onPress={() => adjustSetting('progressiveRate', -0.1)}
                  variant="secondary"
                  style={styles.adjustButton}
                />
                <View style={styles.valueContainer}>
                  <Text style={styles.valueText}>
                    {settings.progressiveRate.toFixed(1)}x
                  </Text>
                </View>
                <Button
                  title="+"
                  onPress={() => adjustSetting('progressiveRate', 0.1)}
                  variant="secondary"
                  style={styles.adjustButton}
                />
              </View>
            </View>
          )}

          {/* 说明信息 */}
          <View style={styles.infoContainer}>
            <Text style={styles.infoTitle}>当前模式说明</Text>
            <Text style={styles.infoText}>{getPenaltyTypeInfo()}</Text>
          </View>

          {/* 预览表格 */}
          {renderPreview()}
        </>
      )}

      {/* 操作按钮 */}
      <View style={styles.actionButtons}>
        <Button
          title="保存设置"
          onPress={saveSettings}
          style={styles.actionButton}
        />
        <Button
          title="重置默认"
          onPress={resetToDefaults}
          variant="secondary"
          style={styles.actionButton}
        />
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
  },

  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#ffffff',
    textAlign: 'center',
    marginBottom: 30,
  },

  toggleContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
    padding: 15,
    backgroundColor: '#1a1a1a',
    borderRadius: 8,
  },

  toggleLabel: {
    fontSize: 16,
    color: '#ffffff',
    fontWeight: 'bold',
  },

  toggleButton: {
    paddingHorizontal: 20,
    paddingVertical: 8,
  },

  fieldContainer: {
    marginBottom: 20,
    padding: 15,
    backgroundColor: '#1a1a1a',
    borderRadius: 8,
  },

  fieldLabel: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#ffffff',
    marginBottom: 10,
  },

  adjustContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 15,
  },

  adjustButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    paddingHorizontal: 0,
  },

  valueContainer: {
    backgroundColor: '#333333',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
    minWidth: 80,
    alignItems: 'center',
  },

  valueText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#ffffff',
    fontFamily: 'monospace',
  },

  typeSelector: {
    gap: 10,
  },

  typeButton: {
    marginVertical: 5,
  },

  typeDescription: {
    fontSize: 14,
    color: '#cccccc',
    marginTop: 10,
    textAlign: 'center',
    fontStyle: 'italic',
  },

  infoContainer: {
    backgroundColor: '#333333',
    padding: 15,
    borderRadius: 8,
    marginBottom: 20,
  },

  infoTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#ffffff',
    marginBottom: 8,
  },

  infoText: {
    fontSize: 14,
    color: '#cccccc',
    lineHeight: 20,
  },

  previewContainer: {
    marginBottom: 20,
  },

  previewTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#ffffff',
    marginBottom: 15,
    textAlign: 'center',
  },

  previewTable: {
    backgroundColor: '#1a1a1a',
    borderRadius: 8,
    overflow: 'hidden',
  },

  previewHeader: {
    flexDirection: 'row',
    backgroundColor: '#333333',
    paddingVertical: 12,
  },

  previewHeaderText: {
    flex: 1,
    textAlign: 'center',
    fontSize: 14,
    fontWeight: 'bold',
    color: '#ffffff',
  },

  previewRow: {
    flexDirection: 'row',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#333333',
  },

  previewCell: {
    flex: 1,
    textAlign: 'center',
    fontSize: 14,
    color: '#ffffff',
  },

  penaltyAmount: {
    color: '#ff6600',
    fontWeight: 'bold',
  },

  totalAmount: {
    color: '#ff4444',
    fontWeight: 'bold',
  },

  actionButtons: {
    marginTop: 20,
    gap: 15,
  },

  actionButton: {
    marginVertical: 5,
  },
});