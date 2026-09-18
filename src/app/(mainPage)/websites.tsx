import { useEffect, useState } from 'react';
import {
  FlatList,
  Image,
  Pressable,
  SafeAreaView,
  StyleSheet,
} from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import Text from '@/components/text';
import Toast from '@/components/toast';
import { useInternalBroswer } from '@/hooks/useInternalBroswer';
import { queryWebsites } from '@/request/api';
import { commonColors } from '@/styles/common';

interface PopularWebsite {
  description: string;
  id: number;
  image: string;
  link: string;
  name: string;
}

type ItemProps = { title: string; _url: string; link: string };

const WebsiteItem = ({ title, _url, link }: ItemProps) => {
  const openInApp = useInternalBroswer();

  return (
    <Pressable style={styles.item} onPress={() => openInApp(link, title)}>
      <Image source={{ uri: _url }} style={styles.image} />
      <Text style={styles.title}>{title}</Text>
    </Pressable>
  );
};

const Websites = () => {
  const [websites, setWebsites] = useState<PopularWebsite[]>([]);

  useEffect(() => {
    queryWebsites()
      .then((res: any) => {
        if (res?.data?.websites) {
          setWebsites(res.data.websites);
        }
      })
      .catch(_error => {
        Toast.show({ icon: 'fail', text: '获取常用网站失败' });
      });
  }, []);

  return (
    <SafeAreaProvider>
      <SafeAreaView style={styles.container}>
        <FlatList
          data={websites} // 显示网站数据
          renderItem={({ item }) => (
            <WebsiteItem title={item.name} _url={item.image} link={item.link} />
          )}
          keyExtractor={item => item.id.toString()}
        />
      </SafeAreaView>
    </SafeAreaProvider>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  item: {
    padding: 20,
    marginVertical: 8,
    marginHorizontal: 16,
    borderBottomColor: commonColors.gray,
    borderBottomWidth: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },
  image: {
    width: 20,
    height: 20,
    marginRight: 16,
  },
  title: {
    fontSize: 20,
  },
});

export default Websites;
