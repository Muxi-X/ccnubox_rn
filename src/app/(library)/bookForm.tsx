import { Pressable, StyleSheet, Text, View } from 'react-native';
import PlaceIcon from '@/assets/icons/library/place.svg';
import TimeIcon from '@/assets/icons/library/timeIcon.svg';
import Form from '@/modules/library/room/components/form';
import { translate } from '@shopify/react-native-skia';
import { useRouter } from 'expo-router';
export default function BookForm() {
  return (
    <View>
      <View style={styles.mainForm}>
        <View>
          <Text style={styles.title}>研讨间：401</Text>
          <View style={styles.placeIcon}>
            <PlaceIcon />
            <Text style={styles.formText}>地点:</Text>
            <Text style={[styles.formText, { color: '#9278FE' }]}>
              主馆研讨间
            </Text>
          </View>

          <View style={styles.placeIcon}>
            <TimeIcon style={styles.timeIcon} />
            <Text style={styles.formText}>时间：</Text>
            <Text style={[styles.formText, { color: '#9278FE' }]}>
              2024年1月15日 19:00-21:00
            </Text>
          </View>
          <Form></Form>
        </View>
      </View>
      <Text style={styles.quickFill}>一键填写</Text>

      <Pressable>
        <View style={styles.quickFillBorder}>
          <Form></Form>
        </View>
      </Pressable>

      <Pressable>
        <View style={styles.quickFillBorder}>
          <Form></Form>
        </View>
      </Pressable>

      <Pressable>
        <View style={styles.quickFillBorder}>
          <Form></Form>
        </View>
      </Pressable>
      <View>
        <Pressable>
          <View style={styles.confirmButton}>
            <Text style={styles.confirmText}>确认预约</Text>
          </View>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  mainForm: {
    margin: 20,

    borderColor: 'grey',
    padding: 15,
    borderRadius: 30,
    boxShadow: '0 0 1px 2px rgba(0, 0, 0, 0.2)',
  },
  title: {
    fontSize: 25,
    color: '#8D40FF',
    fontWeight: 500,
    letterSpacing: 1,
  },
  placeIcon: {
    display: 'flex',
    flexDirection: 'row',
    gap: 10,
    marginTop: 10,
    alignItems: 'center',
  },
  timeIcon: {
    height: 60,
    width: 60,
    marginLeft: 3,
    marginRight: 3,
  },
  formText: {
    lineHeight: 30,
    fontSize: 17,
    fontWeight: 400,
  },
  quickFill: {
    fontSize: 23,
    color: '#8D40FF',
    marginLeft: 15,
    fontWeight: 500,
  },
  quickFillBorder: {
    borderWidth: 2,
    margin: 10,
    padding: 5,
    paddingBottom: 15,
    paddingLeft: 15,
    borderColor: '#D8D8D8',
    borderRadius: 20,
  },
  confirmButton: {
    width: 170,
    height: 55,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 10,
    backgroundColor: '#9278FE',
    position: 'absolute',
    left: '50%',
    bottom: 100,
    transform: 'translate(-50%,0)',
  },
  confirmText: {
    color: 'white',
    fontSize: 17,
  },
});
