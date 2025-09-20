import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Alert, ScrollView, Switch } from 'react-native';
import { globalStyles } from '../styles/globalStyles';
import Button from '../components/Button';
import TimePicker from '../components/TimePicker';
import { AlarmService } from '../services/alarmService';
import { StorageService } from '../services/storageService';
import { getCurrentTime } from '../utils/timeUtils';

export default function SetAlarmScreen({ navigation }) {
  const [selectedTime, setSelectedTime] = useState(getCurrentTime());
  const [alarmLabel, setAlarmLabel] = useState('起床闹钟');
  const [triggerType, setTriggerType] = useState('shake');
  const [difficulty, setDifficulty] = useState('normal');
  const [loading, setLoading] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [existingAlarm, setExistingAlarm] = useState(null);

  useEffect(() => {
    loadExistingAlarm();
  }, []);

  const loadExistingAlarm = async () => {
    try {
      const alarm = await StorageService.getAlarm();
      if (alarm) {
        setIsEditMode(true);
        setExistingAlarm(alarm);
        setSelectedTime(alarm.time);
        setAlarmLabel(alarm.label || '起床闹钟');
        setTriggerType(alarm.triggerType || 'shake');
        setDifficulty(alarm.difficulty || 'normal');
      }
    } catch (error) {
      console.error('加载现有闹钟失败:', error);
    }
  };

  const handleSaveAlarm = async () => {
    try {
      setLoading(true);

      if (isEditMode) {
        // 更新现有闹钟
        const updatedAlarm = await AlarmService.updateAlarmTime(selectedTime);
        await StorageService.updateAlarm({
          label: alarmLabel,
          triggerType,
          difficulty
        });

        Alert.alert('成功', '闹钟已更新', [
          { text: '确定', onPress: () => navigation.goBack() }
        ]);
      } else {
        // 创建新闹钟
        const alarm = await AlarmService.createAlarm(selectedTime, {
          label: alarmLabel,
          triggerType,
          difficulty
        });

        Alert.alert('成功', `闹钟已设置为 ${selectedTime}`, [
          { text: '确定', onPress: () => navigation.goBack() }
        ]);
      }
    } catch (error) {
      console.error('保存闹钟失败:', error);
      Alert.alert('错误', '保存闹钟失败，请重试');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteAlarm = async () => {
    Alert.alert(
      '确认删除',
      '确定要删除这个闹钟吗？',
      [
        { text: '取消', style: 'cancel' },
        {
          text: '删除',
          style: 'destructive',
          onPress: async () => {
            try {
              await AlarmService.cancelAlarm();
              await StorageService.removeAlarm();
              Alert.alert('成功', '闹钟已删除', [
                { text: '确定', onPress: () => navigation.goBack() }
              ]);
            } catch (error) {
              Alert.alert('错误', '删除闹钟失败');
            }
          }
        }
      ]
    );
  };

  const renderTriggerTypeSelector = () => (
    <View style={styles.sectionCard}>
      <Text style={styles.sectionTitle}>触发方式</Text>
      <Text style={styles.sectionDescription}>选择关闭闹钟的方式</Text>

      <View style={styles.optionsList}>
        <TouchableOption
          title="摇晃关闭"
          description="用力摇晃手机20秒"
          selected={triggerType === 'shake'}
          onPress={() => setTriggerType('shake')}
        />
        <TouchableOption
          title="距离关闭"
          description="起床并移动一定距离 (暂未实现)"
          selected={triggerType === 'gps'}
          onPress={() => setTriggerType('gps')}
          disabled={true}
        />
        <TouchableOption
          title="两种方式"
          description="可选择摇晃或移动 (暂未实现)"
          selected={triggerType === 'both'}
          onPress={() => setTriggerType('both')}
          disabled={true}
        />
      </View>
    </View>
  );

  const renderDifficultySelector = () => (
    <View style={styles.sectionCard}>
      <Text style={styles.sectionTitle}>难度设置</Text>
      <Text style={styles.sectionDescription}>调整关闭闹钟的难度</Text>

      <View style={styles.optionsList}>
        <TouchableOption
          title="简单"
          description="较少的摇晃次数"
          selected={difficulty === 'easy'}
          onPress={() => setDifficulty('easy')}
        />
        <TouchableOption
          title="普通"
          description="标准的摇晃次数"
          selected={difficulty === 'normal'}
          onPress={() => setDifficulty('normal')}
        />
        <TouchableOption
          title="困难"
          description="更多的摇晃次数"
          selected={difficulty === 'hard'}
          onPress={() => setDifficulty('hard')}
        />
      </View>
    </View>
  );

  return (
    <ScrollView style={globalStyles.container}>
      <Text style={globalStyles.title}>
        {isEditMode ? '编辑闹钟' : '设置闹钟'}
      </Text>

      <TimePicker
        value={selectedTime}
        onTimeChange={setSelectedTime}
      />

      {renderTriggerTypeSelector()}
      {renderDifficultySelector()}

      <View style={styles.actionButtons}>
        <Button
          title={isEditMode ? '保存修改' : '创建闹钟'}
          onPress={handleSaveAlarm}
          disabled={loading}
          style={styles.primaryButton}
        />

        {isEditMode && (
          <Button
            title="删除闹钟"
            onPress={handleDeleteAlarm}
            variant="danger"
            style={styles.deleteButton}
          />
        )}

        <Button
          title="取消"
          onPress={() => navigation.goBack()}
          variant="secondary"
          style={styles.cancelButton}
        />
      </View>
    </ScrollView>
  );
}

// 可触摸选项组件
function TouchableOption({ title, description, selected, onPress, disabled = false }) {
  return (
    <TouchableOpacity
      style={[
        styles.option,
        selected && styles.selectedOption,
        disabled && styles.disabledOption
      ]}
      onPress={disabled ? null : onPress}
      disabled={disabled}
    >
      <View style={styles.optionContent}>
        <Text style={[
          styles.optionTitle,
          selected && styles.selectedOptionTitle,
          disabled && styles.disabledText
        ]}>
          {title}
        </Text>
        <Text style={[
          styles.optionDescription,
          disabled && styles.disabledText
        ]}>
          {description}
        </Text>
      </View>
      <View style={[
        styles.radioButton,
        selected && styles.selectedRadioButton,
        disabled && styles.disabledRadioButton
      ]}>
        {selected && <View style={styles.radioButtonInner} />}
      </View>
    </TouchableOpacity>
  );
}

const { TouchableOpacity } = require('react-native');

const styles = StyleSheet.create({
  sectionCard: {
    ...globalStyles.card,
    marginVertical: 10,
  },

  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#ffffff',
    marginBottom: 5,
  },

  sectionDescription: {
    fontSize: 14,
    color: '#cccccc',
    marginBottom: 15,
  },

  optionsList: {
    gap: 10,
  },

  option: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 15,
    backgroundColor: '#2a2a2a',
    borderRadius: 8,
    borderWidth: 2,
    borderColor: 'transparent',
  },

  selectedOption: {
    borderColor: '#ffffff',
  },

  disabledOption: {
    opacity: 0.5,
  },

  optionContent: {
    flex: 1,
  },

  optionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#ffffff',
    marginBottom: 4,
  },

  selectedOptionTitle: {
    color: '#ffffff',
  },

  optionDescription: {
    fontSize: 14,
    color: '#cccccc',
  },

  disabledText: {
    color: '#666666',
  },

  radioButton: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: '#cccccc',
    alignItems: 'center',
    justifyContent: 'center',
  },

  selectedRadioButton: {
    borderColor: '#ffffff',
  },

  disabledRadioButton: {
    borderColor: '#666666',
  },

  radioButtonInner: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#ffffff',
  },

  actionButtons: {
    marginTop: 30,
    marginBottom: 20,
  },

  primaryButton: {
    marginBottom: 15,
  },

  deleteButton: {
    marginBottom: 15,
  },

  cancelButton: {
    marginBottom: 10,
  },
});