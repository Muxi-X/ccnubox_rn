import { StyleSheet, Text, View } from 'react-native';

export interface rankingProps {
  ID: number;
  ranking: string;
  usageTimes: number;
}

export default function UsageRankingCard({
  ranking,
  usageTimes,
}: rankingProps) {
  return (
    <View style={styles.card}>
      <View style={styles.ring}>
        <View style={styles.circle}>
          <Text style={styles.usageTimes}>{usageTimes}h</Text>
          <Text style={styles.ranking}>{ranking}</Text>
        </View>
      </View>
      <Text style={styles.caption}>累计时长</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    width: 112,
    height: 156,
    borderRadius: 12,
    backgroundColor: '#ffffff',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    shadowColor: '#737272',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  ring: {
    width: 96,
    height: 96,
    borderRadius: 50,
    backgroundColor: '#E6EBFF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  circle: {
    width: 60,
    height: 60,
    borderRadius: 28,
    backgroundColor: '#ffffff',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
  },
  usageTimes: {
    fontSize: 18,
    fontWeight: '600',
    color: '#000000',
  },
  ranking: {
    fontSize: 12,
    color: '#9CA3AF',
  },
  caption: {
    fontSize: 14,
    color: '#6B7280',
  },
});
