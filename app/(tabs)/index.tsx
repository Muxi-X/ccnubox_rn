import { Button } from '@ant-design/react-native';
import { useRouter } from 'expo-router';
import React, { FC, memo, useEffect, useState } from 'react';
import { Text, View } from 'react-native';

import DatePicker from '@/components/picker';
import { scrapeCourse, scrapeGrade, semesterMap } from '@/constants/scraper';
import useNotification from '@/hooks/useNotification';
import useScraper from '@/store/scraper';
import { getUpdateInfo } from '@/utils/fetchUpdates';

const IndexPage: FC = () => {
  const [notification, registerNotification] = useNotification();
  const router = useRouter();
  const [modalVisible, setModalVisible] = useState(true);
  const inject = useScraper(state => state.injectJavaScript);
  const openModal = () => {
    setModalVisible(true);
  };
  useEffect(() => {
    getUpdateInfo().then(res => {
      alert(JSON.stringify(res));
    });
  }, []);
  const closeModal = () => {
    setModalVisible(false);
  };
  return (
    <View>
      <Text>Hello Index😎</Text>
      <Button
        onPress={() => {
          router.push('/auth/guide/');
        }}
      >
        前往登陆页面测试
      </Button>
      <Button
        loading={!notification}
        onPress={() => {
          registerNotification().then(null, null);
        }}
      >
        通知测试
      </Button>
      <Button onPress={() => openModal()}>modal测试</Button>
      <Button
        onPress={() => {
          inject(scrapeCourse(2024, semesterMap.first));
        }}
      >
        课表测试
      </Button>
      <Button
        onPress={() => {
          inject(scrapeGrade(2024, semesterMap.first));
        }}
      >
        成绩测试
      </Button>
      <Button
        onPress={() => {
          getUpdateInfo().then(res => {
            alert(JSON.stringify(res));
          });
        }}
      >
        文件测试
      </Button>
      {/*{JSON.stringify(getUpdateInfo())}*/}
      <DatePicker visible={modalVisible} onClose={closeModal}></DatePicker>
    </View>
  );
};

export default memo(IndexPage);
