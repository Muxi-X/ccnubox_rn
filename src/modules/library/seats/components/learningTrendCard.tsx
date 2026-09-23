import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { LineChart } from 'react-native-gifted-charts';

type Point = number;

type Props = {
  title: string;
  unit: string; // "小时"
  labels: string[]; // ["3.1","3.7","3.13","3.19","3.25"]
  thisMonth: Point[]; // [4,6,7,8,8.5]
  lastMonth: Point[]; // [2.5,3.5,4,4.5,5]
  height?: number;
  maxY?: number; // 可固定上限，保持两条线对比一致
};

export function LearningTrendChartCard({
  title,
  unit,
  labels,
  thisMonth,
  lastMonth,
  height = 180,
  maxY,
}: Props) {
  const data = thisMonth.map((v, i) => ({ value: v, label: labels[i] }));
  const data2 = lastMonth.map((v, i) => ({ value: v, label: labels[i] }));

  return (
    <View style={styles.card}>
      <View style={styles.headerRow}>
        <Text style={styles.title}>{title}</Text>
        <Text style={styles.unit}>单位：{unit}</Text>
      </View>

      <LineChart
        data={data}
        data2={data2}
        stepValue={2}
        height={height}
        maxValue={maxY ?? 10}
        noOfSections={10}
        yAxisLabelWidth={28}
        showFractionalValues={false}
        // 坐标轴/网格
        rulesType="solid"
        rulesColor="#E5E7EB"
        yAxisColor="transparent"
        xAxisColor="#E5E7EB"
        yAxisTextStyle={{ color: '#9CA3AF', fontSize: 12 }}
        xAxisLabelTextStyle={{ color: '#D1D5DB', fontSize: 12 }}
        // 主线（本月）
        color1="#2F66FF"
        thickness1={2}
        dataPointsColor1="#2F66FF"
        dataPointsRadius1={4}
        dataPointsWidth1={2}
        dataPointsHeight1={2}
        // 次线
        color2="#D1D5DB"
        thickness2={2}
        dataPointsColor2="#D1D5DB"
        dataPointsRadius2={4}
        dataPointsWidth2={2}
        dataPointsHeight2={2}
        // 让折线更顺滑（可选）
        curved
        // 面积填充（实现你图里淡淡的底色）
        areaChart
        startFillColor="#2F66FF"
        endFillColor="#dbe0ed"
        startOpacity={0.12}
        endOpacity={0.02}
        // 细节
        hideOrigin
        initialSpacing={15}
        spacing={57} // 点与点的间距，按你的 label 数量调
      />
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#fff',
    borderRadius: 14,
    paddingVertical: 16,
    paddingHorizontal: 18,
    gap: 12,

    shadowColor: '#737272',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 6,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  title: { fontSize: 16, fontWeight: '600', color: '#111827' },
  unit: { fontSize: 14, color: '#6B7280' },
});
