import React, { useRef, useEffect } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { StatusBar } from 'expo-status-bar';

// 导入屏幕组件
import HomeScreen from './src/screens/HomeScreen';
import SetAlarmScreen from './src/screens/SetAlarmScreen';
import TriggerScreen from './src/screens/TriggerScreen';
import StatsScreen from './src/screens/StatsScreen';

// 导入服务
import { AlarmService } from './src/services/alarmService';

const Stack = createStackNavigator();

export default function App() {
  const navigationRef = useRef();

  useEffect(() => {
    // 设置导航引用，用于闹钟触发时自动跳转
    AlarmService.setNavigationRef(navigationRef);

    // 恢复闹钟调度（应用重启时）
    AlarmService.restoreAlarmSchedule();
  }, []);

  return (
    <NavigationContainer ref={navigationRef}>
      <StatusBar style="light" backgroundColor="#000000" />
      <Stack.Navigator
        initialRouteName="Home"
        screenOptions={{
          headerStyle: {
            backgroundColor: '#000000',
          },
          headerTintColor: '#ffffff',
          headerTitleStyle: {
            fontWeight: 'bold',
          },
          cardStyle: {
            backgroundColor: '#000000',
          },
        }}
      >
        <Stack.Screen
          name="Home"
          component={HomeScreen}
          options={{
            title: '唤醒闹钟',
            headerStyle: {
              backgroundColor: '#000000',
            },
          }}
        />
        <Stack.Screen
          name="SetAlarm"
          component={SetAlarmScreen}
          options={{
            title: '设置闹钟',
          }}
        />
        <Stack.Screen
          name="Trigger"
          component={TriggerScreen}
          options={{
            title: '闹钟触发',
            headerLeft: null, // 防止用户返回
            gestureEnabled: false, // 禁用手势返回
          }}
        />
        <Stack.Screen
          name="Stats"
          component={StatsScreen}
          options={{
            title: '起床统计',
          }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
}