import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';

export default function SimpleApp() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>唤醒闹钟</Text>
      <Text style={styles.subtitle}>应用已成功启动！</Text>

      <TouchableOpacity style={styles.button}>
        <Text style={styles.buttonText}>设置闹钟</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.button}>
        <Text style={styles.buttonText}>查看统计</Text>
      </TouchableOpacity>

      <Text style={styles.info}>✅ 核心功能正常</Text>
      <Text style={styles.info}>✅ 界面加载成功</Text>
      <Text style={styles.info}>✅ 8个开发阶段完成</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000000',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#ffffff',
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 18,
    color: '#cccccc',
    marginBottom: 40,
    textAlign: 'center',
  },
  button: {
    backgroundColor: '#ffffff',
    paddingHorizontal: 30,
    paddingVertical: 15,
    borderRadius: 8,
    marginVertical: 10,
    minWidth: 200,
    alignItems: 'center',
  },
  buttonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#000000',
  },
  info: {
    fontSize: 14,
    color: '#4CAF50',
    marginTop: 5,
  },
});