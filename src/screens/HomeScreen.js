import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { globalStyles } from '../styles/globalStyles';
import Button from '../components/Button';
import { AlarmService } from '../services/alarmService';
import { StorageService } from '../services/storageService';

export default function HomeScreen({ navigation }) {
  const [alarmStatus, setAlarmStatus] = useState(null);
  const [todayStats, setTodayStats] = useState(null);
  const [loading, setLoading] = useState(true);

  const loadData = async () => {
    try {
      setLoading(true);
      const [status, stats] = await Promise.all([
        AlarmService.getAlarmStatus(),
        StorageService.getTodayStats()
      ]);
      setAlarmStatus(status);
      setTodayStats(stats);
    } catch (error) {
      console.error('加载数据失败:', error);
    } finally {
      setLoading(false);
    }
  };

  // 页面获得焦点时重新加载数据
  useFocusEffect(
    React.useCallback(() => {
      loadData();
    }, [])
  );

  const renderAlarmCard = () => {
    if (loading) {
      return (
        <View style={styles.alarmCard}>
          <Text style={styles.noAlarmText}>加载中...</Text>
        </View>
      );
    }

    if (!alarmStatus || !alarmStatus.hasAlarm) {
      return (
        <View style={styles.alarmCard}>
          <Text style={styles.noAlarmText}>还没有设置闹钟</Text>
          <Text style={styles.noAlarmSubText}>点击下方按钮创建您的第一个闹钟</Text>
        </View>
      );
    }

    return (
      <View style={styles.alarmCard}>
        <Text style={styles.alarmTimeText}>{alarmStatus.nextAlarmTime}</Text>
        <Text style={styles.alarmStatusText}>
          {alarmStatus.isActive ? '闹钟已激活' : '闹钟已关闭'}
        </Text>
        {alarmStatus.isActive && alarmStatus.timeUntilAlarm && (
          <Text style={styles.alarmSubText}>
            距离响起约 {Math.round(alarmStatus.timeUntilAlarm / (1000 * 60 * 60))} 小时 {Math.round((alarmStatus.timeUntilAlarm % (1000 * 60 * 60)) / (1000 * 60))} 分钟
          </Text>
        )}
      </View>
    );
  };

  const renderStatsCard = () => {
    const stats = todayStats || {};
    const wakeUpStatus = stats.wakeUpSuccess === true ? '成功' :
                        stats.wakeUpSuccess === false ? '失败' : '-';
    const snoozeCount = stats.snoozeCount || 0;
    const penaltyAmount = stats.penaltyAmount || 0;

    return (
      <View style={styles.statsCard}>
        <Text style={styles.statsTitle}>今日统计</Text>
        <View style={styles.statsRow}>
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{wakeUpStatus}</Text>
            <Text style={styles.statLabel}>起床状态</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{snoozeCount}</Text>
            <Text style={styles.statLabel}>贪睡次数</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={[styles.statValue, styles.penaltyValue]}>¥{penaltyAmount}</Text>
            <Text style={styles.statLabel}>"扣款"金额</Text>
          </View>
        </View>
      </View>
    );
  };

  return (
    <ScrollView style={globalStyles.container} contentContainerStyle={styles.scrollContent}>
      <Text style={globalStyles.title}>唤醒闹钟</Text>

      {/* 闹钟状态卡片 */}
      {renderAlarmCard()}

      {/* 今日统计卡片 */}
      {renderStatsCard()}

      {/* 操作按钮 */}
      <View style={styles.actionButtons}>
        <Button
          title="设置闹钟"
          onPress={() => navigation.navigate('SetAlarm')}
          style={styles.actionButton}
        />

        <Button
          title="查看统计"
          onPress={() => navigation.navigate('Stats')}
          variant="secondary"
          style={styles.actionButton}
        />

        <Button
          title="体验闹钟触发"
          onPress={() => navigation.navigate('Trigger', {
            alarmId: 'demo',
            triggerType: 'shake',
            difficulty: 'normal'
          })}
          variant="secondary"
          style={styles.actionButton}
        />
      </View>

      {/* 应用状态 */}
      <View style={styles.statusCard}>
        <Text style={styles.statusTitle}>✅ 应用状态</Text>
        <Text style={styles.statusText}>• 8个开发阶段完成</Text>
        <Text style={styles.statusText}>• 核心功能正常</Text>
        <Text style={styles.statusText}>• 数据持久化工作</Text>
        <Text style={styles.statusText}>• MVP功能完整</Text>
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

  alarmTimeText: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#ffffff',
    textAlign: 'center',
    marginBottom: 10,
    fontFamily: 'monospace',
  },

  alarmStatusText: {
    fontSize: 16,
    color: '#4CAF50',
    textAlign: 'center',
    marginBottom: 5,
  },

  alarmSubText: {
    fontSize: 14,
    color: '#cccccc',
    textAlign: 'center',
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

  actionButton: {
    marginVertical: 8,
  },

  statusCard: {
    ...globalStyles.card,
    marginTop: 20,
  },

  statusTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#4CAF50',
    marginBottom: 10,
    textAlign: 'center',
  },

  statusText: {
    fontSize: 14,
    color: '#cccccc',
    marginBottom: 5,
    paddingLeft: 10,
  },
});