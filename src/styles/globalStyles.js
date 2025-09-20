import { StyleSheet, Dimensions } from 'react-native';

const { width, height } = Dimensions.get('window');

export const globalStyles = StyleSheet.create({
  // 容器样式
  container: {
    flex: 1,
    backgroundColor: '#000000',
    paddingHorizontal: 20,
    paddingTop: 50,
  },

  centerContainer: {
    flex: 1,
    backgroundColor: '#000000',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },

  // 文字样式
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#ffffff',
    textAlign: 'center',
    marginBottom: 30,
  },

  subtitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#ffffff',
    textAlign: 'center',
    marginBottom: 20,
  },

  text: {
    fontSize: 16,
    color: '#ffffff',
    textAlign: 'center',
  },

  smallText: {
    fontSize: 14,
    color: '#cccccc',
    textAlign: 'center',
  },

  // 按钮样式
  button: {
    backgroundColor: '#ffffff',
    paddingVertical: 15,
    paddingHorizontal: 30,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: 10,
    minHeight: 50,
  },

  buttonText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#000000',
  },

  secondaryButton: {
    backgroundColor: 'transparent',
    borderWidth: 2,
    borderColor: '#ffffff',
    paddingVertical: 15,
    paddingHorizontal: 30,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: 10,
  },

  secondaryButtonText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#ffffff',
  },

  dangerButton: {
    backgroundColor: '#ff4444',
    paddingVertical: 15,
    paddingHorizontal: 30,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: 10,
  },

  dangerButtonText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#ffffff',
  },

  // 卡片样式
  card: {
    backgroundColor: '#1a1a1a',
    borderRadius: 12,
    padding: 20,
    marginVertical: 10,
    borderWidth: 1,
    borderColor: '#333333',
  },

  // 输入框样式
  input: {
    backgroundColor: '#1a1a1a',
    borderWidth: 1,
    borderColor: '#333333',
    borderRadius: 8,
    paddingHorizontal: 15,
    paddingVertical: 12,
    color: '#ffffff',
    fontSize: 16,
    marginVertical: 10,
  },

  // 时间显示样式
  timeDisplay: {
    fontSize: 48,
    fontWeight: 'bold',
    color: '#ffffff',
    textAlign: 'center',
    fontFamily: 'monospace',
  },

  // 进度条样式
  progressContainer: {
    width: '100%',
    height: 20,
    backgroundColor: '#333333',
    borderRadius: 10,
    marginVertical: 20,
    overflow: 'hidden',
  },

  progressBar: {
    height: '100%',
    backgroundColor: '#ffffff',
    borderRadius: 10,
  },

  // 状态指示器
  statusIndicator: {
    width: 20,
    height: 20,
    borderRadius: 10,
    marginHorizontal: 5,
  },

  successColor: {
    backgroundColor: '#4CAF50',
  },

  errorColor: {
    backgroundColor: '#F44336',
  },

  warningColor: {
    backgroundColor: '#FF9800',
  },

  // 布局样式
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },

  column: {
    flexDirection: 'column',
    alignItems: 'center',
  },

  spaceBetween: {
    justifyContent: 'space-between',
  },

  spaceAround: {
    justifyContent: 'space-around',
  },

  // 边距样式
  marginTop: {
    marginTop: 20,
  },

  marginBottom: {
    marginBottom: 20,
  },

  marginVertical: {
    marginVertical: 10,
  },

  paddingHorizontal: {
    paddingHorizontal: 20,
  },
});

export const colors = {
  black: '#000000',
  white: '#ffffff',
  gray: '#333333',
  lightGray: '#cccccc',
  success: '#4CAF50',
  error: '#F44336',
  warning: '#FF9800',
  primary: '#ffffff',
};