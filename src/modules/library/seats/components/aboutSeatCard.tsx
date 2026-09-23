import { StyleSheet, Text, View } from 'react-native';
import LikeButton from './likebutton';
interface AboutSeatCardProps {
  title: string;
  seatNumber: string;
  decreasePoints?: string;
  favouriteDisplay: boolean;
  onPressFavourite?: () => void;
}

export const AboutSeatCard: React.FC<AboutSeatCardProps> = ({
  title,
  seatNumber,
  decreasePoints,
  favouriteDisplay,
  onPressFavourite,
}) => {
  return (
    <View style={styles.cardContainer}>
      <View style={styles.cardDisplay}>
        <View style={styles.titleContainer}>
          <Text
            style={{ fontSize: 18, color: '#6B4EFF', fontWeight: 'medium' }}
          >
            {title}
          </Text>
          <Text
            style={{ fontSize: 18, color: '#6B4EFF', fontWeight: 'medium' }}
          >
            {decreasePoints}
          </Text>
        </View>
        <View style={styles.subTitleContainer}>
          <Text style={{ color: '#737272', fontSize: 16 }}>
            座位号：{seatNumber}
          </Text>
          {favouriteDisplay ? <LikeButton></LikeButton> : ''}
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  cardContainer: {
    margin: 10,
    width: 366,
    height: 112,
    backgroundColor: '#FFFFFF',
    shadowColor: '#737272',
    shadowOpacity: 0.2,
    shadowOffset: { width: 0, height: 0 },
    borderRadius: 18,
  },
  cardDisplay: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-evenly',
    height: '100%',
    width: '100%',
  },
  titleContainer: {
    height: 24,
    width: 320,
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  subTitleContainer: {
    height: 24,
    width: 320,
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
});
