import { StyleSheet, Text, View } from 'react-native';

export interface TopUsageSeatCardProps {
  title: string;
  location: string;
  seatNumber: string;
  usageTimes: number;
  usageHours: number;
}

export default function TopUsageSeatCard({
  title,
  location,
  seatNumber,
  usageTimes,
  usageHours,
}: TopUsageSeatCardProps) {
  return (
    <View style={styles.card}>
      <Text style={styles.title}>{title}</Text>
      <Text style={styles.location}>{location}</Text>
      <Text style={styles.seatNumber}>{seatNumber}</Text>
      <View style={styles.metricsRow}>
        <Text style={styles.metric}>累计使用：{usageTimes}次</Text>
        <Text style={styles.metric}>累计使用：{usageHours}小时</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#F6F7FF',
    borderRadius: 14,
    paddingVertical: 16,
    paddingHorizontal: 18,
    gap: 8,
  },
  title: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 8,
  },
  location: {
    fontSize: 14,
    color: '#6B7280',
    textAlign: 'center',
  },
  seatNumber: {
    fontSize: 20,
    fontWeight: '700',
    color: '#6B4EFF',
    textAlign: 'center',
  },
  metricsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 8,
  },
  metric: {
    fontSize: 14,
    color: '#6B7280',
  },
});
