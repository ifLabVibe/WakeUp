import { StorageService } from './storageService';
import { PenaltyService } from './penaltyService';
import { getTimeUntilTarget, formatTime } from '../utils/timeUtils';
import { APP_CONFIG } from '../utils/constants';

/**
 * 闹钟业务逻辑服务
 */
export class AlarmService {
  static currentAlarmTimeout = null;
  static isAlarmActive = false;
  static alarmSound = null;
  static navigationRef = null;

  /**
   * 创建新闹钟
   * @param {string} time - 时间 "HH:MM"
   * @param {Object} options - 可选配置
   * @returns {Object} 创建的闹钟对象
   */
  static async createAlarm(time, options = {}) {
    try {
      // 取消现有闹钟
      await this.cancelAlarm();

      // 创建新闹钟
      const alarm = await StorageService.createAlarm({
        time,
        ...options
      });

      // 调度闹钟
      await this.scheduleAlarm(alarm);

      return alarm;
    } catch (error) {
      console.error('创建闹钟失败:', error);
      throw error;
    }
  }

  /**
   * 调度闹钟
   * @param {Object} alarm - 闹钟对象
   */
  static async scheduleAlarm(alarm) {
    try {
      if (!alarm || !alarm.isActive) {
        console.log('闹钟未激活，跳过调度');
        return;
      }

      // 计算到目标时间的毫秒数
      const timeUntil = getTimeUntilTarget(alarm.time);

      console.log(`闹钟将在 ${Math.round(timeUntil / 1000)} 秒后响起`);

      // 设置定时器
      this.currentAlarmTimeout = setTimeout(() => {
        this.triggerAlarm(alarm);
      }, timeUntil);

      this.isAlarmActive = true;
      console.log(`闹钟调度成功: ${alarm.time}`);
    } catch (error) {
      console.error('调度闹钟失败:', error);
      throw error;
    }
  }

  /**
   * 触发闹钟
   * @param {Object} alarm - 闹钟对象
   */
  static async triggerAlarm(alarm) {
    try {
      console.log('闹钟触发!', alarm.time);
      this.isAlarmActive = false;

      // 播放闹钟音效
      await this.playAlarmSound();

      // 记录触发时间到统计数据
      const today = new Date().toISOString().split('T')[0];
      const stats = await StorageService.getStats();

      if (!stats[today]) {
        stats[today] = {
          date: today,
          wakeUpSuccess: false,
          snoozeCount: 0,
          penaltyAmount: 0,
          triggerTime: new Date().toISOString(),
          completeTime: null,
          triggerType: alarm.triggerType || 'shake'
        };
        await StorageService.saveStats(stats);
      }

      // 导航到触发页面
      if (this.navigationRef && this.navigationRef.current) {
        this.navigationRef.current.navigate('Trigger', {
          alarmId: alarm.id,
          triggerType: alarm.triggerType || 'shake',
          difficulty: alarm.difficulty || 'normal'
        });
      }

      console.log('🔔 闹钟响起！请完成指定动作关闭闹钟');

    } catch (error) {
      console.error('触发闹钟失败:', error);
    }
  }

  /**
   * 播放闹钟音效
   */
  static async playAlarmSound() {
    try {
      if (this.alarmSound) {
        // 停止之前的音效
        await this.alarmSound.unloadAsync();
      }

      // 加载并播放音效
      const { Audio } = await import('expo-av');

      // 设置音频模式
      await Audio.setAudioModeAsync({
        allowsRecordingIOS: false,
        staysActiveInBackground: true,
        playsInSilentModeIOS: true,
        shouldDuckAndroid: true,
        playThroughEarpieceAndroid: false,
      });

      // 加载默认闹钟音效
      const { sound } = await Audio.Sound.createAsync(
        require('../../assets/alarm.mp3'),
        {
          shouldPlay: true,
          isLooping: true,
          volume: 1.0
        }
      );

      this.alarmSound = sound;
      console.log('闹钟音效播放中...');

    } catch (error) {
      console.error('播放闹钟音效失败:', error);
      // 如果音效播放失败，使用震动作为备选
      await this.fallbackVibration();
    }
  }

  /**
   * 备选震动提醒
   */
  static async fallbackVibration() {
    try {
      const { Vibration } = await import('react-native');

      // 持续震动模式：震动1秒，停止0.5秒，重复
      const pattern = [1000, 500];
      Vibration.vibrate(pattern, true);

      console.log('使用震动作为闹钟提醒');

    } catch (error) {
      console.error('震动失败:', error);
    }
  }

  /**
   * 停止闹钟音效和震动
   */
  static async stopAlarmSound() {
    try {
      // 停止音效
      if (this.alarmSound) {
        await this.alarmSound.unloadAsync();
        this.alarmSound = null;
      }

      // 停止震动
      const { Vibration } = await import('react-native');
      Vibration.cancel();

      console.log('闹钟音效已停止');

    } catch (error) {
      console.error('停止闹钟音效失败:', error);
    }
  }

  /**
   * 设置导航引用（用于跳转到触发页面）
   * @param {Object} navigationRef - React Navigation的ref
   */
  static setNavigationRef(navigationRef) {
    this.navigationRef = navigationRef;
  }

  /**
   * 取消闹钟
   */
  static async cancelAlarm() {
    try {
      if (this.currentAlarmTimeout) {
        clearTimeout(this.currentAlarmTimeout);
        this.currentAlarmTimeout = null;
        console.log('闹钟已取消');
      }

      this.isAlarmActive = false;

      // 将闹钟设为非激活状态
      const alarm = await StorageService.getAlarm();
      if (alarm && alarm.isActive) {
        await StorageService.updateAlarm({ isActive: false });
      }
    } catch (error) {
      console.error('取消闹钟失败:', error);
    }
  }

  /**
   * 更新闹钟时间
   * @param {string} newTime - 新时间 "HH:MM"
   * @returns {Object} 更新后的闹钟对象
   */
  static async updateAlarmTime(newTime) {
    try {
      const alarm = await StorageService.getAlarm();
      if (!alarm) {
        throw new Error('未找到要更新的闹钟');
      }

      // 取消当前调度
      await this.cancelAlarm();

      // 更新时间并重新调度
      const updatedAlarm = await StorageService.updateAlarm({
        time: newTime,
        isActive: true
      });

      await this.scheduleAlarm(updatedAlarm);

      return updatedAlarm;
    } catch (error) {
      console.error('更新闹钟时间失败:', error);
      throw error;
    }
  }

  /**
   * 启用/禁用闹钟
   * @param {boolean} isActive - 是否启用
   * @returns {Object} 更新后的闹钟对象
   */
  static async toggleAlarm(isActive) {
    try {
      const alarm = await StorageService.getAlarm();
      if (!alarm) {
        throw new Error('未找到闹钟');
      }

      if (isActive) {
        // 启用闹钟
        const updatedAlarm = await StorageService.updateAlarm({ isActive: true });
        await this.scheduleAlarm(updatedAlarm);
        return updatedAlarm;
      } else {
        // 禁用闹钟
        await this.cancelAlarm();
        return await StorageService.updateAlarm({ isActive: false });
      }
    } catch (error) {
      console.error('切换闹钟状态失败:', error);
      throw error;
    }
  }

  /**
   * 获取闹钟状态信息
   * @returns {Object} 闹钟状态
   */
  static async getAlarmStatus() {
    try {
      const alarm = await StorageService.getAlarm();

      if (!alarm) {
        return {
          hasAlarm: false,
          isActive: false,
          nextAlarmTime: null,
          timeUntilAlarm: null
        };
      }

      const timeUntil = alarm.isActive ? getTimeUntilTarget(alarm.time) : null;

      return {
        hasAlarm: true,
        isActive: alarm.isActive,
        nextAlarmTime: alarm.time,
        timeUntilAlarm: timeUntil,
        alarm: alarm
      };
    } catch (error) {
      console.error('获取闹钟状态失败:', error);
      return {
        hasAlarm: false,
        isActive: false,
        nextAlarmTime: null,
        timeUntilAlarm: null
      };
    }
  }

  /**
   * 处理贪睡
   * @param {string} alarmId - 闹钟ID
   * @returns {Object} 贪睡结果
   */
  static async handleSnooze(alarmId) {
    try {
      const alarm = await StorageService.getAlarm();
      if (!alarm || alarm.id !== alarmId) {
        throw new Error('闹钟不匹配');
      }

      // 检查贪睡次数限制
      if (alarm.snoozeCount >= APP_CONFIG.MAX_SNOOZE_COUNT) {
        throw new Error('已达到最大贪睡次数');
      }

      // 记录贪睡行为，使用PenaltyService计算扣款
      const snoozeResult = await PenaltyService.recordSnooze(alarmId);

      // 重新调度闹钟（5分钟后）
      const newTime = new Date(Date.now() + APP_CONFIG.SNOOZE_INTERVAL);
      const snoozeTimeString = formatTime(newTime);

      console.log(`贪睡设置，将在 ${snoozeTimeString} 再次响起`);

      // 设置贪睡定时器
      this.currentAlarmTimeout = setTimeout(() => {
        this.triggerAlarm(alarm);
      }, APP_CONFIG.SNOOZE_INTERVAL);

      return {
        ...snoozeResult,
        nextAlarmTime: snoozeTimeString
      };
    } catch (error) {
      console.error('处理贪睡失败:', error);
      throw error;
    }
  }

  /**
   * 成功关闭闹钟
   * @param {string} alarmId - 闹钟ID
   */
  static async completeAlarm(alarmId) {
    try {
      // 停止闹钟音效
      await this.stopAlarmSound();

      // 记录成功关闭，使用PenaltyService记录
      await PenaltyService.recordWakeUpSuccess();
      await this.cancelAlarm();

      console.log('闹钟成功关闭，起床成功！');
    } catch (error) {
      console.error('完成闹钟失败:', error);
      throw error;
    }
  }

  /**
   * 恢复闹钟调度（应用重启时调用）
   */
  static async restoreAlarmSchedule() {
    try {
      const alarm = await StorageService.getAlarm();
      if (alarm && alarm.isActive) {
        const timeUntil = getTimeUntilTarget(alarm.time);

        // 如果闹钟时间已过，直接触发
        if (timeUntil <= 0) {
          this.triggerAlarm(alarm);
        } else {
          this.scheduleAlarm(alarm);
        }
      }
    } catch (error) {
      console.error('恢复闹钟调度失败:', error);
    }
  }

  /**
   * 清理所有资源
   * 应用关闭或重启时调用
   */
  static cleanup() {
    try {
      // 清理定时器
      if (this.currentAlarmTimeout) {
        clearTimeout(this.currentAlarmTimeout);
        this.currentAlarmTimeout = null;
      }

      // 停止音效
      this.stopAlarmSound();

      // 重置状态
      this.isAlarmActive = false;
      this.navigationRef = null;

      console.log('AlarmService 资源清理完成');
    } catch (error) {
      console.error('AlarmService 清理失败:', error);
    }
  }
}