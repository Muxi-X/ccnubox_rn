import { StyleSheet, Text, View } from 'react-native';
interface appointmentSeatProps {
  title: string;
  status: 0 | 1 | 2; //这里的作用是根据数字确定预约记录的状态。0表示已结束，1表示进行中，2表示违约。
  appointmentTime: string;
  position: string;
  seatNumber: string;
  checkIn: string;
  checkOut: string;
  defaultReason?: string;
}

type StatusComponentProps = {
  status: 0 | 1 | 2;
};

export const RecordCard: React.FC<appointmentSeatProps> = ({
  title,
  status,
  seatNumber,
  appointmentTime,
  position,
  checkIn,
  checkOut,
  defaultReason,
}) => {
  const StatusComponent: React.FC<StatusComponentProps> = ({ status }) => {
    switch (status) {
      case 0:
        return (
          <View
            style={{
              backgroundColor: '#EFEFEF',
              width: 60,
              height: 30,
              borderRadius: 8,
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
            }}
          >
            <Text style={{ color: '#3D3D3D', fontSize: 12 }}>已结束</Text>
          </View>
        );
      case 1:
        return (
          <View
            style={{
              backgroundColor: '#F0FDF4',
              width: 60,
              height: 30,
              borderRadius: 8,
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
            }}
          >
            <Text style={{ color: '#7AC589', fontSize: 12 }}>进行中</Text>
          </View>
        );
      case 2:
        return (
          <View
            style={{
              backgroundColor: '#FEF2F2',
              width: 60,
              height: 30,
              borderRadius: 8,
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
            }}
          >
            <Text style={{ color: '#DF2828', fontSize: 12 }}>违约</Text>
          </View>
        );
      default:
        return null;
    }
  };

  return (
    <View style={styles.cardContainer}>
      <View style={styles.cardDisplay}>
        <View style={styles.titleContainer}>
          <Text
            style={{ fontSize: 18, color: '#6B4EFF', fontWeight: 'medium' }}
          >
            {title}
          </Text>
          <StatusComponent status={status} />
        </View>
        <View style={styles.subTitleContainer}>
          <View style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
            <Text style={{ color: '#737272', fontSize: 16 }}>
              预约时间段：{appointmentTime}
            </Text>
            <Text style={{ color: '#737272', fontSize: 16 }}>{position}</Text>
            <Text style={{ color: '#737272', fontSize: 16 }}>
              座位：{seatNumber}
            </Text>
            <View
              style={{
                display: 'flex',
                flexDirection: 'row',
                justifyContent: 'space-between',
                width: '100%',
              }}
            >
              <Text style={{ color: '#737272', fontSize: 16 }}>
                签到：{checkIn}
              </Text>
              <Text style={{ color: '#737272', fontSize: 16 }}>
                签退：{checkOut}
              </Text>
            </View>
            {defaultReason && (
              <View
                style={{
                  backgroundColor: '#FEF2F2',
                  width: 171,
                  height: 24,
                  borderRadius: 8,
                  display: 'flex',
                  justifyContent: 'center',
                  alignItems: 'center',
                }}
              >
                <Text style={{ color: '#DF2828', fontSize: 12 }}>
                  {defaultReason}
                </Text>
              </View>
            )}
          </View>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  cardContainer: {
    marginTop: 20,
    width: 366,
    height: 'auto',
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
    gap: 4,
    width: '100%',
    marginVertical: 20,
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
    marginTop: 10,
    width: 320,
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
});
