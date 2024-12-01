import { FlatList } from 'react-native';

import ThemeBasedView from '@/components/view';

import { SettingItems } from '@/constants/settingItem';
import { ListItem } from '@/constants/settingItem';
import SettingItem from '@/module/setting/components/settingItem';


export default function SettingPage() {
  return (
    <ThemeBasedView style={{ flex: 1 }}>
      <FlatList
        data={ListItem}
        renderItem={({ item }) => (
          <SettingItem icon={item.icon} text={item.text} />
        )}
        keyExtractor={item => item.id.toString()}
      />
      <Button
        style={[currentStyle?.button_style, { width: '100%' }]}
        onPress={() => {
          changeTheme(themeName === 'dark' ? 'light' : 'dark');
        }}
      >
        切换模式
      </Button>
      <Button
        onPress={() => {
          changeLayout(layoutName === 'android' ? 'ios' : 'android');
        }}
        style={[currentStyle?.button_style, { width: '100%' }]}
      >
        {'切换主题,当前主题：' + layoutName}
      </Button>
      <Button
        style={[currentStyle?.button_style, { width: '100%' }]}
        onPress={() => {
          setLoading(true);
          Updates.checkForUpdateAsync()
            .then(res => {
              if (!res.isAvailable) {
                Toast.show({ text: '已是最新版', icon: 'success' });
              }
            })
            .catch(err => {
              Toast.show({ text: '我是谁' });
            })
            .finally(() => {
              setLoading(false);
            });
        }}
        isLoading={loading}
        children="检查更新"
      />
      <StatusBar style="auto" />
      <Picker>
        <Text style={currentStyle?.text_style}>345345</Text>
      </Picker>
    </ThemeBasedView>
  );
}
