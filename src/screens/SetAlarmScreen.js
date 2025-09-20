import React from 'react';
import { View, Text } from 'react-native';
import { globalStyles } from '../styles/globalStyles';
import Button from '../components/Button';

export default function SetAlarmScreen({ navigation }) {
  return (
    <View style={globalStyles.container}>
      <Text style={globalStyles.title}>设置闹钟</Text>

      <View style={globalStyles.marginTop}>
        <Text style={globalStyles.text}>闹钟设置页面开发中...</Text>
      </View>

      <Button
        title="返回"
        onPress={() => navigation.goBack()}
        style={globalStyles.marginTop}
      />
    </View>
  );
}