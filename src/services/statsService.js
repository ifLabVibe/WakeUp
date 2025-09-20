import { StorageService } from './storageService';
import { getDateString, getWeekdayName, isToday } from '../utils/timeUtils';

/**
 * 统计数据计算服务
 * 专门处理用户数据的统计分析和可视化数据生成
 */
export class StatsService {

  /**
   * 获取周数据统计
   * @param {number} days - 天数，默认7天
   * @returns {Array} 周数据数组
   */
  static async getWeeklyStats(days = 7) {
    try {
      const stats = await StorageService.getStats() || {};
      const today = new Date();
      const weeklyData = [];

      for (let i = days - 1; i >= 0; i--) {
        const date = new Date(today);
        date.setDate(date.getDate() - i);
        const dateStr = date.toISOString().split('T')[0];

        weeklyData.push({
          date: dateStr,
          dayName: date.toLocaleDateString('zh-CN', { weekday: 'short' }),
          fullDate: date.toLocaleDateString('zh-CN'),
          isToday: isToday(dateStr),
          ...stats[dateStr] || {
            wakeUpSuccess: null,
            snoozeCount: 0,
            penaltyAmount: 0
          }
        });
      }

      return weeklyData;
    } catch (error) {
      console.error('获取周统计数据失败:', error);
      throw error;
    }
  }

  /**
   * 获取总体统计数据
   * @returns {Object} 总体统计对象
   */
  static async getTotalStats() {
    try {
      const stats = await StorageService.getStats() || {};
      let totalPenalty = 0;
      let totalSnoozes = 0;
      let successDays = 0;
      let totalDays = 0;
      let totalAlarms = 0;

      Object.values(stats).forEach(day => {
        totalPenalty += day.penaltyAmount || 0;
        totalSnoozes += day.snoozeCount || 0;
        if (day.wakeUpSuccess === true) successDays++;
        if (day.wakeUpSuccess !== null) {
          totalDays++;
          totalAlarms++;
        }
      });

      const successRate = totalDays > 0 ? (successDays / totalDays * 100).toFixed(1) : 0;
      const avgPenalty = totalDays > 0 ? (totalPenalty / totalDays).toFixed(1) : 0;
      const avgSnoozes = totalDays > 0 ? (totalSnoozes / totalDays).toFixed(1) : 0;

      return {
        totalPenalty,
        totalSnoozes,
        successRate: parseFloat(successRate),
        successDays,
        totalDays,
        totalAlarms,
        avgPenalty: parseFloat(avgPenalty),
        avgSnoozes: parseFloat(avgSnoozes),
        failureDays: totalDays - successDays
      };
    } catch (error) {
      console.error('获取总体统计数据失败:', error);
      throw error;
    }
  }

  /**
   * 获取今日统计
   * @returns {Object} 今日统计对象
   */
  static async getTodayStats() {
    try {
      const today = new Date().toISOString().split('T')[0];
      const stats = await StorageService.getStats() || {};

      return stats[today] || {
        date: today,
        wakeUpSuccess: null,
        snoozeCount: 0,
        penaltyAmount: 0
      };
    } catch (error) {
      console.error('获取今日统计数据失败:', error);
      throw error;
    }
  }

  /**
   * 获取月度统计
   * @returns {Object} 月度统计对象
   */
  static async getMonthlyStats() {
    try {
      const stats = await StorageService.getStats() || {};
      const now = new Date();
      const currentMonth = now.getMonth();
      const currentYear = now.getFullYear();

      let monthlyPenalty = 0;
      let monthlySnoozes = 0;
      let monthlySuccess = 0;
      let monthlyDays = 0;

      Object.entries(stats).forEach(([dateStr, dayStats]) => {
        const date = new Date(dateStr);
        if (date.getMonth() === currentMonth && date.getFullYear() === currentYear) {
          monthlyPenalty += dayStats.penaltyAmount || 0;
          monthlySnoozes += dayStats.snoozeCount || 0;
          if (dayStats.wakeUpSuccess === true) monthlySuccess++;
          if (dayStats.wakeUpSuccess !== null) monthlyDays++;
        }
      });

      return {
        monthlyPenalty,
        monthlySnoozes,
        monthlySuccess,
        monthlyDays,
        monthlySuccessRate: monthlyDays > 0 ? (monthlySuccess / monthlyDays * 100).toFixed(1) : 0
      };
    } catch (error) {
      console.error('获取月度统计数据失败:', error);
      throw error;
    }
  }

  /**
   * 获取成功率趋势
   * @param {number} days - 分析天数
   * @returns {Array} 成功率趋势数组
   */
  static async getSuccessRateTrend(days = 7) {
    try {
      const weeklyData = await this.getWeeklyStats(days);

      return weeklyData.map(day => ({
        date: day.date,
        dayName: day.dayName,
        success: day.wakeUpSuccess === true ? 1 : 0,
        successRate: day.wakeUpSuccess === true ? 100 : day.wakeUpSuccess === false ? 0 : null
      }));
    } catch (error) {
      console.error('获取成功率趋势失败:', error);
      throw error;
    }
  }

  /**
   * 获取扣款趋势
   * @param {number} days - 分析天数
   * @returns {Array} 扣款趋势数组
   */
  static async getPenaltyTrend(days = 7) {
    try {
      const weeklyData = await this.getWeeklyStats(days);

      return weeklyData.map(day => ({
        date: day.date,
        dayName: day.dayName,
        penalty: day.penaltyAmount || 0,
        snoozes: day.snoozeCount || 0
      }));
    } catch (error) {
      console.error('获取扣款趋势失败:', error);
      throw error;
    }
  }

  /**
   * 获取贪睡行为分析
   * @returns {Object} 贪睡行为分析对象
   */
  static async getSnoozeAnalysis() {
    try {
      const stats = await StorageService.getStats() || {};
      const snoozeDistribution = {};
      let maxSnoozes = 0;
      let worstDay = null;
      let bestStreak = 0;
      let currentStreak = 0;

      // 分析贪睡分布
      Object.entries(stats).forEach(([dateStr, dayStats]) => {
        const snoozeCount = dayStats.snoozeCount || 0;

        if (!snoozeDistribution[snoozeCount]) {
          snoozeDistribution[snoozeCount] = 0;
        }
        snoozeDistribution[snoozeCount]++;

        if (snoozeCount > maxSnoozes) {
          maxSnoozes = snoozeCount;
          worstDay = {
            date: dateStr,
            snoozes: snoozeCount,
            penalty: dayStats.penaltyAmount || 0
          };
        }

        // 计算连续成功记录
        if (dayStats.wakeUpSuccess === true && snoozeCount === 0) {
          currentStreak++;
          bestStreak = Math.max(bestStreak, currentStreak);
        } else {
          currentStreak = 0;
        }
      });

      return {
        snoozeDistribution,
        maxSnoozes,
        worstDay,
        bestStreak,
        averageSnoozes: await this.getAverageSnoozes()
      };
    } catch (error) {
      console.error('获取贪睡分析失败:', error);
      throw error;
    }
  }

  /**
   * 获取平均贪睡次数
   * @returns {number} 平均贪睡次数
   */
  static async getAverageSnoozes() {
    try {
      const stats = await StorageService.getStats() || {};
      const validDays = Object.values(stats).filter(day => day.wakeUpSuccess !== null);

      if (validDays.length === 0) return 0;

      const totalSnoozes = validDays.reduce((sum, day) => sum + (day.snoozeCount || 0), 0);
      return (totalSnoozes / validDays.length).toFixed(2);
    } catch (error) {
      console.error('获取平均贪睡次数失败:', error);
      throw error;
    }
  }

  /**
   * 生成数据总结报告
   * @returns {Object} 数据总结报告
   */
  static async generateSummaryReport() {
    try {
      const [totalStats, monthlyStats, todayStats, snoozeAnalysis] = await Promise.all([
        this.getTotalStats(),
        this.getMonthlyStats(),
        this.getTodayStats(),
        this.getSnoozeAnalysis()
      ]);

      return {
        summary: {
          totalDays: totalStats.totalDays,
          successRate: totalStats.successRate,
          totalPenalty: totalStats.totalPenalty,
          totalSnoozes: totalStats.totalSnoozes
        },
        today: todayStats,
        thisMonth: monthlyStats,
        analysis: snoozeAnalysis,
        insights: this.generateInsights(totalStats, snoozeAnalysis)
      };
    } catch (error) {
      console.error('生成总结报告失败:', error);
      throw error;
    }
  }

  /**
   * 生成数据洞察
   * @param {Object} totalStats - 总体统计
   * @param {Object} snoozeAnalysis - 贪睡分析
   * @returns {Array} 洞察数组
   */
  static generateInsights(totalStats, snoozeAnalysis) {
    const insights = [];

    // 成功率洞察
    if (totalStats.successRate >= 80) {
      insights.push({
        type: 'success',
        title: '优秀表现',
        message: `成功率达到 ${totalStats.successRate}%，保持良好习惯！`
      });
    } else if (totalStats.successRate >= 50) {
      insights.push({
        type: 'warning',
        title: '有待改进',
        message: `成功率为 ${totalStats.successRate}%，可以做得更好！`
      });
    } else {
      insights.push({
        type: 'danger',
        title: '需要努力',
        message: `成功率仅 ${totalStats.successRate}%，建议调整睡眠习惯。`
      });
    }

    // 扣款洞察
    if (totalStats.totalPenalty > 100) {
      insights.push({
        type: 'financial',
        title: '扣款提醒',
        message: `累计模拟扣款已达 ¥${totalStats.totalPenalty}，早起能省钱！`
      });
    }

    // 连续记录洞察
    if (snoozeAnalysis.bestStreak >= 7) {
      insights.push({
        type: 'achievement',
        title: '里程碑',
        message: `最佳连续记录 ${snoozeAnalysis.bestStreak} 天，太棒了！`
      });
    }

    return insights;
  }

  /**
   * 获取图表数据
   * @param {string} chartType - 图表类型：'weekly'、'penalty'、'success'
   * @returns {Array} 图表数据数组
   */
  static async getChartData(chartType = 'weekly') {
    try {
      switch (chartType) {
        case 'weekly':
          const weeklyData = await this.getWeeklyStats();
          return weeklyData.map(day => ({
            label: day.dayName,
            value: day.penaltyAmount || 0,
            success: day.wakeUpSuccess,
            snoozes: day.snoozeCount || 0
          }));

        case 'penalty':
          const penaltyTrend = await this.getPenaltyTrend();
          return penaltyTrend.map(day => ({
            label: day.dayName,
            value: day.penalty
          }));

        case 'success':
          const successTrend = await this.getSuccessRateTrend();
          return successTrend.map(day => ({
            label: day.dayName,
            value: day.successRate || 0
          }));

        default:
          throw new Error(`不支持的图表类型: ${chartType}`);
      }
    } catch (error) {
      console.error('获取图表数据失败:', error);
      throw error;
    }
  }
}