import React from 'react';
import { View, Text } from 'react-native';
import { globalStyles } from '../styles/globalStyles';
import Button from '../components/Button';

export default function TriggerScreen({ navigation }) {
  return (
    <View style={globalStyles.centerContainer}>
      <Text style={globalStyles.title}>摇晃关闭闹钟</Text>

      <View style={globalStyles.marginTop}>
        <Text style={globalStyles.text}>摇晃触发页面开发中...</Text>
      </View>

      <Button
        title="返回主页"
        onPress={() => navigation.navigate('Home')}
        style={globalStyles.marginTop}
      />
    </View>
  );
}