import { router, useFocusEffect, useLocalSearchParams } from 'expo-router';
import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  Image,
  StyleSheet,
  Text,
  TextInput,
  TextStyle,
  TouchableOpacity,
  View,
} from 'react-native';

import Modal from '@/components/modal';
import {
  cancelStandard,
  getBillingBalance,
  getPrice,
  getStandardList,
  setStandard,
} from '@/request/api/electricity';
import { useElectricityStore } from '@/store/electricity';
import { useHeaderRightStore } from '@/store/headerRight';
import useVisualScheme from '@/store/visualScheme';
import { log } from '@/utils/logger';

interface PriceItem {
  remain_money?: string;
  yesterday_use_money?: string;
  yesterday_use_value?: string;
}

interface PriceData {
  ac_price?: PriceItem | null;
  light_price?: PriceItem | null;
  union_price?: PriceItem | null;
  price?: PriceItem | null;
}

const ElectricityBalance = () => {
  const currentStyle = useVisualScheme(state => state.currentStyle);
  const selectedDorm = useElectricityStore(state => state.selectedDorm);
  const clearSelectedDorm = useElectricityStore(
    state => state.clearSelectedDorm
  );
  const searchParams = useLocalSearchParams<{
    building?: string;
    room?: string;
    area?: string;
    room_id?: string;
    ac?: string;
    light?: string;
    union?: string;
  }>();

  // 优先使用路由参数，其次使用 store 中的持久化数据
  const building = searchParams.building || selectedDorm?.building;
  const room = searchParams.room || selectedDorm?.room;
  const area = searchParams.area || selectedDorm?.area;
  const room_id = searchParams.room_id || selectedDorm?.room_id;
  const ac = searchParams.ac || selectedDorm?.ac;
  const light = searchParams.light || selectedDorm?.light;
  const union = searchParams.union || selectedDorm?.union;

  const [priceData, setPriceData] = useState<PriceData | null>(null);
  const [loading, setLoading] = useState(false);
  const [standardLimit, setStandardLimit] = useState<number | null>(null);
  const setHeaderRight = useHeaderRightStore(state => state.setContent);

  const officialButton = useMemo(
    () => (
      <TouchableOpacity
        onPress={() => router.push('/electricity')}
        hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
      >
        <Text
          style={[
            styles.headerRightText,
            {
              color:
                (currentStyle?.text_style as TextStyle)?.color ?? '#9379F6',
            },
          ]}
        >
          官方系统
        </Text>
      </TouchableOpacity>
    ),
    [currentStyle?.text_style]
  );

  useFocusEffect(
    useCallback(() => {
      setHeaderRight(officialButton);
      return () => setHeaderRight(null);
    }, [officialButton, setHeaderRight])
  );

  // 检查是否有宿舍信息，无则直接跳选择页面；有则加载电费数据与标准
  useEffect(() => {
    if (!room && !room_id && !ac && !light && !union) {
      router.replace('/electricityInquiry');
      return;
    }

    loadPriceData();
    loadStandardData();
  }, [room, room_id, ac, light, union, building]);

  const loadPriceData = async () => {
    try {
      setLoading(true);
      let foundData = false;

      const roomNameQuery = room || '';

      // 1. 使用 room 查询 getPrice（如 "南7-321"）
      if (roomNameQuery) {
        try {
          const response: any = await getPrice(roomNameQuery);
          const resData = response?.data || response?.msg;
          if (
            resData &&
            (resData.ac_price ||
              resData.light_price ||
              resData.union_price ||
              resData.price)
          ) {
            setPriceData(resData);
            foundData = true;
          }
        } catch (e) {
          log.warn('getPrice with room failed', e);
        }
      }

      // 2. 尝试使用设备 ID (room_id / light / ac / union) 查询 getBillingBalance 作为兜底
      const targetRoomId = room_id || light || ac || union;
      if (!foundData && targetRoomId) {
        try {
          const response: any = await getBillingBalance(targetRoomId);
          const resData = response?.data || response?.msg;
          if (resData?.price) {
            setPriceData({
              price: resData.price,
              union_price: resData.price,
            });
            foundData = true;
          }
        } catch (e) {
          log.warn('getBillingBalance failed', e);
        }
      }

      if (!foundData) {
        setPriceData(null);
      }
    } catch (error) {
      log.error('加载电费数据失败:', error);
      setPriceData(null);
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
          (item: any) =>
            item.room_name === `${building}    ${room}` ||
            item.room_name === room ||
            item.room_name === `${building}${room}`
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
    const targetRoomId = room_id || light || ac || union;
    if (!targetRoomId || !building || !room) {
      return;
    }

    try {
      if (value === '' || value === null) {
        await cancelStandard({ room_id: targetRoomId });
        setStandardLimit(null);
      } else {
        // 设置电费标准
        const limitValue = parseInt(value, 10);
        if (isNaN(limitValue) || limitValue <= 0) {
          return;
        }

        await setStandard({
          room_id: targetRoomId,
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

    // 处理楼栋信息：去除重复的区域名，去除前导零
    let buildingFormatted = building;
    buildingFormatted = buildingFormatted
      .replace(/南湖南湖/, '南湖')
      .replace(/东区东区/, '东区')
      .replace(/西区西区/, '西区')
      .replace(/元宝山元宝山/, '元宝山')
      .replace(/东南区东南区/, '东南区')
      .replace(/国交国交/, '国交');
    // 去除前导零（如"南湖04栋" -> "南湖4栋"）
    buildingFormatted = buildingFormatted.replace(/0(\d)栋/, '$1栋');

    // 处理房间信息：提取房间号并添加"室"后缀
    let roomFormatted = room;
    // 如果房间号包含"南"或"北"等前缀，提取数字部分
    const roomMatch = room.match(/([南北]?\d+-\d+)/);
    if (roomMatch) {
      roomFormatted = roomMatch[1].replace(/[南北]/, ''); // 去除南北前缀
    }
    // 添加"室"后缀
    if (!roomFormatted.endsWith('室')) {
      roomFormatted = `${roomFormatted}室`;
    }

    return `${buildingFormatted}    ${roomFormatted}`;
  };

  const handleChangeDorm = () => {
    router.replace('/electricityInquiry');
  };

  const isUnionOnly =
    Boolean(priceData?.union_price) &&
    !priceData?.light_price &&
    !priceData?.ac_price;
  const lightingData = priceData?.light_price || priceData?.price;
  const acData =
    priceData?.ac_price || (!priceData?.light_price ? priceData?.price : null);

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
            {/* 组合电表卡片 */}
            {isUnionOnly && priceData.union_price && (
              <View
                style={[
                  styles.card,
                  currentStyle?.elecprice_lighting_card_style,
                ]}
              >
                <View style={styles.cardHeader}>
                  <View style={styles.iconContainer}>
                    <Image
                      source={require('@/assets/images/zhaoming.png')}
                      style={styles.iconImage}
                    />
                  </View>
                  <Text style={[styles.cardTitle, currentStyle?.text_style]}>
                    用电
                  </Text>
                  <Text style={[styles.cardPrice, currentStyle?.text_style]}>
                    {priceData.union_price.remain_money ?? '0.00'}{' '}
                    <Text style={styles.cardPriceUnit}>度</Text>
                  </Text>
                </View>
                <View style={styles.cardFooter}>
                  <Text
                    style={[styles.cardFooterText, currentStyle?.text_style]}
                  >
                    昨日用电: {priceData.union_price.yesterday_use_value ?? '0'}
                    度
                  </Text>
                  <Text
                    style={[styles.cardFooterText, currentStyle?.text_style]}
                  >
                    昨日电费:{' '}
                    {priceData.union_price.yesterday_use_money ?? '0.00'}元
                  </Text>
                </View>
              </View>
            )}

            {/* 照明卡片 */}
            {!isUnionOnly && lightingData && (
              <View
                style={[
                  styles.card,
                  currentStyle?.elecprice_lighting_card_style,
                ]}
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
                    {lightingData.remain_money ?? '0.00'}{' '}
                    <Text style={styles.cardPriceUnit}>度</Text>
                  </Text>
                </View>
                <View style={styles.cardFooter}>
                  <Text
                    style={[styles.cardFooterText, currentStyle?.text_style]}
                  >
                    昨日用电: {lightingData.yesterday_use_value ?? '0'}度
                  </Text>
                  <Text
                    style={[styles.cardFooterText, currentStyle?.text_style]}
                  >
                    昨日电费: {lightingData.yesterday_use_money ?? '0.00'}元
                  </Text>
                </View>
              </View>
            )}

            {/* 空调卡片 */}
            {!isUnionOnly && acData && (
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
                    {acData.remain_money ?? '0.00'}{' '}
                    <Text style={styles.cardPriceUnit}>度</Text>
                  </Text>
                </View>
                <View style={styles.cardFooter}>
                  <Text
                    style={[styles.cardFooterText, currentStyle?.text_style]}
                  >
                    昨日用电: {acData.yesterday_use_value ?? '0'}度
                  </Text>
                  <Text
                    style={[styles.cardFooterText, currentStyle?.text_style]}
                  >
                    昨日电费: {acData.yesterday_use_money ?? '0.00'}元
                  </Text>
                </View>
              </View>
            )}

            {/* TODO)) 这块等消息提醒一起上线 电费标准设置卡片 */}
            {/* <TouchableOpacity onPress={handleSetStandard}>
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
            </TouchableOpacity> */}
          </>
        ) : (
          <Text style={styles.loadingText}>暂无数据</Text>
        )}
      </View>
    </View>
  );
};

export default ElectricityBalance;

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
    fontSize: 36,
    fontWeight: '700',
    color: '#000000',
    marginRight: 15,
  },
  cardPriceUnit: {
    fontSize: 16,
    fontWeight: '500',
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
  headerRightText: {
    fontSize: 14,
    fontWeight: '500',
  },
});
