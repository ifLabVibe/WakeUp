import AsyncStorage from '@react-native-async-storage/async-storage';
import { APP_CONFIG, DEFAULT_ALARM } from '../utils/constants';
import { validateAlarm, validateStats, sanitizeAlarm, sanitizeStats } from '../utils/validators';
import { generateId, getTodayDateString } from '../utils/timeUtils';

/**
 * 本地存储服务
 */
export class StorageService {
  static KEYS = APP_CONFIG.STORAGE_KEYS;

  /**
   * 创建新闹钟
   * @param {Object} alarmConfig - 闹钟配置
   * @returns {Object} 创建的闹钟对象
   */
  static async createAlarm(alarmConfig) {
    try {
      const alarm = {
        id: generateId(),
        time: alarmConfig.time,
        isActive: true,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        snoozeCount: 0,
        lastSnoozeTime: null,
        ...DEFAULT_ALARM,
        ...alarmConfig
      };

      // 验证数据
      const validation = validateAlarm(alarm);
      if (!validation.isValid) {
        throw new Error(`数据验证失败: ${validation.errors.join(', ')}`);
      }

      // 清理并保存
      const cleanAlarm = sanitizeAlarm(alarm);
      await this.saveAlarm(cleanAlarm);

      console.log('新闹钟创建成功:', cleanAlarm.id);
      return cleanAlarm;
    } catch (error) {
      console.error('创建闹钟失败:', error);
      throw error;
    }
  }

  /**
   * 保存闹钟数据
   * @param {Object} alarm - 闹钟对象
   */
  static async saveAlarm(alarm) {
    try {
      // 验证和清理数据
      const validation = validateAlarm(alarm);
      if (!validation.isValid) {
        throw new Error(`数据验证失败: ${validation.errors.join(', ')}`);
      }

      const cleanAlarm = sanitizeAlarm(alarm);
      cleanAlarm.updatedAt = new Date().toISOString();

      const alarmData = JSON.stringify(cleanAlarm);
      await AsyncStorage.setItem(this.KEYS.CURRENT_ALARM, alarmData);
      console.log('闹钟数据保存成功');
      return cleanAlarm;
    } catch (error) {
      console.error('保存闹钟数据失败:', error);
      throw error;
    }
  }

  /**
   * 获取当前闹钟
   * @returns {Object|null} 闹钟对象或null
   */
  static async getAlarm() {
    try {
      const alarmData = await AsyncStorage.getItem(this.KEYS.CURRENT_ALARM);
      if (!alarmData) return null;

      const alarm = JSON.parse(alarmData);

      // 验证数据完整性
      const validation = validateAlarm(alarm);
      if (!validation.isValid) {
        console.warn('闹钟数据不完整，使用默认值修复');
        return sanitizeAlarm(alarm);
      }

      return alarm;
    } catch (error) {
      console.error('获取闹钟数据失败:', error);
      return null;
    }
  }

  /**
   * 更新闹钟配置
   * @param {Object} updates - 要更新的字段
   * @returns {Object} 更新后的闹钟对象
   */
  static async updateAlarm(updates) {
    try {
      const currentAlarm = await this.getAlarm();
      if (!currentAlarm) {
        throw new Error('未找到要更新的闹钟');
      }

      const updatedAlarm = {
        ...currentAlarm,
        ...updates,
        updatedAt: new Date().toISOString()
      };

      return await this.saveAlarm(updatedAlarm);
    } catch (error) {
      console.error('更新闹钟失败:', error);
      throw error;
    }
  }

  /**
   * 删除闹钟数据
   */
  static async removeAlarm() {
    try {
      await AsyncStorage.removeItem(this.KEYS.CURRENT_ALARM);
      console.log('闹钟数据删除成功');
    } catch (error) {
      console.error('删除闹钟数据失败:', error);
    }
  }

  /**
   * 记录贪睡行为
   * @param {string} alarmId - 闹钟ID
   * @returns {Object} 更新后的统计信息
   */
  static async recordSnooze(alarmId) {
    try {
      const today = getTodayDateString();
      const stats = await this.getStats();

      // 初始化今日数据
      if (!stats[today]) {
        stats[today] = {
          date: today,
          wakeUpSuccess: false,
          snoozeCount: 0,
          penaltyAmount: 0,
          triggerTime: new Date().toISOString(),
          completeTime: null,
          triggerType: 'shake'
        };
      }

      // 更新贪睡数据
      stats[today].snoozeCount += 1;
      stats[today].penaltyAmount += APP_CONFIG.SNOOZE_PENALTY;

      // 更新闹钟的贪睡计数
      const alarm = await this.getAlarm();
      if (alarm && alarm.id === alarmId) {
        await this.updateAlarm({
          snoozeCount: (alarm.snoozeCount || 0) + 1,
          lastSnoozeTime: new Date().toISOString()
        });
      }

      await this.saveStats(stats);
      console.log('贪睡行为记录成功');

      return {
        snoozeCount: stats[today].snoozeCount,
        totalPenalty: stats[today].penaltyAmount
      };
    } catch (error) {
      console.error('记录贪睡失败:', error);
      throw error;
    }
  }

  /**
   * 记录成功起床
   * @param {string} alarmId - 闹钟ID
   */
  static async recordWakeUpSuccess(alarmId) {
    try {
      const today = getTodayDateString();
      const stats = await this.getStats();

      // 初始化或更新今日数据
      if (!stats[today]) {
        stats[today] = {
          date: today,
          wakeUpSuccess: true,
          snoozeCount: 0,
          penaltyAmount: 0,
          triggerTime: new Date().toISOString(),
          completeTime: new Date().toISOString(),
          triggerType: 'shake'
        };
      } else {
        stats[today].wakeUpSuccess = true;
        stats[today].completeTime = new Date().toISOString();
      }

      // 重置闹钟的贪睡计数
      const alarm = await this.getAlarm();
      if (alarm && alarm.id === alarmId) {
        await this.updateAlarm({
          snoozeCount: 0,
          lastSnoozeTime: null
        });
      }

      await this.saveStats(stats);
      console.log('起床成功记录完成');
    } catch (error) {
      console.error('记录起床成功失败:', error);
      throw error;
    }
  }

  /**
   * 保存统计数据
   * @param {Object} stats - 统计数据对象
   */
  static async saveStats(stats) {
    try {
      // 验证每日统计数据
      for (const [date, dailyStats] of Object.entries(stats)) {
        const validation = validateStats(dailyStats);
        if (!validation.isValid) {
          console.warn(`日期 ${date} 的统计数据有问题:`, validation.errors);
          stats[date] = sanitizeStats(dailyStats);
        }
      }

      const statsData = JSON.stringify(stats);
      await AsyncStorage.setItem(this.KEYS.STATS_DATA, statsData);
      console.log('统计数据保存成功');
    } catch (error) {
      console.error('保存统计数据失败:', error);
      throw error;
    }
  }

  /**
   * 获取统计数据
   * @returns {Object} 统计数据对象
   */
  static async getStats() {
    try {
      const statsData = await AsyncStorage.getItem(this.KEYS.STATS_DATA);
      return statsData ? JSON.parse(statsData) : {};
    } catch (error) {
      console.error('获取统计数据失败:', error);
      return {};
    }
  }

  /**
   * 获取今日统计
   * @returns {Object} 今日统计数据
   */
  static async getTodayStats() {
    try {
      const today = getTodayDateString();
      const allStats = await this.getStats();
      return allStats[today] || {
        date: today,
        wakeUpSuccess: null,
        snoozeCount: 0,
        penaltyAmount: 0,
        triggerTime: null,
        completeTime: null,
        triggerType: 'shake'
      };
    } catch (error) {
      console.error('获取今日统计失败:', error);
      return null;
    }
  }

  /**
   * 清除所有数据（用于测试）
   */
  static async clearAll() {
    try {
      await AsyncStorage.multiRemove([
        this.KEYS.CURRENT_ALARM,
        this.KEYS.STATS_DATA,
        this.KEYS.USER_SETTINGS
      ]);
      console.log('所有数据清除成功');
    } catch (error) {
      console.error('清除数据失败:', error);
    }
  }
}