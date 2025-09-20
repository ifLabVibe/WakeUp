import AsyncStorage from '@react-native-async-storage/async-storage';
import { APP_CONFIG } from '../utils/constants';

/**
 * 本地存储服务
 */
export class StorageService {
  static KEYS = APP_CONFIG.STORAGE_KEYS;

  /**
   * 保存闹钟数据
   * @param {Object} alarm - 闹钟对象
   */
  static async saveAlarm(alarm) {
    try {
      const alarmData = JSON.stringify(alarm);
      await AsyncStorage.setItem(this.KEYS.CURRENT_ALARM, alarmData);
      console.log('闹钟数据保存成功');
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
      return alarmData ? JSON.parse(alarmData) : null;
    } catch (error) {
      console.error('获取闹钟数据失败:', error);
      return null;
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
   * 保存统计数据
   * @param {Object} stats - 统计数据对象
   */
  static async saveStats(stats) {
    try {
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