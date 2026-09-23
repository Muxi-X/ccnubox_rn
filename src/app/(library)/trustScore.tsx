import Progress from '@/components/progress';
import { AboutSeatCard } from '@/modules/library/seats/components/aboutSeatCard';
import { useState } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';

interface deductionRecordProps {
  recordID: number;
  title: string;
  seatNumber: string;
  decreasePoints: string;
}
export default function TrustScore() {
  const [score, setScore] = useState(75);
  const [records, setRecords] = useState<deductionRecordProps[]>([
    {
      recordID: 1,
      title: '未及时签到',
      seatNumber: '222',
      decreasePoints: '-100分',
    },
    {
      recordID: 2,
      title: '未按时归还座位',
      seatNumber: '145',
      decreasePoints: '-100分',
    },
    {
      recordID: 3,
      title: '未及时签到',
      seatNumber: '322',
      decreasePoints: '-100分',
    },
  ]);
  return (
    <View style={styles.container}>
      <View style={styles.progressStyle}>
        <Progress
          size={200}
          format={p => {
            let score = 400;
            switch (p) {
              case 100:
                score = 400;
                break;
              case 75:
                score = 300;
                break;
              case 50:
                score = 200;
                break;
              case 25:
                score = 100;
                break;
              case 0:
                score = 0;
                break;
            }
            return (
              <View>
                <Text
                  style={{
                    fontSize: 35,
                    fontWeight: 'medium',
                    fontFamily: 'HarmonyOS Sans SC',
                  }}
                >
                  {score}
                </Text>
                <Text
                  style={{
                    fontSize: 15,
                    fontWeight: 'regular',
                    textAlign: 'center',
                  }}
                >
                  信誉分
                </Text>
              </View>
            );
          }}
          percent={75}
          strokeWidth={12}
          showText={true}
        />
      </View>
      <View style={styles.warningStyle}>
        <View style={styles.warnContainer}>
          <View style={styles.listContainer}>
            <Text
              style={{ fontSize: 16, fontFamily: 'MiSans', color: '#585757' }}
            >
              ·个人每月信用积分为400分
            </Text>
            <Text
              style={{ fontSize: 16, fontFamily: 'MiSans', color: '#585757' }}
            >
              ·违约一次扣除积分100分
            </Text>
            <Text
              style={{ fontSize: 16, fontFamily: 'MiSans', color: '#585757' }}
            >
              ·信用积分为零时，暂停7天使用空间管理
            </Text>
            <Text
              style={{ fontSize: 16, fontFamily: 'MiSans', color: '#585757' }}
            >
              ·7天后信用积分恢复为300分
            </Text>
          </View>
        </View>
      </View>
      <View style={styles.recordContainer}>
        <View style={styles.recordTitle}>
          <Text
            style={{
              fontSize: 20,
              color: '#272727',
              fontFamily: 'MiSans',
              fontWeight: 'regular',
            }}
          >
            扣分记录
          </Text>
        </View>
        <ScrollView>
          {records.map(item => {
            return (
              <AboutSeatCard
                key={item.recordID}
                title={item.title}
                seatNumber={item.seatNumber}
                decreasePoints={item.decreasePoints}
                favouriteDisplay={false}
              ></AboutSeatCard>
            );
          })}
        </ScrollView>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  progressStyle: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    width: '100%',
    height: 250,
  },
  warningStyle: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    height: 180,
    width: '100%',
  },
  warnContainer: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'flex-start',
    height: 149,
    width: 366,
    backgroundColor: '#F9F2FF',
    marginBottom: 20,
    borderRadius: 22,
  },
  listContainer: {
    color: '#585757',
    display: 'flex',
    flexDirection: 'column',
    gap: 12,
    justifyContent: 'center',
    fontFamily: 'MiSans',
    marginLeft: 20,
    width: 'auto',
  },
  recordContainer: {
    flex: 1,
    display: 'flex',
    alignItems: 'center',
  },
  recordTitle: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'flex-start',
    height: 35,
    width: 366,
  },
});
