import React from 'react';
import {
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';

import useThemeBasedComponents from '@/store/themeBasedComponents';
import useVisualScheme from '@/store/visualScheme';
import Modal from '@/components/modal';

interface Props {
  setPattern: React.Dispatch<React.SetStateAction<number>>;
  pattern: number;
  navText: string[];
}
export default function Nabvar({ setPattern, pattern, navText }: Props) {
  const { currentStyle } = useVisualScheme(({ currentStyle }) => ({
    currentStyle,
  }));
  const currentComponents = useThemeBasedComponents(
    state => state.currentComponents
  );

  return (
    <View style={[styles.navbar]}>
      {navText.map((text, index) => (
        <TouchableOpacity
          key={index}
          onPress={() => setPattern(index)}
          style={[styles.navbarItem, index === pattern && styles.activeBar]}
        >
          <Text
            style={[
              styles.navbarText,
              index === pattern && {
                color: '#9379F6',
              },
            ]}
          >
            {text}
          </Text>
        </TouchableOpacity>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  navbar: {
    height: 60,
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    fontSize: 24,
    marginBottom: 20,
  },
  activeBar: {
    color: '#9379F6',
    borderBottomWidth: 3,
    borderColor: '#9379F6',
  },
  navbarText: {
    fontSize: 18,
    paddingHorizontal: 15,
  },
  navbarItem: {
    flex: 1,
    justifyContent: 'center',
    height: '100%',
    marginHorizontal: 20,
    borderBottomWidth: 3,
    borderColor: 'transparent',
  },
});
