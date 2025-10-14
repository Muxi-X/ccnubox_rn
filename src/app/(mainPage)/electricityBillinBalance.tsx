import { router, useLocalSearchParams } from 'expo-router';
import { useEffect, useState } from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

import { getPrice } from '@/request/api/electricity';
import useVisualScheme from '@/store/visualScheme';

interface PriceData {
  remain_money: string;
  yesterday_use_money: string;
  yesterday_use_value: string;
}

const ElectricityBillinBalance = () => {
  const currentStyle = useVisualScheme(state => state.currentStyle);
  const { building, room, area, room_id } = useLocalSearchParams<{
    building?: string;
    room?: string;
    area?: string;
    room_id?: string;
  }>();

  const [priceData, setPriceData] = useState<PriceData | null>(null);
  const [loading, setLoading] = useState(false);

  // 加载电费数据
  useEffect(() => {
    if (room_id) {
      loadPriceData(room_id);
    }
  }, [room_id]);

  const loadPriceData = async (id: string) => {
    try {
      setLoading(true);
      console.log('开始加载电费数据，房间ID:', id);
      const response: any = await getPrice(id);
      console.log('电费数据响应:', response);

      // API 实际返回的是 data，而不是 schema 中定义的 msg
      const priceInfo = response?.data?.price || response?.msg?.price;

      if (priceInfo) {
        console.log('电费信息:', priceInfo);
        setPriceData(priceInfo);
      } else {
        console.log('没有电费数据，响应结构:', response);
      }
    } catch (error) {
      console.error('加载电费数据失败:', error);
    } finally {
      setLoading(false);
    }
  };

  // 格式化显示信息
  const formatDormInfo = () => {
    if (!building || !room) return '未选择宿舍';
    const buildingFormatted = building.replace(/0(\d)栋/, '$1栋');
    return `${buildingFormatted}    ${room}`;
  };

  const handleChangeDorm = () => {
    router.back();
  };

  return (
    <View style={[styles.container, currentStyle?.background_style]}>
      {/* 宿舍信息栏 */}
      <View style={styles.dormInfoContainer}>
        <Text style={styles.dormInfoText}>{formatDormInfo()}</Text>
        <TouchableOpacity
          style={[styles.changeButton, currentStyle?.button_style]}
          onPress={handleChangeDorm}
        >
          <Text
            style={[
              styles.changeButtonText,
              currentStyle?.elecprice_change_button_text_style,
            ]}
          >
            更换宿舍
          </Text>
        </TouchableOpacity>
      </View>

      {/* 电费卡片区域 */}
      <View style={styles.contentContainer}>
        {loading ? (
          <Text style={styles.loadingText}>加载中...</Text>
        ) : priceData ? (
          <>
            {/* 照明卡片 */}
            <View
              style={[styles.card, currentStyle?.elecprice_lighting_card_style]}
            >
              <View style={styles.cardHeader}>
                <View style={styles.iconContainer}>
                  <Text style={styles.iconText}>💡</Text>
                </View>
                <Text style={[styles.cardTitle, currentStyle?.text_style]}>
                  照明
                </Text>
                <Text style={[styles.cardPrice, currentStyle?.text_style]}>
                  ¥ {priceData.remain_money}
                </Text>
              </View>
              <View style={styles.cardFooter}>
                <Text style={[styles.cardFooterText, currentStyle?.text_style]}>
                  昨日用电: {priceData.yesterday_use_value}度
                </Text>
                <Text style={[styles.cardFooterText, currentStyle?.text_style]}>
                  昨日电费: {priceData.yesterday_use_money}元
                </Text>
              </View>
            </View>

            {/* 空调卡片 */}
            <View
              style={[
                styles.card,
                currentStyle?.elecprice_air_conditioner_card_style,
              ]}
            >
              <View style={styles.cardHeader}>
                <View style={styles.iconContainer}>
                  <Text style={styles.iconText}>❄️</Text>
                </View>
                <Text style={[styles.cardTitle, currentStyle?.text_style]}>
                  空调
                </Text>
                <Text style={[styles.cardPrice, currentStyle?.text_style]}>
                  ¥ {priceData.remain_money}
                </Text>
              </View>
              <View style={styles.cardFooter}>
                <Text style={[styles.cardFooterText, currentStyle?.text_style]}>
                  昨日用电: {priceData.yesterday_use_value}度
                </Text>
                <Text style={[styles.cardFooterText, currentStyle?.text_style]}>
                  昨日电费: {priceData.yesterday_use_money}元
                </Text>
              </View>
            </View>

            {/* 电费标准设置卡片 */}
            <View
              style={[styles.card, currentStyle?.elecprice_standard_card_style]}
            >
              <View style={styles.alertCardContent}>
                <View style={styles.alertIconContainer}>
                  <Text style={styles.alertIconText}>🔔</Text>
                </View>
                <View style={styles.alertTextContainer}>
                  <Text style={[styles.alertTitle, currentStyle?.text_style]}>
                    电费标准设置:{' '}
                    <Text style={[styles.alertValue, currentStyle?.text_style]}>
                      _____
                    </Text>
                    元
                  </Text>
                </View>
              </View>
              <View style={styles.cardFooter}>
                <Text style={[styles.cardFooterText, currentStyle?.text_style]}>
                  一旦低于电费低于此标准,将推送电费告急提醒哦~
                </Text>
              </View>
            </View>
          </>
        ) : (
          <Text style={styles.loadingText}>暂无数据</Text>
        )}
      </View>
    </View>
  );
};

export default ElectricityBillinBalance;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFF',
  },
  dormInfoContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 22,
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  dormInfoText: {
    fontSize: 18,
    fontWeight: '800',
    color: '#9379F6',
    flex: 1,
  },
  changeButton: {
    paddingHorizontal: 20,
    paddingVertical: 8,
    backgroundColor: '#ADACDD',
    borderRadius: 15,
  },
  changeButtonText: {
    fontSize: 14,
    color: '#FFFFFF',
    fontWeight: '500',
  },
  contentContainer: {
    flex: 1,
    paddingHorizontal: 22,
    paddingTop: 20,
  },
  card: {
    borderRadius: 20,
    padding: 30,
    marginBottom: 45,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  lightingCard: {
    backgroundColor: '#FFF4DB',
  },
  acCard: {
    backgroundColor: '#E4DEFF',
  },
  alertCard: {
    backgroundColor: '#D9F3FF',
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15,
  },
  iconContainer: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 15,
  },
  iconText: {
    fontSize: 28,
  },
  cardTitle: {
    fontSize: 28,
    fontWeight: '600',
    color: '#333',
    flex: 1,
  },
  cardPrice: {
    fontSize: 32,
    fontWeight: '700',
    color: '#000000',
    marginRight: 15,
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingLeft: 5,
  },
  cardFooterText: {
    fontSize: 12,
    color: '#666',
  },
  alertCardContent: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  alertIconContainer: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 15,
  },
  alertIconText: {
    fontSize: 28,
  },
  alertTextContainer: {
    flex: 1,
  },
  alertTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  alertValue: {
    fontSize: 16,
    fontWeight: '700',
  },
  alertSubtitle: {
    fontSize: 12,
    color: '#666',
    lineHeight: 18,
  },
  loadingText: {
    textAlign: 'center',
    fontSize: 14,
    color: '#999',
    paddingVertical: 20,
  },
});
