import { useEffect, useState } from 'react';
import {
  FlatList,
  Image,
  Pressable,
  SafeAreaView,
  StyleSheet,
  Text,
} from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import useVisualScheme from '@/store/visualScheme';

import { queryWebsites } from '@/request/api';
import { commonColors } from '@/styles/common';
import handleOpenURL from '@/utils/handleOpenURL';

interface PopularWebsite {
  description: string;
  id: number;
  image: string;
  link: string;
  name: string;
}

type ItemProps = { title: string; _url: string; link: string };

const WebsiteItem = ({ title, _url, link }: ItemProps) => {
  const currentVisualScheme = useVisualScheme(state => state.currentStyle);

  return (
    <Pressable
      style={styles.item}
      onPress={() => handleOpenURL(link, '网站应用')}
    >
      <Image source={{ uri: _url }} style={styles.image} />
      <Text style={[styles.title, currentVisualScheme?.text_style]}>
        {title}
      </Text>
    </Pressable>
  );
};

const Websites = () => {
  const [websites, setWebsites] = useState<PopularWebsite[]>([]);

  useEffect(() => {
    queryWebsites()
      .then((res: any) => {
        setWebsites(res.data.websites);
      })
      .catch(error => {
        console.error(error);
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
    // backgroundColor: '#f9c2ff',
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
