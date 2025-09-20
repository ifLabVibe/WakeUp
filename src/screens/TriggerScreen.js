import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Alert,
  Animated,
  Dimensions,
  BackHandler
} from 'react-native';
import { globalStyles } from '../styles/globalStyles';
import Button from '../components/Button';
import { AlarmService } from '../services/alarmService';
import { StorageService } from '../services/storageService';

const { width, height } = Dimensions.get('window');

export default function TriggerScreen({ route, navigation }) {
  const { alarmId, triggerType, difficulty } = route.params || {
    alarmId: 'test',
    triggerType: 'shake',
    difficulty: 'normal'
  };

  const [shakeCount, setShakeCount] = useState(0);
  const [requiredShakes, setRequiredShakes] = useState(20);
  const [isShaking, setIsShaking] = useState(false);
  const [timeElapsed, setTimeElapsed] = useState(0);
  const [canSnooze, setCanSnooze] = useState(true);
  const [snoozeCount, setSnoozeCount] = useState(0);

  // 动画值
  const shakeAnimation = useRef(new Animated.Value(0)).current;
  const progressAnimation = useRef(new Animated.Value(0)).current;
  const pulseAnimation = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    // 根据难度设置所需摇晃次数
    const shakeRequirements = {
      easy: 10,
      normal: 20,
      hard: 35
    };
    setRequiredShakes(shakeRequirements[difficulty] || 20);

    // 开始计时
    const timer = setInterval(() => {
      setTimeElapsed(prev => prev + 1);
    }, 1000);

    // 开始脉冲动画
    startPulseAnimation();

    // 禁用返回按钮
    const backHandler = BackHandler.addEventListener('hardwareBackPress', () => {
      return true; // 阻止返回
    });

    // 检查当前贪睡次数
    loadSnoozeCount();

    return () => {
      clearInterval(timer);
      backHandler.remove();
    };
  }, [difficulty]);

  const loadSnoozeCount = async () => {
    try {
      const stats = await StorageService.getTodayStats();
      if (stats) {
        setSnoozeCount(stats.snoozeCount || 0);
        setCanSnooze(stats.snoozeCount < 3); // 最多3次贪睡
      }
    } catch (error) {
      console.error('加载贪睡次数失败:', error);
    }
  };

  const startPulseAnimation = () => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnimation, {
          toValue: 1.2,
          duration: 800,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnimation, {
          toValue: 1,
          duration: 800,
          useNativeDriver: true,
        }),
      ])
    ).start();
  };

  const handleShake = () => {
    if (isShaking) return;

    setIsShaking(true);
    setShakeCount(prev => {
      const newCount = prev + 1;

      // 摇晃动画
      Animated.sequence([
        Animated.timing(shakeAnimation, {
          toValue: 10,
          duration: 100,
          useNativeDriver: true,
        }),
        Animated.timing(shakeAnimation, {
          toValue: -10,
          duration: 100,
          useNativeDriver: true,
        }),
        Animated.timing(shakeAnimation, {
          toValue: 0,
          duration: 100,
          useNativeDriver: true,
        }),
      ]).start();

      // 更新进度动画
      Animated.timing(progressAnimation, {
        toValue: newCount / requiredShakes,
        duration: 200,
        useNativeDriver: false,
      }).start();

      // 检查是否完成
      if (newCount >= requiredShakes) {
        handleAlarmComplete();
      }

      return newCount;
    });

    // 重置摇晃状态
    setTimeout(() => setIsShaking(false), 300);
  };

  const handleAlarmComplete = async () => {
    try {
      await AlarmService.completeAlarm(alarmId);

      Alert.alert(
        '恭喜！',
        '成功起床！今天是美好的一天！',
        [
          {
            text: '确定',
            onPress: () => navigation.navigate('Home')
          }
        ],
        { cancelable: false }
      );
    } catch (error) {
      console.error('完成闹钟失败:', error);
      Alert.alert('错误', '操作失败，请重试');
    }
  };

  const handleSnooze = async () => {
    if (!canSnooze) {
      Alert.alert('提示', '已达到最大贪睡次数，请起床！');
      return;
    }

    try {
      const result = await AlarmService.handleSnooze(alarmId);

      Alert.alert(
        '贪睡模式',
        `将在5分钟后再次响铃\n本次\"扣款\": ¥${result.penaltyAmount}\n已贪睡: ${result.snoozeCount}次`,
        [
          {
            text: '确定',
            onPress: () => navigation.navigate('Home')
          }
        ],
        { cancelable: false }
      );
    } catch (error) {
      console.error('贪睡失败:', error);
      Alert.alert('错误', error.message || '贪睡失败');
    }
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const getProgressColor = () => {
    const progress = shakeCount / requiredShakes;
    if (progress < 0.3) return '#ff4444';
    if (progress < 0.7) return '#ffaa00';
    return '#44ff44';
  };

  const getEncouragementText = () => {
    const progress = shakeCount / requiredShakes;
    if (progress === 0) return '开始摇晃手机来关闭闹钟！';
    if (progress < 0.3) return '继续摇晃，加油！';
    if (progress < 0.7) return '很好！坚持下去！';
    if (progress < 0.9) return '快要成功了！';
    return '最后几下了！';
  };

  return (
    <View style={styles.container}>
      {/* 时间显示 */}
      <View style={styles.timeContainer}>
        <Text style={styles.timeText}>{new Date().toLocaleTimeString()}</Text>
        <Text style={styles.elapsedText}>已用时: {formatTime(timeElapsed)}</Text>
      </View>

      {/* 主要区域 */}
      <Animated.View
        style={[
          styles.mainArea,
          {
            transform: [
              { translateX: shakeAnimation },
              { scale: pulseAnimation }
            ]
          }
        ]}
      >
        <Text style={styles.alarmIcon}>⏰</Text>
        <Text style={styles.instructionText}>
          {triggerType === 'shake' ? '摇晃手机关闭闹钟' : '移动指定距离关闭闹钟'}
        </Text>

        {/* 进度显示 */}
        <View style={styles.progressContainer}>
          <Text style={styles.progressText}>
            {shakeCount} / {requiredShakes}
          </Text>
          <View style={styles.progressBarBackground}>
            <Animated.View
              style={[
                styles.progressBar,
                {
                  width: progressAnimation.interpolate({
                    inputRange: [0, 1],
                    outputRange: ['0%', '100%']
                  }),
                  backgroundColor: getProgressColor()
                }
              ]}
            />
          </View>
          <Text style={styles.encouragementText}>
            {getEncouragementText()}
          </Text>
        </View>

        {/* 摇晃按钮（用于模拟摇晃，实际应用中会使用传感器） */}
        <Button
          title="模拟摇晃"
          onPress={handleShake}
          disabled={isShaking}
          style={styles.shakeButton}
        />
      </Animated.View>

      {/* 贪睡和统计信息 */}
      <View style={styles.bottomContainer}>
        <View style={styles.statsContainer}>
          <Text style={styles.statsText}>
            已贪睡: {snoozeCount}/3 次
          </Text>
          <Text style={styles.statsText}>
            难度: {difficulty === 'easy' ? '简单' : difficulty === 'normal' ? '普通' : '困难'}
          </Text>
        </View>

        {canSnooze && (
          <Button
            title={`贪睡 5分钟 (扣款¥${(snoozeCount + 1) * 5})`}
            onPress={handleSnooze}
            variant="danger"
            style={styles.snoozeButton}
          />
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000000',
    padding: 20,
  },

  timeContainer: {
    alignItems: 'center',
    marginTop: 40,
    marginBottom: 20,
  },

  timeText: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#ffffff',
    fontFamily: 'monospace',
  },

  elapsedText: {
    fontSize: 16,
    color: '#cccccc',
    marginTop: 5,
  },

  mainArea: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 40,
  },

  alarmIcon: {
    fontSize: 80,
    marginBottom: 20,
  },

  instructionText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#ffffff',
    textAlign: 'center',
    marginBottom: 40,
    lineHeight: 32,
  },

  progressContainer: {
    width: '100%',
    alignItems: 'center',
    marginBottom: 40,
  },

  progressText: {
    fontSize: 48,
    fontWeight: 'bold',
    color: '#ffffff',
    marginBottom: 20,
    fontFamily: 'monospace',
  },

  progressBarBackground: {
    width: '80%',
    height: 20,
    backgroundColor: '#333333',
    borderRadius: 10,
    overflow: 'hidden',
    marginBottom: 20,
  },

  progressBar: {
    height: '100%',
    borderRadius: 10,
  },

  encouragementText: {
    fontSize: 18,
    color: '#ffffff',
    textAlign: 'center',
    fontWeight: 'bold',
  },

  shakeButton: {
    paddingHorizontal: 40,
    paddingVertical: 15,
  },

  bottomContainer: {
    marginBottom: 40,
  },

  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
    paddingHorizontal: 10,
  },

  statsText: {
    fontSize: 14,
    color: '#cccccc',
  },

  snoozeButton: {
    marginTop: 10,
  },
});