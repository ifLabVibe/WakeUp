import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { globalStyles } from '../styles/globalStyles';
import Button from './Button';

/**
 * 错误边界组件
 * 捕获和处理React组件树中的JavaScript错误
 */
class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
      errorId: null
    };
  }

  static getDerivedStateFromError(error) {
    // 更新状态以显示错误UI
    return {
      hasError: true,
      errorId: Date.now().toString()
    };
  }

  componentDidCatch(error, errorInfo) {
    // 记录错误信息
    this.setState({
      error,
      errorInfo
    });

    // 在开发模式下记录详细错误信息
    if (__DEV__) {
      console.error('错误边界捕获到错误:', error);
      console.error('错误信息:', errorInfo);
    }

    // 生产环境下可以发送错误报告到错误监控服务
    this.logErrorToService(error, errorInfo);
  }

  logErrorToService = (error, errorInfo) => {
    // 这里可以集成错误监控服务如Sentry, Bugsnag等
    const errorReport = {
      timestamp: new Date().toISOString(),
      error: {
        name: error.name,
        message: error.message,
        stack: error.stack
      },
      errorInfo: {
        componentStack: errorInfo.componentStack
      },
      userAgent: typeof navigator !== 'undefined' ? navigator.userAgent : 'unknown',
      url: typeof window !== 'undefined' ? window.location.href : 'unknown'
    };

    if (__DEV__) {
      console.log('错误报告:', errorReport);
    }

    // 在生产环境中，这里应该发送到错误监控服务
    // 例如: Sentry.captureException(error, { extra: errorInfo });
  };

  handleRetry = () => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
      errorId: null
    });
  };

  handleReload = () => {
    if (typeof window !== 'undefined') {
      window.location.reload();
    }
  };

  render() {
    if (this.state.hasError) {
      return (
        <View style={styles.errorContainer}>
          <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
            {/* 错误图标和标题 */}
            <View style={styles.errorHeader}>
              <Text style={styles.errorIcon}>⚠️</Text>
              <Text style={styles.errorTitle}>应用出现了问题</Text>
              <Text style={styles.errorSubtitle}>
                抱歉，应用遇到了一个意外错误
              </Text>
            </View>

            {/* 用户友好的错误信息 */}
            <View style={styles.errorContent}>
              <Text style={styles.errorDescription}>
                这可能是由于以下原因造成的：
              </Text>
              <View style={styles.errorReasons}>
                <Text style={styles.reasonText}>• 应用版本不兼容</Text>
                <Text style={styles.reasonText}>• 设备存储空间不足</Text>
                <Text style={styles.reasonText}>• 网络连接问题</Text>
                <Text style={styles.reasonText}>• 临时的系统错误</Text>
              </View>
            </View>

            {/* 操作按钮 */}
            <View style={styles.actionButtons}>
              <Button
                title="重试"
                onPress={this.handleRetry}
                style={styles.retryButton}
              />
              <Button
                title="重新加载应用"
                onPress={this.handleReload}
                variant="secondary"
                style={styles.reloadButton}
              />
            </View>

            {/* 开发模式下显示详细错误信息 */}
            {__DEV__ && this.state.error && (
              <View style={styles.debugSection}>
                <Text style={styles.debugTitle}>调试信息 (仅开发模式)</Text>

                <View style={styles.debugContent}>
                  <Text style={styles.debugLabel}>错误类型:</Text>
                  <Text style={styles.debugText}>{this.state.error.name}</Text>

                  <Text style={styles.debugLabel}>错误信息:</Text>
                  <Text style={styles.debugText}>{this.state.error.message}</Text>

                  <Text style={styles.debugLabel}>错误ID:</Text>
                  <Text style={styles.debugText}>{this.state.errorId}</Text>

                  {this.state.error.stack && (
                    <>
                      <Text style={styles.debugLabel}>错误堆栈:</Text>
                      <ScrollView style={styles.stackTrace} horizontal>
                        <Text style={styles.stackText}>{this.state.error.stack}</Text>
                      </ScrollView>
                    </>
                  )}
                </View>
              </View>
            )}

            {/* 帮助信息 */}
            <View style={styles.helpSection}>
              <Text style={styles.helpTitle}>需要帮助？</Text>
              <Text style={styles.helpText}>
                如果问题持续出现，请尝试以下步骤：
                {'\n'}1. 重启应用
                {'\n'}2. 清除应用缓存
                {'\n'}3. 检查应用更新
                {'\n'}4. 重启设备
              </Text>
            </View>
          </ScrollView>
        </View>
      );
    }

    return this.props.children;
  }
}

const styles = StyleSheet.create({
  errorContainer: {
    ...globalStyles.container,
    backgroundColor: '#1a1a1a',
  },

  scrollView: {
    flex: 1,
  },

  scrollContent: {
    padding: 20,
    alignItems: 'center',
  },

  errorHeader: {
    alignItems: 'center',
    marginBottom: 30,
    paddingTop: 40,
  },

  errorIcon: {
    fontSize: 64,
    marginBottom: 20,
  },

  errorTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#ffffff',
    textAlign: 'center',
    marginBottom: 10,
  },

  errorSubtitle: {
    fontSize: 16,
    color: '#cccccc',
    textAlign: 'center',
    lineHeight: 24,
  },

  errorContent: {
    width: '100%',
    marginBottom: 30,
  },

  errorDescription: {
    fontSize: 16,
    color: '#ffffff',
    marginBottom: 15,
    textAlign: 'center',
  },

  errorReasons: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 10,
    padding: 20,
  },

  reasonText: {
    fontSize: 14,
    color: '#cccccc',
    marginBottom: 8,
    lineHeight: 20,
  },

  actionButtons: {
    width: '100%',
    marginBottom: 30,
  },

  retryButton: {
    marginBottom: 15,
  },

  reloadButton: {
    marginBottom: 15,
  },

  debugSection: {
    width: '100%',
    backgroundColor: 'rgba(255, 0, 0, 0.1)',
    borderRadius: 10,
    padding: 20,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#ff4444',
  },

  debugTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#ff4444',
    marginBottom: 15,
  },

  debugContent: {
    gap: 10,
  },

  debugLabel: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#ffffff',
    marginTop: 10,
  },

  debugText: {
    fontSize: 12,
    color: '#cccccc',
    fontFamily: 'monospace',
  },

  stackTrace: {
    maxHeight: 150,
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
    borderRadius: 5,
    padding: 10,
    marginTop: 5,
  },

  stackText: {
    fontSize: 10,
    color: '#ffcccc',
    fontFamily: 'monospace',
  },

  helpSection: {
    width: '100%',
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 10,
    padding: 20,
  },

  helpTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#ffffff',
    marginBottom: 10,
  },

  helpText: {
    fontSize: 14,
    color: '#cccccc',
    lineHeight: 20,
  },
});

export default ErrorBoundary;