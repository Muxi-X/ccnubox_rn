import { Button } from '@ant-design/react-native';
import { Href, useRouter } from 'expo-router';
import { getItem, setItem } from 'expo-secure-store';
import JPush from 'jpush-react-native';
import React, { FC, memo, ReactElement, useEffect, useState } from 'react';
import { Text, View } from 'react-native';
import { DraggableGrid } from 'react-native-draggable-grid';

import DatePicker from '@/components/picker';
import Skeleton, { SkeletonView } from '@/components/skeleton';
import { scrapeCourse, scrapeGrade, semesterMap } from '@/constants/scraper';
import { registerForPushNotificationsAsync } from '@/hooks/useNotification';
import useScraper from '@/store/scraper';
import { getUpdateInfo } from '@/utils/fetchUpdates';

const IndexPage: FC = () => {
  const router = useRouter();
  const [modalVisible, setModalVisible] = useState(true);
  const [loading, setLoading] = useState(true);
  const handleRender = (item: { key: number }, order: number): ReactElement => {
    return (
      <>
        <Skeleton loading={loading}>
          <Text>666</Text>
        </Skeleton>
      </>
    );
  };
  useEffect(() => {
    setTimeout(() => {
      setLoading(!loading);
    }, 5000);
  }, []);
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
      <SkeletonView loading={loading}>
        <Text style={{ marginBottom: 10, width: 80 }}>Hello Index😎</Text>
        <Button
          onPress={() => {
            router.push('/auth/guide/' as Href);
          }}
        >
          前往登陆页面测试
        </Button>
        <Button
          onPress={async () => {
            JPush.getRegistrationID(result => {
              console.log('registerID:' + JSON.stringify(result));
              setItem('pushToken', result.registerID);
            });
            const pushToken = getItem('pushToken');
            alert(pushToken);
          }}
        >
          通知测试
        </Button>
      </SkeletonView>

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
      <DraggableGrid
        numColumns={4}
        data={[{ key: 1 }, { key: 2 }, { key: 3 }, { key: 4 }, { key: 5 }]}
        renderItem={(item, order) => handleRender(item, order)}
      ></DraggableGrid>
    </View>
  );
};

export default memo(IndexPage);
