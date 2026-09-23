import { LearningTrendChartCard } from '@/modules/library/seats/components/learningTrendCard';
import MonthlyBookingCard from '@/modules/library/seats/components/monthlyBookingCard';
import TopUsageSeatCard from '@/modules/library/seats/components/topUsageSeatCard';
import UsageRankingCard from '@/modules/library/seats/components/usageRankingCard';
import { useState } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';

interface rankingProps {
  ID: number;
  ranking: string;
  usageTimes: number;
}
export default function usageStatistics() {
  const [usageCount] = useState(892);
  const [topUsageSeat] = useState({
    title: '最常使用座位 Top 1',
    location: '南湖分馆二楼',
    seatNumber: 'N2142 号座位',
    usageTimes: 57,
    usageHours: 126,
  });
  const [monthlyBookingCount] = useState(0);
  const [rankings] = useState<rankingProps[]>([
    {
      ID: 1,
      ranking: '第1名',
      usageTimes: 15,
    },
    {
      ID: 2,
      ranking: '第2名',
      usageTimes: 12,
    },
    {
      ID: 3,
      ranking: '第3名',
      usageTimes: 10,
    },
  ]);
  const [labels] = useState(['3.1', '3.7', '3.13', '3.19', '3.25']);

  // ② 本月数据（主数据）
  const [thisMonthData, setThisMonthData] = useState<number[]>([
    4, 6, 7, 8, 8.5,
  ]);

  // ③ 上月数据（对比）
  const [lastMonthData, setLastMonthData] = useState<number[]>([
    2.5, 3.5, 4, 4.5, 5,
  ]);
  return (
    <ScrollView style={styles.container}>
      <View style={styles.rankingContainer}>
        <View style={styles.rankingDisplay}>
          <View>
            <Text style={styles.summaryText}>
              本月进入预约系统{usageCount}次，加油～
            </Text>
          </View>
          <View style={styles.rankingsRow}>
            {rankings.map(item => (
              <UsageRankingCard
                key={item.ID}
                ranking={item.ranking}
                usageTimes={item.usageTimes}
                ID={item.ID}
              />
            ))}
          </View>
        </View>
      </View>
      <View style={styles.section}>
        <TopUsageSeatCard
          title={topUsageSeat.title}
          location={topUsageSeat.location}
          seatNumber={topUsageSeat.seatNumber}
          usageTimes={topUsageSeat.usageTimes}
          usageHours={topUsageSeat.usageHours}
        />
      </View>
      <View style={styles.section}>
        <MonthlyBookingCard
          title="本月累计预约"
          bookingCount={monthlyBookingCount}
        />
      </View>
      <View style={styles.section}>
        <LearningTrendChartCard
          title="本月学习时长趋势"
          unit="小时"
          labels={labels}
          thisMonth={thisMonthData}
          lastMonth={lastMonthData}
          maxY={10} // 固定 0~10
          height={160}
        />
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  rankingContainer: {
    marginTop: 16,
    width: 'auto',
    height: 'auto',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
  },
  rankingDisplay: {
    width: 375,
  },
  rankingsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 12,
  },
  summaryText: {
    fontSize: 14,
    color: '#6B7280',
  },
  section: {
    paddingHorizontal: 16,
    marginTop: 20,
  },
  chartPlaceholder: {
    flex: 1,
    minHeight: 140,
  },
});
