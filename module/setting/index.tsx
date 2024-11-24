import { FlatList } from 'react-native';

import ThemeBasedView from '@/components/view';

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
    </ThemeBasedView>
  );
}
