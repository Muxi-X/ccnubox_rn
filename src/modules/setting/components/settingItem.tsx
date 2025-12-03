import { Href, useRouter } from 'expo-router';
import {
  Image,
  ImageSourcePropType,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

import useVisualScheme from '@/store/visualScheme';

interface ItemProps {
  icon: string;
  text: string;
  // with a Href, will navigate to the page
  // with a function, will execute the function
  to: Href | (() => void);
}

function SettingItem({ icon, text, to }: ItemProps) {
  const currentScheme = useVisualScheme(state => state.currentStyle);
  const navigation = useRouter();

  const handlePress = () => {
    if (typeof to === 'function') {
      to();
    } else {
      navigation.navigate(to);
    }
  };

  return (
    <TouchableOpacity style={styles.itemContainer} onPress={handlePress}>
      <View style={styles.iconContainer}>
        <Image
          source={icon as unknown as ImageSourcePropType}
          style={styles.icon}
        />
      </View>
      <Text style={[styles.title, currentScheme?.text_style]}>{text}</Text>
      <Text style={styles.arrow}>➔</Text>
    </TouchableOpacity>
  );
}

export default SettingItem;

const styles = StyleSheet.create({
  itemContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 15,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderColor: '#e0e0e0',
    // backgroundColor: '#fff',
  },
  iconContainer: {
    width: 30,
    height: 30,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 15,
  },
  icon: {
    width: 24,
    height: 24,
    tintColor: '#8a72f4', // 修改图标颜色
  },
  title: {
    flex: 1,
    fontSize: 16,
  },
  arrow: {
    fontSize: 18,
    color: '#ccc',
  },
});
