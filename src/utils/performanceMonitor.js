/**
 * 性能监控工具
 * 用于监控应用性能和用户体验指标
 */
export class PerformanceMonitor {
  static measurements = new Map();
  static enabled = __DEV__; // 仅在开发模式下启用

  /**
   * 开始性能测量
   * @param {string} name - 测量名称
   */
  static start(name) {
    if (!this.enabled) return;

    this.measurements.set(name, {
      startTime: Date.now(),
      name
    });
  }

  /**
   * 结束性能测量
   * @param {string} name - 测量名称
   * @returns {number} 执行时间(毫秒)
   */
  static end(name) {
    if (!this.enabled) return 0;

    const measurement = this.measurements.get(name);
    if (!measurement) {
      console.warn(`性能测量 "${name}" 未找到起始点`);
      return 0;
    }

    const endTime = Date.now();
    const duration = endTime - measurement.startTime;

    // 记录性能日志
    if (duration > 1000) {
      console.warn(`⚠️ 性能警告: ${name} 耗时 ${duration}ms`);
    } else if (duration > 500) {
      console.log(`⏱️ 性能监控: ${name} 耗时 ${duration}ms`);
    }

    this.measurements.delete(name);
    return duration;
  }

  /**
   * 包装异步函数进行性能监控
   * @param {string} name - 监控名称
   * @param {Function} asyncFn - 异步函数
   * @returns {Function} 包装后的函数
   */
  static wrapAsync(name, asyncFn) {
    if (!this.enabled) return asyncFn;

    return async (...args) => {
      this.start(name);
      try {
        const result = await asyncFn(...args);
        this.end(name);
        return result;
      } catch (error) {
        this.end(name);
        throw error;
      }
    };
  }

  /**
   * 监控组件渲染性能
   * @param {string} componentName - 组件名称
   * @returns {Function} 装饰器函数
   */
  static monitorComponent(componentName) {
    if (!this.enabled) return (Component) => Component;

    return (Component) => {
      const MonitoredComponent = (props) => {
        const startTime = Date.now();

        React.useEffect(() => {
          const renderTime = Date.now() - startTime;
          if (renderTime > 16) { // 超过一帧时间(16ms)
            console.log(`🎭 组件渲染: ${componentName} 耗时 ${renderTime}ms`);
          }
        });

        return React.createElement(Component, props);
      };

      MonitoredComponent.displayName = `Monitored(${componentName})`;
      return MonitoredComponent;
    };
  }

  /**
   * 获取内存使用情况
   * @returns {Object} 内存使用统计
   */
  static getMemoryUsage() {
    if (!this.enabled || typeof performance === 'undefined') {
      return { unavailable: true };
    }

    try {
      // Web环境下的内存监控
      if (performance.memory) {
        return {
          usedJSHeapSize: Math.round(performance.memory.usedJSHeapSize / 1024 / 1024),
          totalJSHeapSize: Math.round(performance.memory.totalJSHeapSize / 1024 / 1024),
          jsHeapSizeLimit: Math.round(performance.memory.jsHeapSizeLimit / 1024 / 1024),
          unit: 'MB'
        };
      }
    } catch (error) {
      console.warn('内存监控不可用:', error);
    }

    return { unavailable: true };
  }

  /**
   * 生成性能报告
   * @returns {Object} 性能报告
   */
  static generateReport() {
    if (!this.enabled) return { disabled: true };

    const memoryUsage = this.getMemoryUsage();
    const activeTimers = this.measurements.size;

    return {
      timestamp: new Date().toISOString(),
      memoryUsage,
      activeTimers,
      recommendations: this.getRecommendations(memoryUsage, activeTimers)
    };
  }

  /**
   * 获取性能优化建议
   * @param {Object} memoryUsage - 内存使用情况
   * @param {number} activeTimers - 活跃计时器数量
   * @returns {Array} 建议列表
   */
  static getRecommendations(memoryUsage, activeTimers) {
    const recommendations = [];

    if (memoryUsage.usedJSHeapSize > 50) {
      recommendations.push({
        type: 'memory',
        message: `内存使用量较高 (${memoryUsage.usedJSHeapSize}MB)，建议检查内存泄漏`
      });
    }

    if (activeTimers > 5) {
      recommendations.push({
        type: 'performance',
        message: `活跃计时器过多 (${activeTimers}个)，可能影响性能`
      });
    }

    if (recommendations.length === 0) {
      recommendations.push({
        type: 'success',
        message: '性能表现良好！'
      });
    }

    return recommendations;
  }

  /**
   * 清理所有监控数据
   */
  static cleanup() {
    this.measurements.clear();
  }
}

/**
 * 性能监控装饰器
 * 用于自动监控函数执行时间
 */
export function monitor(name) {
  return function(target, propertyKey, descriptor) {
    if (!PerformanceMonitor.enabled) return descriptor;

    const originalMethod = descriptor.value;

    descriptor.value = async function(...args) {
      const monitorName = name || `${target.constructor.name}.${propertyKey}`;
      PerformanceMonitor.start(monitorName);

      try {
        const result = await originalMethod.apply(this, args);
        PerformanceMonitor.end(monitorName);
        return result;
      } catch (error) {
        PerformanceMonitor.end(monitorName);
        throw error;
      }
    };

    return descriptor;
  };
}

/**
 * React Hook for performance monitoring
 */
export function usePerformanceMonitor(name, dependencies = []) {
  React.useEffect(() => {
    if (!PerformanceMonitor.enabled) return;

    PerformanceMonitor.start(name);
    return () => {
      PerformanceMonitor.end(name);
    };
  }, dependencies);
}

export default PerformanceMonitor;