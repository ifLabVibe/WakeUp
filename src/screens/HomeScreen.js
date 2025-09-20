import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, Alert, RefreshControl, ScrollView } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { globalStyles } from '../styles/globalStyles';
import Button from '../components/Button';
import { AlarmService } from '../services/alarmService';
import { StorageService } from '../services/storageService';
import { formatTime } from '../utils/timeUtils';

export default function HomeScreen({ navigation }) {
  const [alarmStatus, setAlarmStatus] = useState({
    hasAlarm: false,
    isActive: false,
    nextAlarmTime: null,
    timeUntilAlarm: null,
    alarm: null
  });
  const [todayStats, setTodayStats] = useState(null);
  const [refreshing, setRefreshing] = useState(false);
  const [loading, setLoading] = useState(true);

  const loadData = async () => {
    try {
      const [status, stats] = await Promise.all([
        AlarmService.getAlarmStatus(),
        StorageService.getTodayStats()
      ]);

      setAlarmStatus(status);
      setTodayStats(stats);
    } catch (error) {
      console.error('加载数据失败:', error);
      Alert.alert('错误', '加载数据失败，请重试');
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadData();
    setRefreshing(false);
  };

  // 页面获得焦点时刷新数据
  useFocusEffect(
    useCallback(() => {
      loadData();
    }, [])
  );

  const handleToggleAlarm = async () => {
    try {
      const newStatus = !alarmStatus.isActive;
      await AlarmService.toggleAlarm(newStatus);
      await loadData(); // 刷新状态

      Alert.alert(
        '成功',
        newStatus ? '闹钟已启用' : '闹钟已禁用'
      );
    } catch (error) {
      console.error('切换闹钟状态失败:', error);
      Alert.alert('错误', '操作失败，请重试');
    }
  };

  const handleQuickSetAlarm = () => {
    navigation.navigate('SetAlarm');
  };

  const renderAlarmInfo = () => {
    if (!alarmStatus.hasAlarm) {
      return (
        <View style={styles.alarmCard}>
          <Text style={styles.noAlarmText}>还没有设置闹钟</Text>
          <Text style={styles.noAlarmSubText}>点击下方按钮创建您的第一个闹钟</Text>
        </View>
      );
    }

    return (
      <View style={styles.alarmCard}>
        <Text style={styles.alarmLabel}>下个闹钟</Text>
        <Text style={styles.alarmTime}>{alarmStatus.nextAlarmTime}</Text>

        <View style={styles.alarmDetails}>
          <Text style={styles.alarmDetailText}>
            状态: {alarmStatus.isActive ? '已启用' : '已禁用'}
          </Text>
          {alarmStatus.isActive && alarmStatus.timeUntilAlarm && (
            <Text style={styles.alarmDetailText}>
              距离响铃: {Math.round(alarmStatus.timeUntilAlarm / 1000 / 60)} 分钟
            </Text>
          )}
        </View>

        <Button
          title={alarmStatus.isActive ? '禁用闹钟' : '启用闹钟'}
          onPress={handleToggleAlarm}
          variant={alarmStatus.isActive ? 'danger' : 'primary'}
          style={styles.toggleButton}
        />
      </View>
    );
  };

  const renderTodayStats = () => {
    if (!todayStats) return null;

    return (
      <View style={styles.statsCard}>
        <Text style={styles.statsTitle}>今日统计</Text>

        <View style={styles.statsRow}>
          <View style={styles.statItem}>
            <Text style={styles.statValue}>
              {todayStats.wakeUpSuccess === null ? '-' :
               todayStats.wakeUpSuccess ? '✅' : '❌'}
            </Text>
            <Text style={styles.statLabel}>起床状态</Text>
          </View>

          <View style={styles.statItem}>
            <Text style={styles.statValue}>{todayStats.snoozeCount}</Text>
            <Text style={styles.statLabel}>贪睡次数</Text>
          </View>

          <View style={styles.statItem}>
            <Text style={[styles.statValue, styles.penaltyValue]}>
              ¥{todayStats.penaltyAmount}
            </Text>
            <Text style={styles.statLabel}>"扣款"金额</Text>
          </View>
        </View>
      </View>
    );
  };

  if (loading) {
    return (
      <View style={globalStyles.centerContainer}>
        <Text style={globalStyles.text}>加载中...</Text>
      </View>
    );
  }

  return (
    <ScrollView
      style={globalStyles.container}
      contentContainerStyle={styles.scrollContent}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
      }
    >
      <Text style={globalStyles.title}>唤醒闹钟</Text>

      {renderAlarmInfo()}
      {renderTodayStats()}

      <View style={styles.actionButtons}>
        <Button
          title={alarmStatus.hasAlarm ? "修改闹钟" : "设置闹钟"}
          onPress={handleQuickSetAlarm}
          style={globalStyles.marginVertical}
        />

        <Button
          title="查看统计"
          onPress={() => navigation.navigate('Stats')}
          variant="secondary"
          style={globalStyles.marginVertical}
        />

        {__DEV__ && (
          <Button
            title="测试闹钟触发"
            onPress={() => navigation.navigate('Trigger')}
            variant="secondary"
            style={globalStyles.marginVertical}
          />
        )}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scrollContent: {
    paddingBottom: 20,
  },

  alarmCard: {
    ...globalStyles.card,
    alignItems: 'center',
    marginVertical: 20,
  },

  noAlarmText: {
    fontSize: 18,
    color: '#ffffff',
    textAlign: 'center',
    marginBottom: 10,
  },

  noAlarmSubText: {
    fontSize: 14,
    color: '#cccccc',
    textAlign: 'center',
  },

  alarmLabel: {
    fontSize: 16,
    color: '#cccccc',
    marginBottom: 10,
  },

  alarmTime: {
    fontSize: 48,
    fontWeight: 'bold',
    color: '#ffffff',
    fontFamily: 'monospace',
    marginBottom: 15,
  },

  alarmDetails: {
    alignItems: 'center',
    marginBottom: 15,
  },

  alarmDetailText: {
    fontSize: 14,
    color: '#cccccc',
    marginVertical: 2,
  },

  toggleButton: {
    marginTop: 10,
    minWidth: 120,
  },

  statsCard: {
    ...globalStyles.card,
    marginVertical: 10,
  },

  statsTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#ffffff',
    marginBottom: 15,
    textAlign: 'center',
  },

  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },

  statItem: {
    alignItems: 'center',
  },

  statValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#ffffff',
    marginBottom: 5,
  },

  penaltyValue: {
    color: '#ff4444',
  },

  statLabel: {
    fontSize: 12,
    color: '#cccccc',
    textAlign: 'center',
  },

  actionButtons: {
    marginTop: 20,
  },
});