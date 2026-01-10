import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { StyleSheet, TextInput, TouchableOpacity, View } from 'react-native';

import useVisualScheme from '@/store/visualScheme';

import { SearchBarProps } from './type';

const SearchBar: React.FC<SearchBarProps> = ({
  value,
  onChange,
  onSubmit,
  placeholder = '搜索',

  containerStyle,
  inputStyle,
  iconColor = '#9CA3AF',
  placeholderTextColor = '#9CA3AF',
}) => {
  const { currentStyle } = useVisualScheme(({ currentStyle }) => ({
    currentStyle,
  }));

  return (
    <View
      style={[
        styles.container,
        currentStyle?.header_background_style,
        containerStyle,
      ]}
    >
      <Ionicons name="search" size={18} color={iconColor} />

      <TextInput
        value={value}
        onChangeText={onChange}
        onSubmitEditing={onSubmit}
        placeholder={placeholder}
        placeholderTextColor={placeholderTextColor}
        style={[styles.input, currentStyle?.text_style, inputStyle]}
        returnKeyType="search"
      />

      {value.length > 0 && (
        <TouchableOpacity onPress={() => onChange('')}>
          <Ionicons name="close-circle" size={18} color={iconColor} />
        </TouchableOpacity>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 40,
    borderRadius: 12,
    marginTop: 8,
    paddingHorizontal: 12,
  },
  input: {
    flex: 1,
    paddingVertical: 0,
    paddingHorizontal: 8,
    fontSize: 16,
  },
});

export default SearchBar;
