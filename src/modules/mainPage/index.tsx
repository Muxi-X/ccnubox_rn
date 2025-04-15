import { useRouter } from 'expo-router';
import React, { FC, memo, useEffect, useState } from 'react';
import { Pressable, StyleSheet, TouchableOpacity, View } from 'react-native';
import { DraggableGrid } from 'react-native-draggable-grid';
import Carousel from 'react-native-reanimated-carousel';

import Image from '@/components/image';
import Skeleton from '@/components/skeleton';
import Text from '@/components/text';
import ThemeChangeView from '@/components/view';

import useVisualScheme from '@/store/visualScheme';

import { mainPageApplications } from '@/constants/mainPageApplications';
import queryBanners from '@/request/api/queryBanners';
import { commonColors } from '@/styles/common';
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

  const loadBanners = async () => {
    const res = await queryBanners();
    if (res?.code === 0 && res.data?.banners) {
      setBanners(
        res.data.banners.map(
          (banner: { picture_link: string; web_link: string }) => ({
            bannerUrl: banner.picture_link,
            navUrl: banner.web_link,
          })
        )
      );
    }
  };

  useEffect(() => {
    loadBanners();
  }, []);

  const render = ({
    key,
    title,
    href,
    action,
    imageUrl,
  }: MainPageGridDataType) => {
    const handlePress = () => {
      if (href) {
        router.navigate(href);
      }
      if (action) {
        action();
      }
    };
    return (
      <TouchableOpacity onPress={handlePress}>
        <View style={styles.item} key={key}>
          <Skeleton style={styles.item}>
            <Image source={imageUrl}></Image>
          </Skeleton>
          <Skeleton>
            <Text style={styles.itemText}>{title}</Text>
          </Skeleton>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <ThemeChangeView style={[styles.wrapper, currentStyle?.background_style]}>
      {/* carousel */}
      <Skeleton>
        <View style={styles.banner}>
          <Carousel
            style={{ flex: 1, marginHorizontal: percent2px(2.5) }}
            width={percent2px(95)}
            height={120}
            autoPlay
            loop
            data={banners}
            scrollAnimationDuration={2000}
            renderItem={({ item }) => {
              return (
                <View
                  style={styles.bannerItem}
                  key={keyGenerator.next().value as unknown as number}
                >
                  <Pressable onPress={() => openBrowser(item.navUrl)}>
                    <Image
                      source={{ uri: item.bannerUrl }}
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
        numColumns={3}
        renderItem={render}
        data={data}
        onDragRelease={setData}
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
  bannerItem: {
    width: '95%',
    height: 120,
    borderRadius: 10,
    // backgroundColor: commonColors.purple,
  },
  itemText: {
    fontSize: 14,
    marginTop: 6,
    color: commonColors.darkGray,
  },
});
