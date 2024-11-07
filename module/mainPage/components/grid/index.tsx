import * as Haptics from 'expo-haptics';
import React, { memo, useState } from 'react';
import { View, StyleSheet } from 'react-native';
import { DraggableGrid as Grid } from 'react-native-draggable-grid';

import {
  DraggableGridProps,
  GridDataType as ItemData,
} from '@/module/mainPage/components/grid/type';

/**
 * 可拖动 grid， 调的包
 * 不知道会不会用到，如果用不到就放 app/(tabs)/mainPage 中好了
 * @param initData 初始 data
 * @param renderItem 每个 item 渲染函数
 * @constructor
 */
const DraggableGrid: React.FC<DraggableGridProps> = ({
  data: initData,
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

  const onDragRelease = (data: ItemData[]) => {
    setData(data);
  };

  return (
    <View style={styles.wrapper}>
      <Grid
        numColumns={4}
        renderItem={renderItem}
        data={data}
        onDragItemActive={() => Haptics.selectionAsync()}
        // onDragStart={() => Haptics.selectionAsync()}
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
