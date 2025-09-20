import React, { useState } from 'react';
import { View, Text, StyleSheet, Alert, ScrollView, TouchableOpacity } from 'react-native';
import { globalStyles } from '../styles/globalStyles';
import Button from '../components/Button';
import { AlarmService } from '../services/alarmService';

export default function SetAlarmScreen({ navigation }) {
  const [selectedHour, setSelectedHour] = useState(7);
  const [selectedMinute, setSelectedMinute] = useState(0);
  const [triggerType, setTriggerType] = useState('shake');
  const [difficulty, setDifficulty] = useState('normal');

  const formatTime = (hour, minute) => {
    const h = hour.toString().padStart(2, '0');
    const m = minute.toString().padStart(2, '0');
    return `${h}:${m}`;
  };

  const handleSaveAlarm = async () => {
    try {
      const alarmTime = formatTime(selectedHour, selectedMinute);

      // 创建并保存闹钟
      await AlarmService.createAlarm(alarmTime, {
        triggerType: triggerType,
        difficulty: difficulty
      });

      Alert.alert(
        '成功',
        `闹钟已设置为 ${alarmTime}\n触发方式: ${triggerType === 'shake' ? '摇晃关闭' : '距离关闭'}\n难度: ${difficulty === 'easy' ? '简单' : difficulty === 'normal' ? '普通' : '困难'}`,
        [
          { text: '确定', onPress: () => navigation.goBack() }
        ]
      );
    } catch (error) {
      console.error('保存闹钟失败:', error);
      Alert.alert(
        '错误',
        '闹钟保存失败，请重试',
        [{ text: '确定' }]
      );
    }
  };

  const renderTimePicker = () => (
    <View style={styles.timePickerCard}>
      <Text style={styles.sectionTitle}>设置时间</Text>
      <View style={styles.timeContainer}>
        <View style={styles.timeDisplay}>
          <Text style={styles.timeText}>{formatTime(selectedHour, selectedMinute)}</Text>
        </View>

        <View style={styles.timeControls}>
          <View style={styles.timeControl}>
            <Text style={styles.timeLabel}>小时</Text>
            <View style={styles.controlButtons}>
              <TouchableOpacity
                style={styles.controlButton}
                onPress={() => setSelectedHour(prev => prev > 0 ? prev - 1 : 23)}
              >
                <Text style={styles.controlButtonText}>-</Text>
              </TouchableOpacity>
              <Text style={styles.controlValue}>{selectedHour.toString().padStart(2, '0')}</Text>
              <TouchableOpacity
                style={styles.controlButton}
                onPress={() => setSelectedHour(prev => prev < 23 ? prev + 1 : 0)}
              >
                <Text style={styles.controlButtonText}>+</Text>
              </TouchableOpacity>
            </View>
          </View>

          <View style={styles.timeControl}>
            <Text style={styles.timeLabel}>分钟</Text>
            <View style={styles.controlButtons}>
              <TouchableOpacity
                style={styles.controlButton}
                onPress={() => setSelectedMinute(prev => prev > 0 ? prev - 5 : 55)}
              >
                <Text style={styles.controlButtonText}>-</Text>
              </TouchableOpacity>
              <Text style={styles.controlValue}>{selectedMinute.toString().padStart(2, '0')}</Text>
              <TouchableOpacity
                style={styles.controlButton}
                onPress={() => setSelectedMinute(prev => prev < 55 ? prev + 5 : 0)}
              >
                <Text style={styles.controlButtonText}>+</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </View>
    </View>
  );

  const renderTriggerTypeSelector = () => (
    <View style={styles.sectionCard}>
      <Text style={styles.sectionTitle}>触发方式</Text>
      <Text style={styles.sectionDescription}>选择关闭闹钟的方式</Text>

      <View style={styles.optionsList}>
        <TouchableOption
          title="摇晃关闭"
          description="用力摇晃手机来关闭"
          selected={triggerType === 'shake'}
          onPress={() => setTriggerType('shake')}
        />
        <TouchableOption
          title="距离关闭"
          description="起床并移动一定距离 (演示版本)"
          selected={triggerType === 'gps'}
          onPress={() => setTriggerType('gps')}
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
          description="较少的摇晃次数 (10次)"
          selected={difficulty === 'easy'}
          onPress={() => setDifficulty('easy')}
        />
        <TouchableOption
          title="普通"
          description="标准的摇晃次数 (20次)"
          selected={difficulty === 'normal'}
          onPress={() => setDifficulty('normal')}
        />
        <TouchableOption
          title="困难"
          description="更多的摇晃次数 (35次)"
          selected={difficulty === 'hard'}
          onPress={() => setDifficulty('hard')}
        />
      </View>
    </View>
  );

  return (
    <ScrollView style={globalStyles.container} contentContainerStyle={styles.scrollContent}>
      <Text style={globalStyles.title}>设置闹钟</Text>

      {renderTimePicker()}
      {renderTriggerTypeSelector()}
      {renderDifficultySelector()}

      <View style={styles.actionButtons}>
        <Button
          title="保存闹钟"
          onPress={handleSaveAlarm}
          style={styles.primaryButton}
        />

        <Button
          title="取消"
          onPress={() => navigation.goBack()}
          variant="secondary"
          style={styles.cancelButton}
        />
      </View>

      {/* 功能说明 */}
      <View style={styles.infoCard}>
        <Text style={styles.infoTitle}>💡 功能说明</Text>
        <Text style={styles.infoText}>
          • 本演示版本支持基本的闹钟设置{'\n'}
          • 摇晃功能在触发页面中可体验{'\n'}
          • 统计数据会保存在本地{'\n'}
          • 所有功能均为演示版本
        </Text>
      </View>
    </ScrollView>
  );
}

// 可触摸选项组件
function TouchableOption({ title, description, selected, onPress }) {
  return (
    <TouchableOpacity
      style={[
        styles.option,
        selected && styles.selectedOption
      ]}
      onPress={onPress}
    >
      <View style={styles.optionContent}>
        <Text style={[
          styles.optionTitle,
          selected && styles.selectedOptionTitle
        ]}>
          {title}
        </Text>
        <Text style={styles.optionDescription}>
          {description}
        </Text>
      </View>
      <View style={[
        styles.radioButton,
        selected && styles.selectedRadioButton
      ]}>
        {selected && <View style={styles.radioButtonInner} />}
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  scrollContent: {
    paddingBottom: 20,
  },

  timePickerCard: {
    ...globalStyles.card,
    marginVertical: 15,
  },

  timeContainer: {
    alignItems: 'center',
  },

  timeDisplay: {
    backgroundColor: '#2a2a2a',
    paddingVertical: 20,
    paddingHorizontal: 40,
    borderRadius: 12,
    marginBottom: 20,
  },

  timeText: {
    fontSize: 48,
    fontWeight: 'bold',
    color: '#ffffff',
    fontFamily: 'monospace',
  },

  timeControls: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: '100%',
  },

  timeControl: {
    alignItems: 'center',
  },

  timeLabel: {
    fontSize: 16,
    color: '#cccccc',
    marginBottom: 10,
  },

  controlButtons: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 15,
  },

  controlButton: {
    width: 40,
    height: 40,
    backgroundColor: '#ffffff',
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },

  controlButtonText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#000000',
  },

  controlValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#ffffff',
    minWidth: 40,
    textAlign: 'center',
  },

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
    backgroundColor: '#3a3a3a',
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

  cancelButton: {
    marginBottom: 10,
  },

  infoCard: {
    ...globalStyles.card,
    marginVertical: 10,
    backgroundColor: '#1a3d5c',
  },

  infoTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#ffffff',
    marginBottom: 10,
  },

  infoText: {
    fontSize: 14,
    color: '#cccccc',
    lineHeight: 20,
  },
});