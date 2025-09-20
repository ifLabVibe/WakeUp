import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { globalStyles } from '../styles/globalStyles';
import Button from '../components/Button';

export default function HomeScreen({ navigation }) {
  return (
    <ScrollView style={globalStyles.container} contentContainerStyle={styles.scrollContent}>
      <Text style={globalStyles.title}>唤醒闹钟</Text>

      {/* 闹钟状态卡片 */}
      <View style={styles.alarmCard}>
        <Text style={styles.noAlarmText}>还没有设置闹钟</Text>
        <Text style={styles.noAlarmSubText}>点击下方按钮创建您的第一个闹钟</Text>
      </View>

      {/* 今日统计卡片 */}
      <View style={styles.statsCard}>
        <Text style={styles.statsTitle}>今日统计</Text>
        <View style={styles.statsRow}>
          <View style={styles.statItem}>
            <Text style={styles.statValue}>-</Text>
            <Text style={styles.statLabel}>起床状态</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={styles.statValue}>0</Text>
            <Text style={styles.statLabel}>贪睡次数</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={[styles.statValue, styles.penaltyValue]}>¥0</Text>
            <Text style={styles.statLabel}>"扣款"金额</Text>
          </View>
        </View>
      </View>

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