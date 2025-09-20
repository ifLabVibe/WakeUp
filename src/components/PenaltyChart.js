import React from 'react';
import { View, Text, StyleSheet, Dimensions } from 'react-native';
import { globalStyles } from '../styles/globalStyles';

const { width } = Dimensions.get('window');

/**
 * 惩罚统计图表组件
 * 可视化展示贪睡扣款数据
 */
export default function PenaltyChart({ data, type = 'bar', title }) {
  if (!data || data.length === 0) {
    return (
      <View style={styles.emptyContainer}>
        <Text style={styles.emptyText}>暂无数据</Text>
      </View>
    );
  }

  const renderBarChart = () => {
    const maxValue = Math.max(...data.map(item => item.value));
    const chartWidth = width - 80; // 减去padding

    return (
      <View style={styles.chartContainer}>
        {title && <Text style={styles.chartTitle}>{title}</Text>}

        <View style={styles.barsContainer}>
          {data.map((item, index) => {
            const barHeight = maxValue > 0 ? (item.value / maxValue) * 120 : 0;
            const barColor = getBarColor(item.value, maxValue);

            return (
              <View key={index} style={styles.barGroup}>
                <View style={styles.barContainer}>
                  <View
                    style={[
                      styles.bar,
                      {
                        height: barHeight,
                        backgroundColor: barColor,
                        width: (chartWidth / data.length) - 10
                      }
                    ]}
                  />
                  <Text style={styles.barValue}>
                    {item.value > 0 ? `¥${item.value}` : '0'}
                  </Text>
                </View>
                <Text style={styles.barLabel} numberOfLines={1}>
                  {item.label}
                </Text>
              </View>
            );
          })}
        </View>

        {/* Y轴标签 */}
        <View style={styles.yAxisContainer}>
          <Text style={styles.yAxisLabel}>¥{maxValue}</Text>
          <Text style={styles.yAxisLabel}>¥{Math.round(maxValue * 0.5)}</Text>
          <Text style={styles.yAxisLabel}>¥0</Text>
        </View>
      </View>
    );
  };

  const renderLineChart = () => {
    const maxValue = Math.max(...data.map(item => item.value));
    const chartWidth = width - 80;
    const chartHeight = 120;

    // 计算数据点位置
    const points = data.map((item, index) => {
      const x = (index / (data.length - 1)) * chartWidth;
      const y = chartHeight - (item.value / maxValue) * chartHeight;
      return { x, y, value: item.value, label: item.label };
    });

    return (
      <View style={styles.chartContainer}>
        {title && <Text style={styles.chartTitle}>{title}</Text>}

        <View style={[styles.lineChartContainer, { width: chartWidth, height: chartHeight }]}>
          {/* 绘制线条 */}
          {points.map((point, index) => {
            if (index === 0) return null;

            const prevPoint = points[index - 1];
            const lineLength = Math.sqrt(
              Math.pow(point.x - prevPoint.x, 2) + Math.pow(point.y - prevPoint.y, 2)
            );
            const angle = Math.atan2(point.y - prevPoint.y, point.x - prevPoint.x) * 180 / Math.PI;

            return (
              <View
                key={`line-${index}`}
                style={[
                  styles.lineSegment,
                  {
                    width: lineLength,
                    left: prevPoint.x,
                    top: prevPoint.y,
                    transform: [{ rotate: `${angle}deg` }]
                  }
                ]}
              />
            );
          })}

          {/* 绘制数据点 */}
          {points.map((point, index) => (
            <View
              key={`point-${index}`}
              style={[
                styles.dataPoint,
                {
                  left: point.x - 4,
                  top: point.y - 4,
                  backgroundColor: point.value > 0 ? '#ff4444' : '#44ff44'
                }
              ]}
            >
              <Text style={styles.pointValue}>¥{point.value}</Text>
            </View>
          ))}
        </View>

        {/* X轴标签 */}
        <View style={styles.xAxisContainer}>
          {data.map((item, index) => (
            <Text key={index} style={styles.xAxisLabel} numberOfLines={1}>
              {item.label}
            </Text>
          ))}
        </View>
      </View>
    );
  };

  const renderPieChart = () => {
    const total = data.reduce((sum, item) => sum + item.value, 0);

    if (total === 0) {
      return (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>暂无扣款数据</Text>
        </View>
      );
    }

    return (
      <View style={styles.chartContainer}>
        {title && <Text style={styles.chartTitle}>{title}</Text>}

        <View style={styles.pieContainer}>
          {/* 简化的饼图显示 */}
          <View style={styles.pieChart}>
            {data.map((item, index) => {
              const percentage = (item.value / total) * 100;
              const color = getPieColor(index);

              return (
                <View key={index} style={styles.pieItem}>
                  <View style={[styles.pieColorBox, { backgroundColor: color }]} />
                  <Text style={styles.pieLabel}>
                    {item.label}: ¥{item.value} ({percentage.toFixed(1)}%)
                  </Text>
                </View>
              );
            })}
          </View>
        </View>
      </View>
    );
  };

  const getBarColor = (value, maxValue) => {
    const intensity = value / maxValue;
    if (intensity === 0) return '#333333';
    if (intensity < 0.3) return '#ffaa00';
    if (intensity < 0.7) return '#ff6600';
    return '#ff4444';
  };

  const getPieColor = (index) => {
    const colors = ['#ff4444', '#ffaa00', '#44aaff', '#44ff44', '#aa44ff'];
    return colors[index % colors.length];
  };

  // 根据类型渲染不同图表
  switch (type) {
    case 'line':
      return renderLineChart();
    case 'pie':
      return renderPieChart();
    case 'bar':
    default:
      return renderBarChart();
  }
}

const styles = StyleSheet.create({
  emptyContainer: {
    ...globalStyles.card,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 120,
  },

  emptyText: {
    color: '#666666',
    fontSize: 16,
    fontStyle: 'italic',
  },

  chartContainer: {
    ...globalStyles.card,
    marginVertical: 10,
  },

  chartTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#ffffff',
    textAlign: 'center',
    marginBottom: 15,
  },

  barsContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-around',
    height: 150,
    marginBottom: 10,
  },

  barGroup: {
    alignItems: 'center',
    flex: 1,
  },

  barContainer: {
    alignItems: 'center',
    justifyContent: 'flex-end',
    height: 130,
  },

  bar: {
    borderRadius: 4,
    minHeight: 2,
  },

  barValue: {
    color: '#ffffff',
    fontSize: 10,
    marginTop: 4,
    fontWeight: 'bold',
  },

  barLabel: {
    color: '#cccccc',
    fontSize: 11,
    marginTop: 5,
    textAlign: 'center',
  },

  yAxisContainer: {
    position: 'absolute',
    left: -30,
    top: 30,
    height: 120,
    justifyContent: 'space-between',
  },

  yAxisLabel: {
    color: '#cccccc',
    fontSize: 10,
  },

  lineChartContainer: {
    position: 'relative',
    marginVertical: 20,
  },

  lineSegment: {
    position: 'absolute',
    height: 2,
    backgroundColor: '#44aaff',
  },

  dataPoint: {
    position: 'absolute',
    width: 8,
    height: 8,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: '#ffffff',
  },

  pointValue: {
    position: 'absolute',
    top: -20,
    left: -10,
    color: '#ffffff',
    fontSize: 8,
    fontWeight: 'bold',
    minWidth: 20,
    textAlign: 'center',
  },

  xAxisContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: 10,
  },

  xAxisLabel: {
    color: '#cccccc',
    fontSize: 11,
    flex: 1,
    textAlign: 'center',
  },

  pieContainer: {
    alignItems: 'center',
  },

  pieChart: {
    width: '100%',
  },

  pieItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 5,
  },

  pieColorBox: {
    width: 12,
    height: 12,
    marginRight: 10,
    borderRadius: 2,
  },

  pieLabel: {
    color: '#ffffff',
    fontSize: 14,
    flex: 1,
  },
});