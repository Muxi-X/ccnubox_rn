import * as Clipboard from 'expo-clipboard';
import * as React from 'react';
import { Image, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

import ThemeBasedView from '@/components/view';

function About() {
  const number = '576225292';
  const handleCopy = (text: string) => {
    Clipboard.setStringAsync(text).then(r => console.log(r));
    console.log('复制文本为：' + text);
  };

  return (
    <ThemeBasedView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerText}>关于</Text>
      </View>
      <View style={styles.infoContainer}>
        <Image
          source={require('../../assets/images/mx-logo.png')}
          style={styles.icon}
        />
        <Text style={styles.appName}>华师匣子</Text>
        <Text style={styles.version}>版本 2.5.14</Text>
      </View>
      <View style={styles.groupContainer}>
        <View style={styles.groupRow}>
          <Text style={styles.groupText}>匣子交流群：</Text>
          <Text style={styles.groupNumber}>{number}</Text>
          <TouchableOpacity onPress={() => handleCopy(number)}>
            <Text style={styles.copyText}>点击复制</Text>
          </TouchableOpacity>
        </View>
        <View style={styles.groupRow}>
          <Text style={styles.groupText}>木犀招新群：</Text>
          <Text style={styles.groupNumber}>{number}</Text>
          <TouchableOpacity onPress={() => handleCopy(number)}>
            <Text style={styles.copyText}>点击复制</Text>
          </TouchableOpacity>
        </View>
      </View>
      <TouchableOpacity style={styles.button}>
        <Text style={styles.buttonText}>进入华师匣子官网</Text>
      </TouchableOpacity>
    </ThemeBasedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F9FB',
    paddingHorizontal: 16,
    paddingVertical: 24,
  },
  header: {
    alignItems: 'center',
    marginBottom: 16,
  },
  headerText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  infoContainer: {
    alignItems: 'center',
    marginBottom: 24,
  },
  icon: {
    width: 120,
    height: 120,
    borderRadius: 20,
    marginBottom: 16,
  },
  appName: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
  },
  version: {
    fontSize: 14,
    color: '#666',
  },
  groupContainer: {
    backgroundColor: '#FFF',
    borderRadius: 8,
    padding: 16,
    marginBottom: 24,
    elevation: 2,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
  },
  groupRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  groupText: {
    fontSize: 14,
    color: '#333',
    flex: 1,
  },
  groupNumber: {
    fontSize: 14,
    color: '#666',
    marginHorizontal: 8,
  },
  copyText: {
    fontSize: 14,
    color: '#4A90E2',
  },
  button: {
    backgroundColor: '#7C4DFF',
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    height: 44,
  },
  buttonText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default About;
