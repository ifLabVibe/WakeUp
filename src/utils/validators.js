/**
 * 数据验证工具函数
 */

/**
 * 验证时间格式是否正确 (HH:MM)
 * @param {string} time - 时间字符串
 * @returns {boolean} 是否有效
 */
export const validateTime = (time) => {
  if (!time || typeof time !== 'string') return false;

  const timeRegex = /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/;
  return timeRegex.test(time);
};

/**
 * 验证闹钟数据是否完整
 * @param {Object} alarm - 闹钟对象
 * @returns {Object} 验证结果 {isValid: boolean, errors: string[]}
 */
export const validateAlarm = (alarm) => {
  const errors = [];

  if (!alarm) {
    errors.push('闹钟数据不能为空');
    return { isValid: false, errors };
  }

  // 验证必需字段
  if (!alarm.id) errors.push('闹钟ID不能为空');
  if (!validateTime(alarm.time)) errors.push('时间格式无效，应为HH:MM格式');
  if (typeof alarm.isActive !== 'boolean') errors.push('isActive必须为布尔值');

  // 验证可选字段
  if (alarm.triggerType && !['shake', 'gps', 'both'].includes(alarm.triggerType)) {
    errors.push('triggerType必须是shake、gps或both之一');
  }

  if (alarm.difficulty && !['easy', 'normal', 'hard'].includes(alarm.difficulty)) {
    errors.push('difficulty必须是easy、normal或hard之一');
  }

  if (alarm.snoozeCount && (typeof alarm.snoozeCount !== 'number' || alarm.snoozeCount < 0)) {
    errors.push('snoozeCount必须是非负数');
  }

  return { isValid: errors.length === 0, errors };
};

/**
 * 验证统计数据
 * @param {Object} stats - 统计数据对象
 * @returns {Object} 验证结果
 */
export const validateStats = (stats) => {
  const errors = [];

  if (!stats) {
    errors.push('统计数据不能为空');
    return { isValid: false, errors };
  }

  // 验证日期格式
  const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
  if (!dateRegex.test(stats.date)) {
    errors.push('日期格式无效，应为YYYY-MM-DD格式');
  }

  // 验证数值类型
  if (typeof stats.snoozeCount !== 'number' || stats.snoozeCount < 0) {
    errors.push('snoozeCount必须是非负数');
  }

  if (typeof stats.penaltyAmount !== 'number' || stats.penaltyAmount < 0) {
    errors.push('penaltyAmount必须是非负数');
  }

  return { isValid: errors.length === 0, errors };
};

/**
 * 清理闹钟数据，移除无效字段
 * @param {Object} alarm - 原始闹钟数据
 * @returns {Object} 清理后的闹钟数据
 */
export const sanitizeAlarm = (alarm) => {
  if (!alarm) return null;

  return {
    id: alarm.id || '',
    time: alarm.time || '07:00',
    isActive: Boolean(alarm.isActive),
    createdAt: alarm.createdAt || new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    snoozeCount: Number(alarm.snoozeCount) || 0,
    lastSnoozeTime: alarm.lastSnoozeTime || null,
    triggerType: alarm.triggerType || 'shake',
    difficulty: alarm.difficulty || 'normal',
    soundId: alarm.soundId || 'default',
    label: alarm.label || '起床闹钟'
  };
};

/**
 * 清理统计数据
 * @param {Object} stats - 原始统计数据
 * @returns {Object} 清理后的统计数据
 */
export const sanitizeStats = (stats) => {
  if (!stats) return null;

  return {
    date: stats.date || new Date().toISOString().split('T')[0],
    wakeUpSuccess: Boolean(stats.wakeUpSuccess),
    snoozeCount: Number(stats.snoozeCount) || 0,
    penaltyAmount: Number(stats.penaltyAmount) || 0,
    triggerTime: stats.triggerTime || null,
    completeTime: stats.completeTime || null,
    triggerType: stats.triggerType || 'shake'
  };
};