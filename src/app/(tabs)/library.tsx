import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

import useVisualScheme from '@/store/visualScheme';

import DiamondIcon from '@/assets/icons/diamond.svg';
import SofaIcon from '@/assets/icons/sofa.svg';
import StatIcon from '@/assets/icons/stat.svg';
import TimeIcon from '@/assets/icons/time.svg';

const primaryColor = '#8B5CF6';
const secondaryColor = '#7D6EF9';

export default function LibraryPage() {
  const backgroundColor =
    useVisualScheme.getState().currentStyle?.background_style?.backgroundColor;
  const textColor = useVisualScheme.getState().currentStyle?.text_style?.color;

  return (
    <View style={[styles.container, { backgroundColor }]}>
      {/* Current Reservation Section */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={[styles.sectionTitle, { color: textColor }]}>
            当前预约①
          </Text>
          <TouchableOpacity>
            <Text style={styles.viewLocationText}>查看位置</Text>
          </TouchableOpacity>
        </View>

        <View style={[styles.card, styles.reservationCard]}>
          <View style={styles.reservationLeft}>
            <Text style={styles.areaText}>A区 3楼</Text>
            <Text style={[styles.seatNumber, { color: textColor }]}>
              A3-142号座位
            </Text>
            <Text style={styles.timeText}>使用时段: 14:00-18:00</Text>
          </View>
          <View style={styles.reservationRight}>
            <Text style={styles.timeLabel}>据开始</Text>
            <Text style={[styles.timeRemaining, { color: secondaryColor }]}>
              25分钟
            </Text>
            <Text style={styles.dateText}>今天</Text>
          </View>
        </View>
      </View>

      {/* Booking Options */}
      <View style={styles.section}>
        <View style={styles.bookingButtons}>
          <TouchableOpacity
            style={[styles.bookingButton, styles.primaryButton]}
          >
            <SofaIcon></SofaIcon>
            <Text style={styles.primaryButtonText}>座位预约</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.bookingButton, styles.secondaryButton]}
          >
            <Ionicons name="people-outline" size={32} color={primaryColor} />
            {/* <PeopleIcon></PeopleIcon> */}
            <Text style={[styles.secondaryButtonText, { color: textColor }]}>
              研讨间预约
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Real-time Data */}
      <View style={styles.section}>
        <View style={[styles.card, { backgroundColor: backgroundColor }]}>
          <Text
            style={[
              styles.sectionTitle,
              { color: textColor, marginBottom: 16 },
            ]}
          >
            实时数据
          </Text>
          <View style={styles.dataGrid}>
            <View style={styles.dataItem}>
              <Text style={[styles.dataNumber, { color: primaryColor }]}>
                85%
              </Text>
              <Text style={[styles.dataLabel, { color: textColor }]}>
                使用率
              </Text>
            </View>
            <View style={styles.dataItem}>
              <Text style={[styles.dataNumber, { color: primaryColor }]}>
                126
              </Text>
              <Text style={[styles.dataLabel, { color: textColor }]}>
                空闲座位
              </Text>
            </View>
            <View style={styles.dataItem}>
              <Text style={[styles.dataNumber, { color: primaryColor }]}>
                892
              </Text>
              <Text style={[styles.dataLabel, { color: textColor }]}>
                使用中
              </Text>
            </View>
          </View>
        </View>
      </View>

      {/* Common Functions */}
      <View style={styles.section}>
        <View style={[styles.card, { backgroundColor: backgroundColor }]}>
          <Text
            style={[
              styles.sectionTitle,
              { color: textColor, marginBottom: 16 },
            ]}
          >
            常用功能
          </Text>
          <View style={styles.functionsGrid}>
            <TouchableOpacity style={styles.functionItem}>
              <View style={styles.functionIcon}>
                <TimeIcon></TimeIcon>
              </View>
              <Text style={[styles.functionLabel, { color: textColor }]}>
                预约记录
              </Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.functionItem}>
              <View style={styles.functionIcon}>
                <Ionicons name="star" size={24} color={primaryColor} />
              </View>
              <Text style={[styles.functionLabel, { color: textColor }]}>
                我的收藏
              </Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.functionItem}>
              <View style={styles.functionIcon}>
                <StatIcon></StatIcon>
              </View>
              <Text style={[styles.functionLabel, { color: textColor }]}>
                使用统计
              </Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.functionItem}>
              <View style={styles.functionIcon}>
                <DiamondIcon></DiamondIcon>
              </View>
              <Text style={[styles.functionLabel, { color: textColor }]}>
                信誉积分
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  section: {
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
  },
  viewLocationText: {
    color: secondaryColor,
    fontSize: 14,
  },
  card: {
    padding: 16,
    borderRadius: 12,
    // backgroundColor: '#F3F4F6',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  reservationCard: {
    flexDirection: 'row',
    backgroundColor: '#F9F2FF',
  },
  reservationLeft: {
    flex: 1,
  },
  reservationRight: {
    alignItems: 'flex-end',
    justifyContent: 'center',
  },
  areaText: {
    color: '#6B7280',
    fontSize: 14,
    marginBottom: 12,
  },
  seatNumber: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 12,
  },
  timeText: {
    color: '#6B7280',
    fontSize: 14,
  },
  timeLabel: {
    color: '#6B7280',
    fontSize: 12,
    marginBottom: 8,
  },
  timeRemaining: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  dateText: {
    color: '#6B7280',
    fontSize: 12,
  },
  bookingButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  bookingButton: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 20,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  primaryButton: {
    backgroundColor: primaryColor,
  },
  secondaryButton: {
    backgroundColor: 'white',
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  primaryButtonText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '600',
    marginTop: 8,
  },
  secondaryButtonText: {
    fontSize: 14,
    fontWeight: '600',
    marginTop: 8,
  },
  dataGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  dataItem: {
    alignItems: 'center',
    flex: 1,
  },
  dataNumber: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  dataLabel: {
    fontSize: 12,
  },
  functionsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  functionItem: {
    alignItems: 'center',
    flex: 1,
  },
  functionIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#F3F4F6',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  functionLabel: {
    fontSize: 12,
    textAlign: 'center',
  },
});
