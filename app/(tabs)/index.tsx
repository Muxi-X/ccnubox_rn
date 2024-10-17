import { Button } from '@ant-design/react-native';
import { Href, useRouter } from 'expo-router';
import { getItem } from 'expo-secure-store';
import React, { FC, memo, useState } from 'react';
import { Text, View } from 'react-native';

import DatePicker from '@/components/picker';
import { scrapeCourse, scrapeGrade, semesterMap } from '@/constants/scraper';
import { registerForPushNotificationsAsync } from '@/hooks/useNotification';
import useScraper from '@/store/scraper';
import { getUpdateInfo } from '@/utils/fetchUpdates';

const IndexPage: FC = () => {
  const router = useRouter();
  const [modalVisible, setModalVisible] = useState(true);
  /* 注入 js 实现爬虫 */
  const inject = useScraper(state => state.injectJavaScript);
  const openModal = () => {
    setModalVisible(true);
  };
  const closeModal = () => {
    setModalVisible(false);
  };
  return (
    <View>
      <Text>Hello Index😎</Text>
      <Button
        onPress={() => {
          router.push('/auth/guide/' as Href);
        }}
      >
        前往登陆页面测试
      </Button>
      <Button
        onPress={async () => {
          const pushToken = getItem('pushToken');
          alert(pushToken);
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
      <DatePicker
        visible={modalVisible}
        prefixes={[, , '至']}
        onClose={closeModal}
      ></DatePicker>
    </View>
  );
};

export default memo(IndexPage);
