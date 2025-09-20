import { StorageService } from './storageService';
import { APP_CONFIG } from '../utils/constants';

/**
 * 贪睡惩罚机制服务
 * 处理扣款计算、累进费率、统计分析等功能
 */
export class PenaltyService {

  /**
   * 计算贪睡惩罚金额
   * @param {number} snoozeCount - 当前贪睡次数
   * @param {Object} options - 可选配置
   * @returns {number} 惩罚金额
   */
  static calculatePenalty(snoozeCount, options = {}) {
    const {
      baseAmount = APP_CONFIG.BASE_PENALTY_AMOUNT || 5,
      progressiveRate = APP_CONFIG.PROGRESSIVE_RATE || 1.5,
      maxPenalty = APP_CONFIG.MAX_PENALTY_AMOUNT || 50,
      penaltyType = 'progressive' // 'fixed', 'progressive', 'exponential'
    } = options;

    let penalty = 0;

    switch (penaltyType) {
      case 'fixed':
        // 固定金额
        penalty = baseAmount;
        break;

      case 'progressive':
        // 累进费率：每次贪睡增加固定金额
        penalty = baseAmount * snoozeCount * progressiveRate;
        break;

      case 'exponential':
        // 指数增长：每次贪睡翻倍
        penalty = baseAmount * Math.pow(2, snoozeCount - 1);
        break;

      default:
        penalty = baseAmount * snoozeCount;
    }

    // 应用最大限制
    return Math.min(penalty, maxPenalty);
  }

  /**
   * 获取累进费率表
   * @param {Object} options - 配置选项
   * @returns {Array} 费率表
   */
  static getPenaltySchedule(options = {}) {
    const {
      maxSnoozes = 5,
      baseAmount = 5,
      penaltyType = 'progressive'
    } = options;

    const schedule = [];

    for (let i = 1; i <= maxSnoozes; i++) {
      const penalty = this.calculatePenalty(i, options);
      const totalPenalty = this.calculateTotalPenalty(i, options);

      schedule.push({
        snoozeCount: i,
        penaltyAmount: penalty,
        totalPenalty: totalPenalty,
        description: this.getPenaltyDescription(i, penalty)
      });
    }

    return schedule;
  }

  /**
   * 计算累计惩罚金额
   * @param {number} totalSnoozes - 总贪睡次数
   * @param {Object} options - 配置选项
   * @returns {number} 累计金额
   */
  static calculateTotalPenalty(totalSnoozes, options = {}) {
    let total = 0;
    for (let i = 1; i <= totalSnoozes; i++) {
      total += this.calculatePenalty(i, options);
    }
    return total;
  }

  /**
   * 获取惩罚描述
   * @param {number} snoozeCount - 贪睡次数
   * @param {number} penalty - 惩罚金额
   * @returns {string} 描述文本
   */
  static getPenaltyDescription(snoozeCount, penalty) {
    const descriptions = {
      1: `第${snoozeCount}次贪睡`,
      2: `第${snoozeCount}次贪睡（费率提升）`,
      3: `第${snoozeCount}次贪睡（严重警告）`,
      4: `第${snoozeCount}次贪睡（重度惩罚）`,
      5: `第${snoozeCount}次贪睡（最高惩罚）`
    };

    return descriptions[snoozeCount] || `第${snoozeCount}次贪睡`;
  }

  /**
   * 计算周期性统计
   * @param {Array} statsData - 统计数据
   * @param {string} period - 统计周期 'daily', 'weekly', 'monthly'
   * @returns {Object} 周期统计
   */
  static calculatePeriodStats(statsData, period = 'weekly') {
    const now = new Date();
    const stats = {
      totalPenalty: 0,
      totalSnoozes: 0,
      averagePenalty: 0,
      worstDay: null,
      bestStreak: 0,
      currentStreak: 0,
      penaltyTrend: 'stable' // 'increasing', 'decreasing', 'stable'
    };

    if (!statsData || statsData.length === 0) {
      return stats;
    }

    // 过滤周期数据
    const periodData = this.filterByPeriod(statsData, period, now);

    // 计算基础统计
    periodData.forEach(day => {
      stats.totalPenalty += day.penaltyAmount || 0;
      stats.totalSnoozes += day.snoozeCount || 0;
    });

    stats.averagePenalty = periodData.length > 0
      ? stats.totalPenalty / periodData.length
      : 0;

    // 找出最糟糕的一天
    stats.worstDay = periodData.reduce((worst, day) => {
      return (day.penaltyAmount || 0) > (worst?.penaltyAmount || 0) ? day : worst;
    }, null);

    // 计算连续记录
    stats.currentStreak = this.calculateCurrentStreak(periodData);
    stats.bestStreak = this.calculateBestStreak(periodData);

    // 计算趋势
    stats.penaltyTrend = this.calculateTrend(periodData);

    return stats;
  }

  /**
   * 按周期过滤数据
   * @param {Array} data - 原始数据
   * @param {string} period - 周期
   * @param {Date} referenceDate - 参考日期
   * @returns {Array} 过滤后的数据
   */
  static filterByPeriod(data, period, referenceDate) {
    const cutoffDate = new Date(referenceDate);

    switch (period) {
      case 'daily':
        cutoffDate.setHours(0, 0, 0, 0);
        break;
      case 'weekly':
        cutoffDate.setDate(cutoffDate.getDate() - 7);
        break;
      case 'monthly':
        cutoffDate.setMonth(cutoffDate.getMonth() - 1);
        break;
    }

    return data.filter(day => {
      const dayDate = new Date(day.date);
      return dayDate >= cutoffDate;
    });
  }

  /**
   * 计算当前连续记录
   * @param {Array} data - 数据数组
   * @returns {number} 连续天数
   */
  static calculateCurrentStreak(data) {
    let streak = 0;

    // 从最近开始计算
    for (let i = data.length - 1; i >= 0; i--) {
      const day = data[i];
      if (day.wakeUpSuccess === true && (day.snoozeCount || 0) === 0) {
        streak++;
      } else {
        break;
      }
    }

    return streak;
  }

  /**
   * 计算最佳连续记录
   * @param {Array} data - 数据数组
   * @returns {number} 最长连续天数
   */
  static calculateBestStreak(data) {
    let maxStreak = 0;
    let currentStreak = 0;

    data.forEach(day => {
      if (day.wakeUpSuccess === true && (day.snoozeCount || 0) === 0) {
        currentStreak++;
        maxStreak = Math.max(maxStreak, currentStreak);
      } else {
        currentStreak = 0;
      }
    });

    return maxStreak;
  }

  /**
   * 计算趋势
   * @param {Array} data - 数据数组
   * @returns {string} 趋势描述
   */
  static calculateTrend(data) {
    if (data.length < 3) return 'stable';

    const recentData = data.slice(-7); // 最近7天
    const earlierData = data.slice(-14, -7); // 前7天

    const recentAvg = recentData.reduce((sum, day) => sum + (day.penaltyAmount || 0), 0) / recentData.length;
    const earlierAvg = earlierData.length > 0
      ? earlierData.reduce((sum, day) => sum + (day.penaltyAmount || 0), 0) / earlierData.length
      : recentAvg;

    const change = (recentAvg - earlierAvg) / (earlierAvg || 1);

    if (change > 0.2) return 'increasing';
    if (change < -0.2) return 'decreasing';
    return 'stable';
  }

  /**
   * 生成惩罚报告
   * @param {string} userId - 用户ID（可选）
   * @returns {Object} 详细报告
   */
  static async generatePenaltyReport(userId = null) {
    try {
      const allStats = await StorageService.getStats();
      const statsArray = Object.values(allStats);

      const report = {
        overview: {
          totalDays: statsArray.length,
          totalPenalty: 0,
          totalSnoozes: 0,
          successRate: 0
        },
        weekly: this.calculatePeriodStats(statsArray, 'weekly'),
        monthly: this.calculatePeriodStats(statsArray, 'monthly'),
        penaltyBreakdown: this.calculatePenaltyBreakdown(statsArray),
        recommendations: this.generateRecommendations(statsArray),
        milestones: this.calculateMilestones(statsArray)
      };

      // 计算总览
      statsArray.forEach(day => {
        report.overview.totalPenalty += day.penaltyAmount || 0;
        report.overview.totalSnoozes += day.snoozeCount || 0;
      });

      const successDays = statsArray.filter(day => day.wakeUpSuccess === true).length;
      report.overview.successRate = statsArray.length > 0
        ? ((successDays / statsArray.length) * 100).toFixed(1)
        : 0;

      return report;

    } catch (error) {
      console.error('生成惩罚报告失败:', error);
      throw error;
    }
  }

  /**
   * 计算惩罚分解
   * @param {Array} data - 统计数据
   * @returns {Object} 分解数据
   */
  static calculatePenaltyBreakdown(data) {
    const breakdown = {
      bySnoozeCount: {},
      byWeekday: {},
      byTimeOfDay: {}
    };

    data.forEach(day => {
      const snoozeCount = day.snoozeCount || 0;
      const penalty = day.penaltyAmount || 0;

      // 按贪睡次数分解
      if (!breakdown.bySnoozeCount[snoozeCount]) {
        breakdown.bySnoozeCount[snoozeCount] = { count: 0, totalPenalty: 0 };
      }
      breakdown.bySnoozeCount[snoozeCount].count++;
      breakdown.bySnoozeCount[snoozeCount].totalPenalty += penalty;

      // 按星期分解
      const dayOfWeek = new Date(day.date).getDay();
      const weekdayNames = ['周日', '周一', '周二', '周三', '周四', '周五', '周六'];
      const weekdayName = weekdayNames[dayOfWeek];

      if (!breakdown.byWeekday[weekdayName]) {
        breakdown.byWeekday[weekdayName] = { count: 0, totalPenalty: 0 };
      }
      breakdown.byWeekday[weekdayName].count++;
      breakdown.byWeekday[weekdayName].totalPenalty += penalty;
    });

    return breakdown;
  }

  /**
   * 生成建议
   * @param {Array} data - 统计数据
   * @returns {Array} 建议列表
   */
  static generateRecommendations(data) {
    const recommendations = [];
    const recentData = data.slice(-7); // 最近7天

    const avgSnoozes = recentData.reduce((sum, day) => sum + (day.snoozeCount || 0), 0) / recentData.length;
    const avgPenalty = recentData.reduce((sum, day) => sum + (day.penaltyAmount || 0), 0) / recentData.length;

    if (avgSnoozes > 2) {
      recommendations.push({
        type: 'warning',
        title: '贪睡频率过高',
        message: '最近7天平均贪睡次数超过2次，建议调整作息时间或增加睡眠时长。',
        priority: 'high'
      });
    }

    if (avgPenalty > 15) {
      recommendations.push({
        type: 'financial',
        title: '扣款金额较高',
        message: '最近的扣款金额较高，考虑降低惩罚费率或设置更早的就寝时间。',
        priority: 'medium'
      });
    }

    const successRate = recentData.filter(day => day.wakeUpSuccess === true).length / recentData.length;
    if (successRate < 0.5) {
      recommendations.push({
        type: 'motivation',
        title: '成功率需要提升',
        message: '成功起床率低于50%，建议从简单难度开始，逐步提高要求。',
        priority: 'high'
      });
    }

    return recommendations;
  }

  /**
   * 计算里程碑
   * @param {Array} data - 统计数据
   * @returns {Object} 里程碑数据
   */
  static calculateMilestones(data) {
    const milestones = {
      achieved: [],
      upcoming: []
    };

    const totalDays = data.length;
    const successDays = data.filter(day => day.wakeUpSuccess === true).length;
    const currentStreak = this.calculateCurrentStreak(data);
    const totalPenalty = data.reduce((sum, day) => sum + (day.penaltyAmount || 0), 0);

    // 已达成的里程碑
    const milestoneDefs = [
      { name: '初来乍到', condition: totalDays >= 1, description: '使用应用第1天' },
      { name: '坚持一周', condition: totalDays >= 7, description: '使用应用满7天' },
      { name: '首次成功', condition: successDays >= 1, description: '第一次成功起床' },
      { name: '连续三天', condition: currentStreak >= 3, description: '连续成功起床3天' },
      { name: '省钱高手', condition: totalPenalty === 0, description: '零扣款记录' },
      { name: '月度挑战', condition: totalDays >= 30, description: '使用应用满30天' }
    ];

    milestoneDefs.forEach(milestone => {
      if (milestone.condition) {
        milestones.achieved.push(milestone);
      } else {
        milestones.upcoming.push(milestone);
      }
    });

    return milestones;
  }
}