import React, { memo, useState } from 'react';
import { View, StyleSheet, Text, Image } from 'react-native';
import { DraggableGrid as Grid } from 'react-native-draggable-grid';

import {
  DraggableGridProps,
  GridDataType as ItemData,
} from '@/components/grid/type';
import Skeleton from '@/components/skeleton';

const DraggableGrid: React.FC<DraggableGridProps> = ({
  data: initData,
  loading,
  renderItem,
}) => {
  const [data, setData] = useState<ItemData[]>(
    initData ?? [
      { name: '1', key: 'one' },
      { name: '2', key: 'two' },
      { name: '3', key: 'three' },
      { name: '4', key: 'four' },
    ]
  );

  const render = (item: ItemData) => {
    return (
      <View style={styles.item} key={item.key}>
        <Skeleton style={styles.item} loading={loading}>
          <Image
            style={{ width: 60, height: 60, borderRadius: 30 }}
            source={require('../../assets/images/mx-logo.png')}
          ></Image>
        </Skeleton>
        <Skeleton loading={loading}>
          <Text style={styles.itemText}>{item.name}</Text>
        </Skeleton>
      </View>
    );
  };

  const onDragRelease = (data: ItemData[]) => {
    setData(data);
  };

  return (
    <View style={styles.wrapper}>
      <Grid
        numColumns={4}
        renderItem={renderItem}
        data={data}
        onDragRelease={onDragRelease}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  button: {
    width: 150,
    height: 100,
    backgroundColor: 'blue',
  },
  wrapper: {
    paddingTop: 100,
    width: '100%',
    height: '100%',
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
  itemText: {
    fontSize: 14,
    marginTop: 6,
    color: '#969696',
  },
});

export default memo(DraggableGrid);
