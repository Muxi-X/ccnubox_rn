import { StyleSheet, Text, TextInput, View } from 'react-native';
import SearchIcon from '@/assets/icons/library/search.svg';
export default function addMember() {
  return (
    <View style={styles.view}>
      <View style={styles.searchBox}>
        <SearchIcon style={styles.searchIcon} />
        <TextInput style={styles.search}></TextInput>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  view: {
    display: 'flex',
    alignItems: 'center',
  },
  search: {
    borderWidth: 1,
    borderColor: '#D4B8FE',
    borderRadius: 30,
    width: '80%',
    height: 50,
    backgroundColor: '#F9EFFF',
  },
  searchBox: {
    width: '100%',
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
  },
  searchIcon: {},
});
