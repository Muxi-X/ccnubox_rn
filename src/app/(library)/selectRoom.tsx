import { Modal, Pressable, StyleSheet, Text, View } from 'react-native';
import PlaceIcon from '@/assets/icons/library/place.svg';
import { useState } from 'react';
import DatePicker from 'react-native-date-picker';
import TimeIcon from '@/assets/icons/library/timeIcon.svg';
import ReturnRightIcon from '@/assets/icons/library/return_left.svg';
import ReturnLeftIcon from '@/assets/icons/library/return_right.svg';
import StatusMap from '@/modules/library/room/components/statusMap';
import RoomOption from '@/modules/library/room/components/roomOptions';
import { router } from 'expo-router';

export default function ViewRooms() {
  const [placeFocus, setPlaceFocus] = useState(0);
  const [date, setDate] = useState(new Date());
  const [openDate, setOpenDate] = useState(false);
  const [openTime, setOpenTime] = useState(false);
  const [showMask, setShowMask] = useState(false);
  const [startTime, setStartTime] = useState(new Date());
  const [endTime, setEndTime] = useState(new Date());
  type ItemProps = { title: string };

  const Item = ({ title }: ItemProps) => (
    <View>
      <Text>{title}</Text>
    </View>
  );
  function DatePlus() {
    setDate(new Date(date.getTime() + 24 * 60 * 60 * 1000));
  }
  function DateMinus() {
    setDate(new Date(date.getTime() - 24 * 60 * 60 * 1000));
  }
  function formatDate(date: Date) {
    const hours = date.getHours().toString().padStart(2, '0'); // 补0
    const minutes = date.getMinutes().toString().padStart(2, '0');
    return `${hours}:${minutes}`;
  }
  return (
    <View style={{ flex: 1 }}>
      <View style={styles.place}>
        <View style={styles.placeIcon}>
          <PlaceIcon />
          <Text style={{ lineHeight: 30, fontSize: 20, fontWeight: 400 }}>
            地点:
          </Text>
        </View>
        <Pressable
          style={[
            styles.placeButton,
            { backgroundColor: placeFocus === 0 ? '#9278FE' : '#F9EFFF' },
          ]}
          onPress={() => {
            setPlaceFocus(0);
          }}
        >
          <Text style={{ color: placeFocus === 0 ? 'white' : 'black' }}>
            全部
          </Text>
        </Pressable>
        <Pressable
          style={[
            styles.placeButton,
            { backgroundColor: placeFocus === 1 ? '#9278FE' : '#F9EFFF' },
          ]}
          onPress={() => {
            setPlaceFocus(1);
          }}
        >
          <Text style={{ color: placeFocus === 1 ? 'white' : 'black' }}>
            主馆研讨间
          </Text>
        </Pressable>
        <Pressable
          style={[
            styles.placeButton,
            { backgroundColor: placeFocus === 2 ? '#9278FE' : '#F9EFFF' },
          ]}
          onPress={() => {
            setPlaceFocus(2);
          }}
        >
          <Text style={{ color: placeFocus === 2 ? 'white' : 'black' }}>
            南湖研讨间
          </Text>
        </Pressable>
      </View>

      <View style={styles.divider}></View>

      <View style={styles.time}>
        <View style={styles.placeIcon}>
          <TimeIcon style={styles.timeIcon} />
          <Text style={{ lineHeight: 25, fontSize: 20, fontWeight: 400 }}>
            时间：
          </Text>
        </View>

        <View style={styles.picker}>
          <View style={styles.datePicker}>
            <Pressable onPress={DateMinus}>
              <ReturnRightIcon />
            </Pressable>

            <Pressable
              onPress={() => setOpenDate(true)}
              style={styles.datePicker}
            >
              <Text>{date.toLocaleDateString()}</Text>
            </Pressable>

            <Pressable onPress={DatePlus}>
              <ReturnLeftIcon />
            </Pressable>

            <DatePicker
              mode="date"
              modal
              open={openDate}
              date={date}
              onConfirm={date => {
                setOpenDate(false);
                setDate(date);
              }}
              onCancel={() => {
                setOpenDate(false);
              }}
              locale="zh-Hans"
              title={'选择日期'}
              confirmText={'确认'}
              cancelText={'取消'}
            />
          </View>

          <Text style={styles.timeDivider}>|</Text>

          <View style={styles.timePicker}>
            <TimeIcon />
            <Pressable
              style={styles.duration}
              onPress={() => setShowMask(true)}
            >
              <Text>{formatDate(startTime)}</Text>
              <Text>-</Text>
              <Text>{formatDate(endTime)}</Text>
            </Pressable>
            {showMask && (
              <Modal
                visible={showMask}
                transparent={true}
                animationType="fade"
                onRequestClose={() => setShowMask(false)}
              >
                <View style={styles.mask}>
                  <View style={styles.modal}>
                    <View style={styles.modalHead}>
                      <Text style={[styles.headText, { paddingLeft: 25 }]}>
                        开始时间
                      </Text>
                      <Text style={[styles.headText, { paddingRight: 25 }]}>
                        结束时间
                      </Text>
                    </View>

                    <View style={styles.timePicker}>
                      <DatePicker
                        minuteInterval={5}
                        mode="time"
                        date={startTime}
                        style={{ width: 150 }}
                        onDateChange={setStartTime}
                      />
                      <DatePicker
                        minuteInterval={5}
                        mode="time"
                        date={endTime}
                        onDateChange={setEndTime}
                        minimumDate={startTime}
                        style={{ width: 150 }}
                      />
                    </View>

                    <View style={styles.divider}></View>

                    <Pressable
                      onPress={() => {
                        setShowMask(false);
                      }}
                    >
                      <View style={styles.confirm}>
                        <Text style={styles.confirmText}>确定</Text>
                      </View>
                    </Pressable>
                  </View>
                </View>
              </Modal>
            )}
          </View>
        </View>
      </View>

      <View style={styles.divider}></View>

      <StatusMap />

      <RoomOption />
      <RoomOption />
      <RoomOption />
    </View>
  );
}

const styles = StyleSheet.create({
  place: {
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'space-between',
    margin: 20,
  },
  placeButton: {
    height: 30,
    width: 85,
    borderRadius: 30,
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
  },
  placeIcon: {
    display: 'flex',
    flexDirection: 'row',
    gap: 10,
  },
  divider: {
    width: 800,
    height: 1,
    backgroundColor: 'grey',
    opacity: 0.5,
  },
  time: {
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'space-between',
    margin: 20,
    alignItems: 'center',
  },
  picker: {
    height: 40,
    width: 300,
    borderColor: '#D4B8FE',
    borderWidth: 1,
    borderRadius: 15,
    marginLeft: 20,
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  timeIcon: {
    height: 60,
    width: 60,
  },
  timeDivider: {
    fontSize: 28,
    lineHeight: 30,
    fontWeight: 300,
    color: '#D4B8FE',
    position: 'relative',
    left: 25,
  },
  datePicker: {
    width: 70,
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
  },
  timePicker: {
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
  },
  duration: {
    display: 'flex',
    flexDirection: 'row',
    marginLeft: 20,
    marginRight: 15,
  },
  mask: {
    height: '100%',
    width: '100%',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 20,
  },
  modal: {
    width: '70%',
    height: '35%',
    backgroundColor: 'white',
    borderRadius: 20,
    opacity: 1,
    display: 'flex',
    alignItems: 'center',
  },
  modalHead: {
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'space-between',
    backgroundColor: '#F9EFFF',
    padding: 10,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    height: 50,
    width: '100%',
  },
  headText: {
    color: '#8D40FF',
    lineHeight: 30,
    fontSize: 20,
  },

  confirm: {
    backgroundColor: '#8D40FF',
    height: 40,
    width: 150,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 15,
  },

  confirmText: {
    color: 'white',
    fontSize: 20,
  },
});
