import { Pressable, StyleSheet, Text, View } from 'react-native';
import ReturnIcon from '@/assets/icons/library/return.svg';
import { push } from 'expo-router/build/global-state/routing';
import { useRouter } from 'expo-router';
export default function RoomOption() {
  const router = useRouter();
  return (
    <View style={styles.card}>
      <View style={styles.border}>
        <View style={styles.roomOption}>
          <View>
            <Text style={styles.roomId}>40</Text>
            <Text>支持3-6人，位于图书馆4层</Text>
          </View>
          <Pressable
            onPress={() => {
              router.push('./bookForm');
            }}
          >
            <ReturnIcon style={styles.returnIcon} />
          </Pressable>
        </View>
        <View>
          <Text>Map</Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    display: 'flex',
    alignItems: 'center',
  },
  border: {
    height: 150,
    width: '90%',
    borderColor: '#9278FE',
    borderWidth: 2,
    marginTop: 20,
    borderRadius: 20,
    padding: 10,
    paddingLeft: 20,
  },
  roomId: {
    color: '#8344F6',
    fontSize: 30,
    fontWeight: 600,
  },
  roomOption: {
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  returnIcon: {
    position: 'relative',
    left: 15,
  },
});
