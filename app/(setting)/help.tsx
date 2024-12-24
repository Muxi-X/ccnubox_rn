import { SearchBar } from '@ant-design/react-native';
import React, { useState } from 'react';
import { Image, Text, View } from 'react-native';

import ThemeBasedView from '@/components/view';

function Help() {
  const [value, setValue] = useState('');
  return (
    <ThemeBasedView>
      <SearchBar
        placeholder="请输入问题"
        value={value}
        onChange={value => setValue(value)}
        onSubmit={value => {
          console.log(value);
          setValue('');
        }}
      />
      <View>
        <Image source={require('@/assets/images/check-update.png')} />
        <Text>常见问题</Text>
      </View>
    </ThemeBasedView>
  );
}
export default Help;
