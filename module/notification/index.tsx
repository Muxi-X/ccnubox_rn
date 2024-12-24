import { getItem } from 'expo-secure-store';
import React, { FC, memo, useEffect, useState } from 'react';
import { Image, ImageSourcePropType, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

import Skeleton from '@/components/skeleton';

import useVisualScheme from '@/store/visualScheme';

const NotificationPage: FC = () => {
  const [loading, setLoading] = useState<boolean>(true);
  const currentStyles = useVisualScheme(state => state.currentStyle);
  useEffect(() => {
    setTimeout(() => {
      setLoading(false);
    }, 2000);
  }, []);

  const feedIcon = [{
    label: 'class',
    icon: require('@/assets/images/noti-class.png'),
    title: '上课'
  },{
    label: 'grade',
    icon: require('@/assets/images/a-grade.png'),
    title: '成绩'
  },{
    label: 'muxi',
    icon: require('@/assets/images/a-muxi.png'),
    title: '木犀官方'
  },{
    label: 'holiday',
    icon: require('@/assets/images/a-holiday.png'),
    title: '假期临近'
  },{
    label: 'air_conditioner',
    icon: require('@/assets/images/a-air.png'),
    title: '空调电费告急'
  },{
    label: 'light',
    icon: require('@/assets/images/a-light.png'),
    title: '照明电费告急'
  }]
  return (
    <View style={[{ flex: 1 }, currentStyles?.background_style]}>
      {/* <Skeleton loading={loading}> */}
        <View>
        {
          feedIcon.map((item, index) => (
            <ListItem key={index} {...item}/>
          ))
        }
        </View>
      {/* </Skeleton> */}
    </View>
  );
};

interface ListItemProps {
  label: string;
  icon: ImageSourcePropType;
  title: string;
}

const ListItem: FC<ListItemProps> = ({ label, icon, title }) => {
  const currentStyle = useVisualScheme(state => state.currentStyle);
  return (
    <TouchableOpacity
    style={styles.listItem}>
      <View>
        <Image source={icon} style={styles.icon} />
      </View>
      <View
      style={styles.content}>
        <Text style={[styles.title,currentStyle?.schedule_text_style,]}>{title}提醒</Text>
        <Text style={[{
          color: '#3D3D3D',
          fontSize: 14,
          paddingTop: 2,
          fontWeight: '300'
        },currentStyle?.notification_text_style,]}>{label}</Text>
      </View>
      <View style={
        styles.right
      }>
        <View>
          <Text
          style={[styles.time]}>12:00</Text>
        </View>
        <View
        style={styles.badge}>
          <Text style={{
            fontSize:10,
            textAlign: 'center',
            color: '#fff',}}>{
              109 > 99 ? '99+' : 109
            }</Text>
        </View>
      </View>

    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  listItem: {
    width: '100%',
    padding: 16,
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  icon: {
    width: 30,
    height: 30,
    marginRight: 15,
    resizeMode: 'contain',
  },
  title: {
    fontSize: 16,
    fontWeight: 500
  },
  content: {
    flex: 1,
  },
  right:{
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'flex-end',
  },
  time: {
    fontSize: 10,
    position: 'relative',
    color: '#949494',
  },
  badge: {
    justifyContent: 'center',
    alignItems: 'center',
    height: 16,
    borderRadius: 8,
    paddingHorizontal: 4,
    paddingVertical: 0,
    backgroundColor: '#FF7474',
  },
});

export default memo(NotificationPage);
