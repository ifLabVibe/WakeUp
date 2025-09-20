# 唤醒闹钟 (WakeUp Alarm)

一个创新的闹钟应用，要求用户通过摇晃手机来关闭闹钟，并通过模拟惩罚机制帮助用户建立健康的起床习惯。

## 🎯 项目概述

这是一个5小时MVP版本，专注于验证核心创新功能：
- 摇晃关闭闹钟机制
- 贪睡惩罚系统
- 简单的习惯统计

## 🚀 快速开始

### 前置条件
- Node.js (版本 16+)
- npm 或 yarn
- Expo CLI
- 手机安装 Expo Go 应用

### 安装和运行

1. 安装依赖
```bash
npm install
```

2. 启动开发服务器
```bash
npm start
# 或
expo start
```

3. 在手机上打开 Expo Go，扫描二维码即可运行应用

## 📱 功能特性

### ✅ 已实现（阶段1）
- [x] 项目基础架构
- [x] 导航系统
- [x] 全局样式系统
- [x] 基础组件
- [x] 存储服务框架

### 🚧 开发中
- [ ] 闹钟设置功能
- [ ] 摇晃检测
- [ ] 贪睡惩罚机制
- [ ] 统计页面

## 🏗️ 项目结构

```
├── src/
│   ├── components/          # 可复用组件
│   │   └── Button.js
│   ├── screens/            # 页面组件
│   │   ├── HomeScreen.js
│   │   ├── SetAlarmScreen.js
│   │   ├── TriggerScreen.js
│   │   └── StatsScreen.js
│   ├── services/           # 业务逻辑服务
│   │   └── storageService.js
│   ├── utils/              # 工具函数
│   │   ├── constants.js
│   │   └── timeUtils.js
│   └── styles/             # 样式文件
│       └── globalStyles.js
├── assets/                 # 静态资源
├── App.js                  # 应用入口
└── package.json
```

## 🔧 技术栈

- **框架**: React Native (Expo)
- **导航**: React Navigation
- **存储**: AsyncStorage
- **传感器**: expo-sensors (待实现)
- **音频**: expo-av (待实现)
- **通知**: expo-notifications (待实现)

## 📝 开发计划

### 阶段1: 项目初始化 ✅
- 项目搭建
- 基础架构
- 导航系统

### 阶段2: 闹钟功能 (下一步)
- 数据模型
- 时间设置
- 本地存储

### 阶段3-8: 核心功能
- 摇晃检测
- 音效播放
- 贪睡机制
- 统计功能

## 🧪 测试

目前可以测试的功能：
- [ ] 应用启动
- [ ] 页面导航
- [ ] 基础UI显示

运行测试命令：
```bash
# 启动应用进行手动测试
npm start
```

## 📱 支持平台

- ✅ iOS
- ✅ Android
- ⚠️ Web (基础支持)

## 🐛 已知问题

- 资源文件（图标、音效）暂未添加
- 部分页面显示占位内容
- 未实现核心功能

## 📖 开发文档

详细开发计划请参考：
- [设计文档](./唤醒闹钟应用设计文档.md)
- [功能开发文档](./唤醒闹钟功能开发文档.md)
- [多阶段项目编写计划](./多阶段项目编写计划.md)

## 🤝 贡献指南

这是一个MVP项目，欢迎提出改进建议和bug报告。

## 📄 许可证

MIT License