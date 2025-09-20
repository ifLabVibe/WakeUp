import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, ScrollView, RefreshControl, Alert } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { globalStyles } from '../styles/globalStyles';
import Button from '../components/Button';
import { StorageService } from '../services/storageService';
import { PenaltyService } from '../services/penaltyService';
import { StatsService } from '../services/statsService';

export default function StatsScreen({ navigation }) {
  const [weeklyStats, setWeeklyStats] = useState([]);
  const [totalStats, setTotalStats] = useState({
    totalPenalty: 0,
    totalSnoozes: 0,
    successRate: 0,
    successDays: 0,
    totalDays: 0
  });
  const [refreshing, setRefreshing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [summaryReport, setSummaryReport] = useState(null);
  const [monthlyStats, setMonthlyStats] = useState(null);
  const [todayStats, setTodayStats] = useState(null);

  const loadStats = async () => {
    try {
      // 使用 StatsService 加载统计数据
      const [
        weekly,
        total,
        today
      ] = await Promise.all([
        StatsService.getWeeklyStats(),
        StatsService.getTotalStats(),
        StorageService.getTodayStats()
      ]);

      // 更新状态
      setWeeklyStats(weekly);
      setTotalStats(total);
      setTodayStats(today);
    } catch (error) {
      console.error('加载统计数据失败:', error);
      Alert.alert('错误', '加载数据失败，请重试');
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadStats();
    setRefreshing(false);
  };

  useFocusEffect(
    useCallback(() => {
      loadStats();
    }, [])
  );

  const handleClearData = () => {
    Alert.alert(
      '确认清除',
      '确定要清除所有统计数据吗？此操作不可恢复。',
      [
        { text: '取消', style: 'cancel' },
        {
          text: '确认清除',
          style: 'destructive',
          onPress: async () => {
            try {
              await StorageService.clearAll();
              await loadStats();
              Alert.alert('成功', '所有数据已清除');
            } catch (error) {
              Alert.alert('错误', '清除数据失败');
            }
          }
        }
      ]
    );
  };

  const getStatusColor = (wakeUpSuccess) => {
    if (wakeUpSuccess === true) return '#4CAF50'; // 绿色 - 成功
    if (wakeUpSuccess === false) return '#F44336'; // 红色 - 失败
    return '#9E9E9E'; // 灰色 - 无数据
  };

  const getStatusText = (wakeUpSuccess) => {
    if (wakeUpSuccess === true) return '✅';
    if (wakeUpSuccess === false) return '❌';
    return '⚪';
  };

  const renderSummaryCard = () => (
    <View style={styles.summaryCard}>
      <Text style={styles.cardTitle}>总体数据</Text>
      <View style={styles.summaryRow}>
        <View style={styles.summaryItem}>
          <Text style={styles.summaryValue}>{totalStats.successRate}%</Text>
          <Text style={styles.summaryLabel}>成功率</Text>
        </View>
        <View style={styles.summaryItem}>
          <Text style={styles.summaryValue}>{totalStats.totalSnoozes}</Text>
          <Text style={styles.summaryLabel}>总贪睡次数</Text>
        </View>
        <View style={styles.summaryItem}>
          <Text style={[styles.summaryValue, styles.penaltyValue]}>
            ¥{totalStats.totalPenalty}
          </Text>
          <Text style={styles.summaryLabel}>累计"扣款"</Text>
        </View>
      </View>
      <View style={styles.summaryFooter}>
        <Text style={styles.summaryFooterText}>
          总共 {totalStats.totalDays} 天记录，成功 {totalStats.successDays} 天
        </Text>
      </View>
    </View>
  );

  const renderTodayCard = () => (
    <View style={styles.todayCard}>
      <Text style={styles.cardTitle}>今日数据</Text>
      {todayStats ? (
        <View style={styles.todayContent}>
          <View style={styles.todayStatus}>
            <Text style={styles.todayStatusText}>
              {todayStats.wakeUpSuccess === true ? '✅ 今日成功起床' :
               todayStats.wakeUpSuccess === false ? '❌ 今日有贪睡' :
               '⚪ 今日暂无记录'}
            </Text>
          </View>
          <View style={styles.todayStatsRow}>
            <View style={styles.todayStatItem}>
              <Text style={styles.todayStatValue}>{todayStats.snoozeCount}</Text>
              <Text style={styles.todayStatLabel}>贪睡次数</Text>
            </View>
            <View style={styles.todayStatItem}>
              <Text style={[styles.todayStatValue, styles.penaltyValue]}>
                ¥{todayStats.penaltyAmount || 0}
              </Text>
              <Text style={styles.todayStatLabel}>扣款金额</Text>
            </View>
          </View>
        </View>
      ) : (
        <Text style={styles.noDataText}>暂无今日数据</Text>
      )}
    </View>
  );

  const renderMonthlyCard = () => (
    <View style={styles.monthlyCard}>
      <Text style={styles.cardTitle}>本月数据</Text>
      <View style={styles.monthlyContent}>
        <Text style={styles.noDataText}>月度统计功能开发中...</Text>
      </View>
    </View>
  );

  const renderInsightsCard = () => (
    <View style={styles.insightsCard}>
      <Text style={styles.cardTitle}>智能洞察</Text>
      <Text style={styles.noDataText}>智能分析功能开发中...</Text>
    </View>
  );

  const renderWeeklyCard = () => (
    <View style={styles.weeklyCard}>
      <Text style={styles.cardTitle}>本周记录</Text>
      <View style={styles.weeklyHeader}>
        <Text style={styles.headerText}>日期</Text>
        <Text style={styles.headerText}>状态</Text>
        <Text style={styles.headerText}>贪睡</Text>
        <Text style={styles.headerText}>"扣款"</Text>
      </View>
      {weeklyStats.map((item, index) => (
        <View
          key={item.date}
          style={[
            styles.dayItem,
            item.isToday && styles.todayItem
          ]}
        >
          <Text style={[styles.dayText, item.isToday && styles.todayText]}>
            {item.dayName}
          </Text>
          <View style={styles.statusContainer}>
            <Text style={styles.statusText}>
              {getStatusText(item.wakeUpSuccess)}
            </Text>
            <View style={[
              styles.statusIndicator,
              { backgroundColor: getStatusColor(item.wakeUpSuccess) }
            ]} />
          </View>
          <Text style={[styles.dataText, item.isToday && styles.todayText]}>
            {item.snoozeCount > 0 ? `${item.snoozeCount}次` : '-'}
          </Text>
          <Text style={[styles.penaltyText, item.isToday && styles.todayText]}>
            {item.penaltyAmount > 0 ? `¥${item.penaltyAmount}` : '-'}
          </Text>
        </View>
      ))}
    </View>
  );

  const renderInfoCard = () => (
    <View style={styles.infoCard}>
      <Text style={styles.cardTitle}>说明</Text>
      <Text style={styles.infoText}>
        • ✅ 成功起床，无贪睡{'\n'}
        • ❌ 有贪睡行为{'\n'}
        • ⚪ 无闹钟记录{'\n'}
        • 扣款为模拟显示，不会真实扣费{'\n'}
        • 数据仅保存在本地设备
      </Text>
    </View>
  );

  if (loading) {
    return (
      <View style={globalStyles.centerContainer}>
        <Text style={globalStyles.text}>加载统计数据中...</Text>
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
      <Text style={globalStyles.title}>起床统计</Text>

      {renderSummaryCard()}
      {renderTodayCard()}
      {renderMonthlyCard()}
      {renderWeeklyCard()}
      {renderInsightsCard()}

      {/* 数据统计信息 */}
      <View style={styles.penaltySection}>
        <Text style={styles.cardTitle}>数据总览</Text>
        <Text style={styles.summaryText}>
          本周共有 {weeklyStats.filter(item => item.penaltyAmount > 0).length} 天有扣款记录
        </Text>
      </View>

      {renderInfoCard()}

      <View style={styles.actionButtons}>
        <Button
          title="返回主页"
          onPress={() => navigation.navigate('Home')}
          style={styles.actionButton}
        />

        {__DEV__ && (
          <Button
            title="清除所有数据"
            onPress={handleClearData}
            variant="danger"
            style={styles.actionButton}
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

  summaryCard: {
    ...globalStyles.card,
    marginVertical: 15,
  },

  cardTitle: {
    color: '#ffffff',
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 15,
    textAlign: 'center',
  },

  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 10,
  },

  summaryItem: {
    alignItems: 'center',
  },

  summaryValue: {
    color: '#ffffff',
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 5,
  },

  penaltyValue: {
    color: '#F44336',
  },

  summaryLabel: {
    color: '#cccccc',
    fontSize: 12,
    textAlign: 'center',
  },

  summaryFooter: {
    marginTop: 15,
    paddingTop: 15,
    borderTopWidth: 1,
    borderTopColor: '#333333',
  },

  summaryFooterText: {
    color: '#cccccc',
    fontSize: 14,
    textAlign: 'center',
  },

  weeklyCard: {
    ...globalStyles.card,
    marginVertical: 10,
  },

  weeklyHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#333333',
    marginBottom: 10,
  },

  headerText: {
    color: '#cccccc',
    fontSize: 14,
    fontWeight: 'bold',
    flex: 1,
    textAlign: 'center',
  },

  dayItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 5,
    borderRadius: 6,
    marginVertical: 2,
  },

  todayItem: {
    backgroundColor: '#2a2a2a',
  },

  dayText: {
    color: '#ffffff',
    fontSize: 14,
    flex: 1,
    textAlign: 'center',
  },

  todayText: {
    fontWeight: 'bold',
    color: '#ffffff',
  },

  statusContainer: {
    flex: 1,
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'center',
  },

  statusText: {
    fontSize: 16,
    marginRight: 5,
  },

  statusIndicator: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },

  dataText: {
    color: '#ffffff',
    fontSize: 14,
    flex: 1,
    textAlign: 'center',
  },

  penaltyText: {
    color: '#F44336',
    fontSize: 14,
    flex: 1,
    textAlign: 'center',
  },

  infoCard: {
    ...globalStyles.card,
    marginVertical: 10,
  },

  infoText: {
    color: '#cccccc',
    fontSize: 14,
    lineHeight: 20,
  },

  actionButtons: {
    marginTop: 20,
  },

  actionButton: {
    marginVertical: 8,
  },

  penaltySection: {
    ...globalStyles.card,
    marginVertical: 15,
  },

  settingsSection: {
    marginVertical: 10,
    alignItems: 'center',
  },

  settingsButton: {
    width: '50%',
  },

  penaltySettingsSection: {
    ...globalStyles.card,
    marginVertical: 10,
  },

  // 今日数据卡片样式
  todayCard: {
    ...globalStyles.card,
    marginVertical: 10,
    backgroundColor: '#1e3a8a', // 深蓝色背景
  },

  todayContent: {
    alignItems: 'center',
  },

  todayStatus: {
    marginBottom: 15,
  },

  todayStatusText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#ffffff',
    textAlign: 'center',
  },

  todayStatsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: '100%',
  },

  todayStatItem: {
    alignItems: 'center',
  },

  todayStatValue: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#ffffff',
    marginBottom: 5,
  },

  todayStatLabel: {
    fontSize: 12,
    color: '#cccccc',
  },

  // 月度数据卡片样式
  monthlyCard: {
    ...globalStyles.card,
    marginVertical: 10,
    backgroundColor: '#065f46', // 深绿色背景
  },

  monthlyContent: {
    alignItems: 'center',
  },

  monthlyStatsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: '100%',
  },

  monthlyStatItem: {
    alignItems: 'center',
  },

  monthlyStatValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#ffffff',
    marginBottom: 5,
  },

  monthlyStatLabel: {
    fontSize: 12,
    color: '#cccccc',
  },

  // 智能洞察样式
  insightsCard: {
    ...globalStyles.card,
    marginVertical: 15,
    backgroundColor: '#374151',
  },

  insightItem: {
    padding: 12,
    marginVertical: 5,
    borderRadius: 8,
    borderLeftWidth: 4,
  },

  insight_success: {
    backgroundColor: '#065f46',
    borderLeftColor: '#10b981',
  },

  insight_warning: {
    backgroundColor: '#92400e',
    borderLeftColor: '#f59e0b',
  },

  insight_danger: {
    backgroundColor: '#7f1d1d',
    borderLeftColor: '#ef4444',
  },

  insight_financial: {
    backgroundColor: '#7c2d12',
    borderLeftColor: '#ea580c',
  },

  insight_achievement: {
    backgroundColor: '#4c1d95',
    borderLeftColor: '#8b5cf6',
  },

  insight_motivation: {
    backgroundColor: '#1e40af',
    borderLeftColor: '#3b82f6',
  },

  insightTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#ffffff',
    marginBottom: 4,
  },

  insightMessage: {
    fontSize: 13,
    color: '#e5e7eb',
    lineHeight: 18,
  },

  // 通用样式
  noDataText: {
    color: '#9ca3af',
    fontSize: 14,
    textAlign: 'center',
    padding: 20,
  },

  summaryText: {
    color: '#ffffff',
    fontSize: 14,
    textAlign: 'center',
    padding: 10,
  },
});