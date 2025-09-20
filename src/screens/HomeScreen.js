import React from 'react';
import { View, Text } from 'react-native';
import { globalStyles } from '../styles/globalStyles';
import Button from '../components/Button';

export default function HomeScreen({ navigation }) {
  return (
    <View style={globalStyles.container}>
      <Text style={globalStyles.title}>唤醒闹钟</Text>

      <View style={globalStyles.marginTop}>
        <Text style={globalStyles.text}>主页面开发中...</Text>
      </View>

      <Button
        title="设置闹钟"
        onPress={() => navigation.navigate('SetAlarm')}
        style={globalStyles.marginTop}
      />

      <Button
        title="查看统计"
        onPress={() => navigation.navigate('Stats')}
        variant="secondary"
      />
    </View>
  );
}