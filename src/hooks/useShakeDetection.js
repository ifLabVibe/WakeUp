import { useState, useEffect, useRef } from 'react';
import { Accelerometer } from 'expo-sensors';

/**
 * 摇晃检测Hook
 * 使用加速度计检测设备摇晃行为
 */
export const useShakeDetection = (options = {}) => {
  const {
    threshold = 15,        // 摇晃阈值
    minimumShakeCount = 3, // 最小摇晃次数
    shakeInterval = 500,   // 摇晃间隔 (ms)
    onShake,              // 摇晃回调
    onShakeProgress,      // 摇晃进度回调
    enabled = true        // 是否启用检测
  } = options;

  const [isShaking, setIsShaking] = useState(false);
  const [shakeCount, setShakeCount] = useState(0);
  const [lastShakeTime, setLastShakeTime] = useState(0);

  // 用于计算摇晃强度
  const lastAcceleration = useRef({ x: 0, y: 0, z: 0 });
  const shakeBuffer = useRef([]);
  const subscriptionRef = useRef(null);

  useEffect(() => {
    if (!enabled) {
      stopListening();
      return;
    }

    startListening();

    return () => {
      stopListening();
    };
  }, [enabled, threshold, minimumShakeCount, shakeInterval]);

  const startListening = async () => {
    try {
      // 检查加速度计可用性
      const isAvailable = await Accelerometer.isAvailableAsync();
      if (!isAvailable) {
        console.warn('加速度计不可用');
        return;
      }

      // 设置更新频率 (100ms)
      Accelerometer.setUpdateInterval(100);

      // 开始监听
      subscriptionRef.current = Accelerometer.addListener(handleAccelerometerData);
      console.log('摇晃检测已启动');

    } catch (error) {
      console.error('启动摇晃检测失败:', error);
    }
  };

  const stopListening = () => {
    if (subscriptionRef.current) {
      subscriptionRef.current.remove();
      subscriptionRef.current = null;
      console.log('摇晃检测已停止');
    }
  };

  const handleAccelerometerData = (accelerometerData) => {
    const { x, y, z } = accelerometerData;
    const currentTime = Date.now();

    // 计算加速度变化量
    const deltaX = Math.abs(x - lastAcceleration.current.x);
    const deltaY = Math.abs(y - lastAcceleration.current.y);
    const deltaZ = Math.abs(z - lastAcceleration.current.z);

    // 总的加速度变化
    const totalDelta = deltaX + deltaY + deltaZ;

    // 更新上次加速度
    lastAcceleration.current = { x, y, z };

    // 检测摇晃
    if (totalDelta > threshold) {
      // 防止过于频繁的摇晃检测
      if (currentTime - lastShakeTime > shakeInterval) {
        handleShakeDetected(totalDelta);
        setLastShakeTime(currentTime);
      }
    }

    // 更新摇晃缓冲区（用于分析摇晃模式）
    updateShakeBuffer(totalDelta);
  };

  const handleShakeDetected = (intensity) => {
    setIsShaking(true);

    const newCount = shakeCount + 1;
    setShakeCount(newCount);

    console.log(`摇晃检测 ${newCount}: 强度 ${intensity.toFixed(2)}`);

    // 调用进度回调
    if (onShakeProgress) {
      onShakeProgress(newCount, intensity);
    }

    // 检查是否达到最小摇晃次数
    if (newCount >= minimumShakeCount && onShake) {
      onShake(newCount, intensity);
    }

    // 重置摇晃状态
    setTimeout(() => setIsShaking(false), 300);
  };

  const updateShakeBuffer = (intensity) => {
    const buffer = shakeBuffer.current;
    buffer.push({
      intensity,
      timestamp: Date.now()
    });

    // 保持缓冲区大小（最近10秒的数据）
    const tenSecondsAgo = Date.now() - 10000;
    shakeBuffer.current = buffer.filter(item => item.timestamp > tenSecondsAgo);
  };

  const resetShakeCount = () => {
    setShakeCount(0);
    setIsShaking(false);
    shakeBuffer.current = [];
  };

  const getShakeIntensity = () => {
    const buffer = shakeBuffer.current;
    if (buffer.length === 0) return 0;

    const totalIntensity = buffer.reduce((sum, item) => sum + item.intensity, 0);
    return totalIntensity / buffer.length;
  };

  const getShakePattern = () => {
    const buffer = shakeBuffer.current;
    if (buffer.length < 3) return 'unknown';

    // 分析摇晃模式
    const recentShakes = buffer.slice(-5);
    const averageIntensity = recentShakes.reduce((sum, item) => sum + item.intensity, 0) / recentShakes.length;

    if (averageIntensity > threshold * 2) return 'violent';
    if (averageIntensity > threshold * 1.5) return 'strong';
    if (averageIntensity > threshold) return 'normal';
    return 'gentle';
  };

  return {
    isShaking,
    shakeCount,
    shakeIntensity: getShakeIntensity(),
    shakePattern: getShakePattern(),
    resetShakeCount,
    startListening,
    stopListening
  };
};