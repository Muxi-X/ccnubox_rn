import { Carousel } from '@ant-design/react-native';
import { useRouter } from 'expo-router';
import React, { FC, memo, useEffect, useState } from 'react';
import {
  Text,
  View,
  StyleSheet,
  Image,
  ImageSourcePropType,
} from 'react-native';
import { DraggableGrid } from 'react-native-draggable-grid';

import Picker from '@/components/picker';
import Skeleton from '@/components/skeleton';
import { commonColors } from '@/styles/common';
import { keyGenerator } from '@/utils/autoKey';

type MainPageGridDataType = {
  text: string;
  imageUrl: ImageSourcePropType;
  key: string;
};
const IndexPage: FC = () => {
  const router = useRouter();
  const [banners, setBanners] = useState<
    { bannerUrl: string; navUrl: string }[]
  >([{ bannerUrl: '', navUrl: '' }]);
  const [data, setData] = useState<MainPageGridDataType[]>([
    {
      text: '我是',
      imageUrl: require('../../assets/images/mx-logo.png'),
      key: 'grid-1',
    },
  ]);
  const [loading, setLoading] = useState(true);
  const render = ({ key, text, imageUrl }: MainPageGridDataType) => {
    return (
      <View style={styles.item} key={key}>
        <Skeleton style={styles.item} loading={loading}>
          <Image
            style={{ width: 60, height: 60, borderRadius: 30 }}
            source={imageUrl}
          ></Image>
        </Skeleton>
        <Skeleton loading={loading}>
          <Text style={styles.itemText}>{text}</Text>
        </Skeleton>
      </View>
    );
  };
  useEffect(() => {
    setTimeout(() => {
      setLoading(!loading);
    }, 5000);
  }, []);
  return (
    <View style={styles.wrapper}>
      <Skeleton loading={loading}>
        <Carousel style={styles.banner} autoplay infinite dots={false}>
          {banners.map(banner => (
            <View
              style={styles.bannerItem}
              key={keyGenerator.next().value as unknown as number}
            ></View>
          ))}
        </Carousel>
      </Skeleton>
      <DraggableGrid
        numColumns={4}
        renderItem={render}
        data={data}
        onDragRelease={setData}
      ></DraggableGrid>
    </View>
  );
};

export default memo(IndexPage);

const styles = StyleSheet.create({
  button: {
    width: 150,
    height: 100,
    backgroundColor: 'blue',
  },
  banner: {
    width: '95%',
    height: 120,
    marginTop: 20,
    marginBottom: 60,
    alignSelf: 'center',
  },
  wrapper: {
    flex: 1,
    justifyContent: 'center',
  },
  item: {
    width: 100,
    height: 100,
    borderRadius: 8,
    margin: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  bannerItem: {
    width: '95%',
    height: 120,
    borderRadius: 10,
    backgroundColor: '#000',
  },
  itemText: {
    fontSize: 14,
    marginTop: 6,
    color: '#969696',
  },
});
