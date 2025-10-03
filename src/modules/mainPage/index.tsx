import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Haptics from 'expo-haptics';
import { useRouter } from 'expo-router';
import React, { FC, memo, useEffect, useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { DraggableGrid } from 'react-native-draggable-grid';
import Carousel from 'react-native-reanimated-carousel';

import Image from '@/components/image';
import Skeleton from '@/components/skeleton';
import Text from '@/components/text';
import ThemeChangeView from '@/components/view';

import useVisualScheme from '@/store/visualScheme';

import { mainPageApplications } from '@/constants/mainPageApplications';
import { queryBanners } from '@/request/api';
import { keyGenerator, percent2px } from '@/utils';
import { openBrowser } from '@/utils/handleOpenURL';

import { MainPageGridDataType } from '@/types/mainPageGridTypes';

const IndexPage: FC = () => {
  const router = useRouter();
  const [banners, setBanners] = useState<
    {
      bannerUrl: string;
      navUrl: string;
    }[]
  >([]);
  const currentStyle = useVisualScheme(state => state.currentStyle);
  const [data, setData] =
    useState<MainPageGridDataType[]>(mainPageApplications);

  useEffect(() => {
    const loadSavedOrder = async () => {
      try {
        const savedOrder = await AsyncStorage.getItem('@draggable_grid_order');
        if (savedOrder) {
          const order = JSON.parse(savedOrder);
          // Reconstruct full data while preserving original items
          const newData = order
            .map(
              ({ key }: { key: string }) =>
                mainPageApplications.find(item => item.key === key) || { key }
            )
            .filter((item: MainPageGridDataType) => item.key); // Filter out invalid items
          setData(newData.length ? newData : mainPageApplications);
        }
      } catch (e) {
        console.error('Failed to load grid order', e);
      }
    };
    loadSavedOrder();

    queryBanners().then((res: any) => {
      setBanners(
        res.data.banners.map(
          (banner: { picture_link: string; web_link: string }) => ({
            bannerUrl: banner.picture_link,
            navUrl: banner.web_link,
          })
        )
      );
    });
  }, []);
  const onDragRelease = async (data: any[]) => {
    setData(data);
    try {
      await AsyncStorage.setItem('@draggable_grid_order', JSON.stringify(data));
    } catch (e) {
      console.error('Failed to save grid order', e);
    }
  };

  const renderGridImage = (imageUrl: MainPageGridDataType['imageUrl']) => {
    if (typeof imageUrl === 'function') {
      const SvgComponent = imageUrl;
      return <SvgComponent width={50} height={50} />;
    }
    return <Image source={imageUrl} />;
  };

  const render = ({ key, title, imageUrl }: MainPageGridDataType) => {
    return (
      <View style={styles.item} key={key}>
        <Skeleton>
          <View style={styles.itemImage}>{renderGridImage(imageUrl)}</View>
        </Skeleton>
        <Skeleton>
          <Text style={styles.itemText}>{title}</Text>
        </Skeleton>
      </View>
    );
  };

  return (
    <ThemeChangeView style={[styles.wrapper, currentStyle?.background_style]}>
      {/* carousel */}
      <Skeleton>
        <View style={styles.banner}>
          <Carousel
            style={{ marginHorizontal: percent2px(2.5) }}
            width={percent2px(95)}
            height={140}
            data={banners}
            autoPlay
            loop
            scrollAnimationDuration={1500}
            renderItem={({ item }) => {
              return (
                <View
                  style={styles.bannerItem}
                  key={keyGenerator.next().value as unknown as number}
                >
                  <Pressable onPress={() => openBrowser(item.navUrl)}>
                    <Image
                      source={{ uri: item.bannerUrl, cache: 'force-cache' }}
                      style={{
                        width: '100%',
                        height: '100%',
                        borderRadius: 10,
                      }}
                    ></Image>
                  </Pressable>
                </View>
              );
            }}
          ></Carousel>
        </View>
      </Skeleton>
      {/* 功能列表 */}
      <DraggableGrid
        onItemPress={data => {
          if (data.href) {
            router.push(data.href);
          }
          if (data.action) {
            data.action();
          }
        }}
        numColumns={3}
        onDragItemActive={() => Haptics.selectionAsync()}
        renderItem={render}
        data={data}
        onDragRelease={onDragRelease}
      ></DraggableGrid>
    </ThemeChangeView>
  );
};

export default memo(IndexPage);

const styles = StyleSheet.create({
  button: {
    width: 150,
    height: 100,
  },
  banner: {
    width: '95%',
    height: 120,
    marginTop: 20,
    overflow: 'hidden',
    marginBottom: 10,
    alignSelf: 'center',
    // justifyContent: 'center',
  },
  wrapper: {
    flex: 1,
    justifyContent: 'center',
  },
  item: {
    width: percent2px(30, 'width'),
    height: 100,
    borderRadius: 8,
    margin: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  itemImage: {
    height: 50,
    width: 50,
    justifyContent: 'center',
    alignItems: 'center',
  },
  itemText: {
    fontSize: 14,
    marginTop: 6,
    color: '#969696',
  },
  bannerItem: {
    width: '95%',
    height: 120,
    borderRadius: 10,
  },
});
