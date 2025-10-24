import { router, useLocalSearchParams } from 'expo-router';
import { useEffect, useState } from 'react';
import {
  Image,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';

import Modal from '@/components/modal';

import useVisualScheme from '@/store/visualScheme';

import {
  cancelStandard,
  getPrice,
  getStandardList,
  setStandard,
} from '@/request/api/electricity';
import { log } from '@/utils/logger';

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
  const [standardLimit, setStandardLimit] = useState<number | null>(null);

  // 加载电费数据
  useEffect(() => {
    if (room_id) {
      loadPriceData(room_id);
      loadStandardData();
    }
  }, [room_id]);

  const loadPriceData = async (id: string) => {
    try {
      setLoading(true);
      const response: any = await getPrice(id);

      // API 实际返回的是 data，而不是 schema 中定义的 msg
      const priceInfo = response?.data?.price || response?.msg?.price;
      setPriceData(priceInfo);
    } catch (error) {
      log.error(error);
    } finally {
      setLoading(false);
    }
  };

  // 加载电费标准数据
  const loadStandardData = async () => {
    try {
      const response: any = await getStandardList();

      const standardList =
        response?.data?.standard_list || response?.msg?.standard_list;

      if (standardList && standardList.length > 0) {
        // 查找当前房间的电费标准
        const currentRoomStandard = standardList.find(
          (item: any) => item.room_name === `${building}    ${room}`
        );
        if (currentRoomStandard) {
          setStandardLimit(currentRoomStandard.limit);
        }
      }
    } catch (error) {
      log.error(error);
    }
  };

  // 打开设置电费标准弹窗
  const handleSetStandard = () => {
    // 使用 ref 来存储临时输入值，避免闭包问题
    let tempInputValue = standardLimit ? String(standardLimit) : '';

    Modal.show({
      title: '设置电费标准',
      mode: 'middle',
      children: (
        <View style={styles.inputContainer}>
          <Text style={[styles.inputLabel, currentStyle?.text_style]}>
            请输入电费提醒标准（元）
          </Text>
          <TextInput
            style={[
              styles.input,
              currentStyle?.text_style,
              {
                backgroundColor:
                  currentStyle?.secondary_background_style?.backgroundColor,
              },
            ]}
            defaultValue={tempInputValue}
            onChangeText={text => {
              tempInputValue = text;
            }}
            keyboardType="numeric"
            placeholder="请输入金额"
            placeholderTextColor={currentStyle?.text_style?.color}
            autoFocus
          />
          <Text style={[styles.inputHint, currentStyle?.text_style]}>
            清空输入框后点击确定将取消电费提醒
          </Text>
        </View>
      ),
      onConfirm: () => handleConfirmStandard(tempInputValue),
      confirmText: '确定',
      showCancel: true,
      cancelText: '取消',
    });
  };

  // 确认设置电费标准
  const handleConfirmStandard = async (value: string) => {
    if (!room_id || !building || !room) {
      return;
    }

    try {
      if (value === '' || value === null) {
        await cancelStandard({ room_id });
        setStandardLimit(null);
      } else {
        // 设置电费标准
        const limitValue = parseInt(value, 10);
        if (isNaN(limitValue) || limitValue <= 0) {
          return;
        }

        await setStandard({
          room_id,
          room_name: `${building}    ${room}`,
          limit: limitValue,
        });
        setStandardLimit(limitValue);
      }
    } catch (error) {
      log.error(error);
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
                  <Image
                    source={require('@/assets/images/zhaoming.png')}
                    style={styles.iconImage}
                  />
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
                  <Image
                    source={require('@/assets/images/kongtiao.png')}
                    style={styles.iconImage}
                  />
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
            <TouchableOpacity onPress={handleSetStandard}>
              <View
                style={[
                  styles.card,
                  currentStyle?.elecprice_standard_card_style,
                ]}
              >
                <View style={styles.alertCardContent}>
                  <View style={styles.alertIconContainer}>
                    <Image
                      source={require('@/assets/images/tishi.png')}
                      style={styles.iconImage}
                    />
                  </View>
                  <View style={styles.alertTextContainer}>
                    <Text style={[styles.alertTitle, currentStyle?.text_style]}>
                      电费标准设置:
                      <Text
                        style={[styles.alertValue, currentStyle?.text_style]}
                      >
                        {standardLimit !== null ? standardLimit : '____'}
                      </Text>
                      元
                    </Text>
                  </View>
                </View>
                <View style={styles.alertCardFooter}>
                  <Text
                    style={[styles.cardFooterText, currentStyle?.text_style]}
                  >
                    一旦低于电费低于此标准,将推送电费告急提醒哦~
                  </Text>
                </View>
              </View>
            </TouchableOpacity>
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
  iconImage: {
    width: 48,
    height: 48,
    resizeMode: 'contain',
  },
  cardTitle: {
    fontSize: 28,
    fontWeight: '600',
    color: '#333',
    flex: 1,
  },
  cardPrice: {
    fontSize: 40,
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
  alertTextContainer: {
    flex: 1,
  },
  alertTitle: {
    fontSize: 22,
    fontWeight: '600',
    color: '#333',
    marginTop: 8,
    marginLeft: 20,
  },
  alertValue: {
    fontSize: 22,
    fontWeight: '700',
  },
  alertSubtitle: {
    fontSize: 12,
    color: '#666',
    lineHeight: 18,
  },
  alertCardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingLeft: 5,
    marginTop: 25,
  },
  loadingText: {
    textAlign: 'center',
    fontSize: 14,
    color: '#999',
    paddingVertical: 20,
  },
  inputContainer: {
    width: '100%',
    paddingVertical: 10,
  },
  inputLabel: {
    fontSize: 14,
    color: '#333',
    marginBottom: 15,
    textAlign: 'center',
  },
  input: {
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 10,
    paddingHorizontal: 15,
    paddingVertical: 12,
    fontSize: 16,
    color: '#333',
    textAlign: 'center',
    backgroundColor: '#FFF',
  },
  inputHint: {
    fontSize: 12,
    color: '#999',
    marginTop: 10,
    textAlign: 'center',
  },
});
