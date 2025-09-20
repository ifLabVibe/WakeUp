// 闹钟数据结构
export const ALARM_SCHEMA = {
  id: 'string',           // 唯一标识符
  time: 'string',         // "HH:MM" 格式
  isActive: 'boolean',    // 是否启用
  createdAt: 'string',    // ISO日期字符串
  updatedAt: 'string',    // 最后更新时间
  snoozeCount: 'number',  // 今日贪睡次数
  lastSnoozeTime: 'string', // 最后贪睡时间
  triggerType: 'string',  // 'shake' | 'gps' | 'both'
  difficulty: 'string',   // 'easy' | 'normal' | 'hard'
  soundId: 'string',      // 铃声ID
  label: 'string'         // 闹钟标签
};

// 统计数据结构
export const STATS_SCHEMA = {
  date: 'string',         // "YYYY-MM-DD" 格式
  wakeUpSuccess: 'boolean', // 是否成功起床
  snoozeCount: 'number',  // 贪睡次数
  penaltyAmount: 'number', // 惩罚金额
  triggerTime: 'string',  // 闹钟触发时间
  completeTime: 'string', // 完成触发时间
  triggerType: 'string'   // 使用的触发方式
};

// 默认闹钟配置
export const DEFAULT_ALARM = {
  triggerType: 'shake',
  difficulty: 'normal',
  soundId: 'default',
  label: '起床闹钟'
};

// 应用配置
export const APP_CONFIG = {
  // 摇晃检测配置
  SHAKE_THRESHOLD: 2.5,           // 摇晃阈值 (g)
  SHAKE_DURATION: 20000,          // 摇晃持续时间 (毫秒)
  SHAKE_REQUIRED_COUNT: 100,      // 需要的摇晃次数
  SENSOR_UPDATE_INTERVAL: 50,     // 传感器更新频率 (毫秒)

  // 贪睡配置
  SNOOZE_PENALTY: 5,              // 贪睡惩罚金额
  SNOOZE_INTERVAL: 5 * 60 * 1000, // 贪睡间隔 (5分钟)
  MAX_SNOOZE_COUNT: 3,            // 最大贪睡次数

  // 存储键名
  STORAGE_KEYS: {
    CURRENT_ALARM: 'current_alarm',
    STATS_DATA: 'stats_data',
    USER_SETTINGS: 'user_settings'
  },

  // 通知配置
  NOTIFICATION: {
    CHANNEL_ID: 'wakeup-alarm',
    CATEGORY_ID: 'alarm'
  }
};

// 时间工具函数
export const TIME_FORMAT = {
  DISPLAY: 'HH:mm',
  STORAGE: 'HH:MM',
  DATE: 'YYYY-MM-DD'
};

// 用户故事列表（用于测试）
export const USER_STORIES = [
  '我可以设置一个闹钟时间',
  '时间到了闹钟会响',
  '我必须摇晃手机20秒才能关闭',
  '如果我选择贪睡，会显示扣款5元',
  '我可以看到自己的贪睡记录'
];

// 成功标准列表
export const SUCCESS_CRITERIA = [
  '闹钟准时响起',
  '摇晃检测准确率>90%',
  '界面操作流畅',
  '数据本地保存',
  '基本统计功能'
];