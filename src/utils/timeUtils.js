/**
 * 时间相关的工具函数
 */

/**
 * 格式化时间为HH:MM格式
 * @param {Date} date - 时间对象
 * @returns {string} 格式化后的时间字符串
 */
export const formatTime = (date) => {
  if (!date) return '00:00';

  const hours = date.getHours().toString().padStart(2, '0');
  const minutes = date.getMinutes().toString().padStart(2, '0');
  return `${hours}:${minutes}`;
};

/**
 * 解析时间字符串为Date对象
 * @param {string} timeString - "HH:MM" 格式的时间字符串
 * @returns {Date} 今天的该时间对应的Date对象
 */
export const parseTime = (timeString) => {
  if (!timeString) return new Date();

  const [hours, minutes] = timeString.split(':').map(Number);
  const date = new Date();
  date.setHours(hours, minutes, 0, 0);
  return date;
};

/**
 * 获取当前时间的字符串格式
 * @returns {string} "HH:MM" 格式的当前时间
 */
export const getCurrentTime = () => {
  return formatTime(new Date());
};

/**
 * 计算距离目标时间的毫秒数
 * @param {string} targetTime - "HH:MM" 格式的目标时间
 * @returns {number} 距离目标时间的毫秒数
 */
export const getTimeUntilTarget = (targetTime) => {
  const now = new Date();
  const target = parseTime(targetTime);

  // 如果目标时间已过，则设置为明天
  if (target <= now) {
    target.setDate(target.getDate() + 1);
  }

  return target.getTime() - now.getTime();
};

/**
 * 格式化日期为YYYY-MM-DD格式
 * @param {Date} date - 日期对象
 * @returns {string} 格式化后的日期字符串
 */
export const formatDate = (date = new Date()) => {
  const year = date.getFullYear();
  const month = (date.getMonth() + 1).toString().padStart(2, '0');
  const day = date.getDate().toString().padStart(2, '0');
  return `${year}-${month}-${day}`;
};

/**
 * 获取今天的日期字符串
 * @returns {string} "YYYY-MM-DD" 格式的今天日期
 */
export const getTodayDateString = () => {
  return formatDate(new Date());
};

/**
 * 获取指定天数前的日期字符串
 * @param {number} daysAgo - 几天前
 * @returns {string} "YYYY-MM-DD" 格式的日期字符串
 */
export const getDateString = (daysAgo = 0) => {
  const date = new Date();
  date.setDate(date.getDate() - daysAgo);
  return formatDate(date);
};

/**
 * 获取星期几的中文名称
 * @param {Date} date - 日期对象
 * @returns {string} 星期几的中文名称
 */
export const getWeekdayName = (date = new Date()) => {
  const weekdays = ['周日', '周一', '周二', '周三', '周四', '周五', '周六'];
  return weekdays[date.getDay()];
};

/**
 * 检查是否为今天
 * @param {string} dateString - "YYYY-MM-DD" 格式的日期字符串
 * @returns {boolean} 是否为今天
 */
export const isToday = (dateString) => {
  return dateString === getTodayDateString();
};

/**
 * 生成唯一ID
 * @returns {string} 唯一ID
 */
export const generateId = () => {
  return Date.now().toString() + Math.random().toString(36).substr(2, 9);
};