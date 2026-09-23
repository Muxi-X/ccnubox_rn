import { StyleSheet, Text, View } from 'react-native';

export interface MonthlyBookingCardProps {
  title: string;
  bookingCount: number;
}

export default function MonthlyBookingCard({
  title,
  bookingCount,
}: MonthlyBookingCardProps) {
  return (
    <View style={styles.card}>
      <Text style={styles.title}>{title}</Text>
      <View style={styles.countRow}>
        <Text style={styles.count}>{bookingCount}</Text>
        <Text style={styles.unit}>次</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#F6F7FF',
    borderRadius: 14,
    paddingVertical: 18,
    paddingHorizontal: 18,
    gap: 10,
  },
  title: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
  },
  countRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'flex-end',
    gap: 4,
  },
  count: {
    fontSize: 30,
    fontWeight: '700',
    color: '#111827',
  },
  unit: {
    fontSize: 12,
    color: '#6B7280',
    marginBottom: 4,
  },
});
