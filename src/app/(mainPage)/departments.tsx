import { useEffect, useState } from 'react';
import {
  FlatList,
  Image,
  SafeAreaView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import Toast from '@/components/toast';

import useVisualScheme from '@/store/visualScheme';

import { queryDepartmentInformation } from '@/request/api';
import { openPhoneNumber } from '@/utils/handleOpenURL';

interface DepartmentInformation {
  id: number;
  name: string;
  phone: string;
  place: string;
  time: string;
}

const Department = ({ info }: { info: DepartmentInformation }) => {
  const currentVisualScheme = useVisualScheme(state => state.currentStyle);

  return (
    <View
      style={[styles.card, currentVisualScheme?.information_background_style]}
    >
      <Text
        style={[styles.title, currentVisualScheme?.information_title_style]}
      >
        {info.name}
      </Text>
      <TouchableOpacity
        onPress={() => openPhoneNumber(info.phone)}
        style={styles.infoContainer}
      >
        <Image
          source={require('@/assets/images/phone.png')}
          style={styles.icon}
        ></Image>
        <Text style={{ color: '#9379F6' }}>{info.phone}</Text>
      </TouchableOpacity>
      <View
        style={[
          styles.infoContainer,
          {
            borderStyle: 'dashed',
            borderTopWidth: 1,
            borderBottomWidth: 1,
            borderColor: '#DFD7FD',
          },
        ]}
      >
        <Image
          source={require('@/assets/images/location.png')}
          // this icon is not a square, fxxk
          style={{ width: 15, height: 19, marginHorizontal: 2 }}
        ></Image>
        <Text style={currentVisualScheme?.information_text_style}>
          {info.place}
        </Text>
      </View>
      <View style={styles.infoContainer}>
        <Image
          source={require('@/assets/images/timep.png')}
          style={styles.icon}
        ></Image>
        <Text style={currentVisualScheme?.information_text_style}>
          {info.time}
        </Text>
      </View>
    </View>
  );
};

function Departments() {
  const [departments, setDepartments] = useState<DepartmentInformation[]>([]);

  useEffect(() => {
    queryDepartmentInformation()
      .then(res => {
        setDepartments(res.departments);
      })
      .catch(err => {
        Toast.show({ text: '获取部门信息失败' + err.toString() });
      });
  }, []);

  return (
    <SafeAreaProvider>
      <SafeAreaView style={styles.container}>
        <FlatList
          data={departments} // 显示网站数据
          renderItem={({ item }) => <Department info={item} />}
          keyExtractor={item => item.id.toString()}
          style={{ paddingTop: 15 }}
        />
      </SafeAreaView>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  card: {
    padding: 20,
    marginVertical: 15,
    marginHorizontal: 16,
    borderRadius: 10,
    flexDirection: 'column',
  },
  infoContainer: {
    height: 40,
    paddingHorizontal: 40,
    alignItems: 'center',
    gap: 10,
    flexDirection: 'row',
  },
  icon: {
    width: 20,
    height: 20,
  },
  title: {
    textAlign: 'center',
    fontSize: 20,
    fontWeight: 'bold',
  },
});

export default Departments;
