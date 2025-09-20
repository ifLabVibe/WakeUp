import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { globalStyles } from '../styles/globalStyles';

/**
 * 简单的时间选择器组件 (模拟原生DatePickerIOS)
 */
export default function TimePicker({ value, onTimeChange }) {
  const [hours, setHours] = useState(value ? parseInt(value.split(':')[0]) : 7);
  const [minutes, setMinutes] = useState(value ? parseInt(value.split(':')[1]) : 0);

  const updateTime = (newHours, newMinutes) => {
    const timeString = `${newHours.toString().padStart(2, '0')}:${newMinutes.toString().padStart(2, '0')}`;
    onTimeChange(timeString);
  };

  const handleHourChange = (delta) => {
    const newHours = (hours + delta + 24) % 24;
    setHours(newHours);
    updateTime(newHours, minutes);
  };

  const handleMinuteChange = (delta) => {
    const newMinutes = (minutes + delta + 60) % 60;
    setMinutes(newMinutes);
    updateTime(hours, newMinutes);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.label}>设置时间</Text>

      <View style={styles.timeContainer}>
        {/* 小时选择 */}
        <View style={styles.timeColumn}>
          <TouchableOpacity
            style={styles.adjustButton}
            onPress={() => handleHourChange(1)}
          >
            <Text style={styles.adjustButtonText}>▲</Text>
          </TouchableOpacity>

          <View style={styles.timeDisplay}>
            <Text style={styles.timeText}>{hours.toString().padStart(2, '0')}</Text>
          </View>

          <TouchableOpacity
            style={styles.adjustButton}
            onPress={() => handleHourChange(-1)}
          >
            <Text style={styles.adjustButtonText}>▼</Text>
          </TouchableOpacity>
        </View>

        {/* 分隔符 */}
        <Text style={styles.separator}>:</Text>

        {/* 分钟选择 */}
        <View style={styles.timeColumn}>
          <TouchableOpacity
            style={styles.adjustButton}
            onPress={() => handleMinuteChange(5)}
          >
            <Text style={styles.adjustButtonText}>▲</Text>
          </TouchableOpacity>

          <View style={styles.timeDisplay}>
            <Text style={styles.timeText}>{minutes.toString().padStart(2, '0')}</Text>
          </View>

          <TouchableOpacity
            style={styles.adjustButton}
            onPress={() => handleMinuteChange(-5)}
          >
            <Text style={styles.adjustButtonText}>▼</Text>
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.quickButtons}>
        <TouchableOpacity
          style={styles.quickButton}
          onPress={() => {
            setHours(7);
            setMinutes(0);
            updateTime(7, 0);
          }}
        >
          <Text style={styles.quickButtonText}>07:00</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.quickButton}
          onPress={() => {
            setHours(8);
            setMinutes(0);
            updateTime(8, 0);
          }}
        >
          <Text style={styles.quickButtonText}>08:00</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.quickButton}
          onPress={() => {
            setHours(6);
            setMinutes(30);
            updateTime(6, 30);
          }}
        >
          <Text style={styles.quickButtonText}>06:30</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 20,
    backgroundColor: '#1a1a1a',
    borderRadius: 12,
    marginVertical: 20,
  },

  label: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#ffffff',
    textAlign: 'center',
    marginBottom: 20,
  },

  timeContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginVertical: 20,
  },

  timeColumn: {
    alignItems: 'center',
  },

  adjustButton: {
    padding: 10,
    marginVertical: 5,
  },

  adjustButtonText: {
    fontSize: 20,
    color: '#ffffff',
    fontWeight: 'bold',
  },

  timeDisplay: {
    backgroundColor: '#333333',
    paddingHorizontal: 20,
    paddingVertical: 15,
    borderRadius: 8,
    marginVertical: 5,
    minWidth: 80,
    alignItems: 'center',
  },

  timeText: {
    fontSize: 36,
    fontWeight: 'bold',
    color: '#ffffff',
    fontFamily: 'monospace',
  },

  separator: {
    fontSize: 36,
    color: '#ffffff',
    fontWeight: 'bold',
    marginHorizontal: 10,
  },

  quickButtons: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: 20,
  },

  quickButton: {
    backgroundColor: '#333333',
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 6,
  },

  quickButtonText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: 'bold',
  },
});