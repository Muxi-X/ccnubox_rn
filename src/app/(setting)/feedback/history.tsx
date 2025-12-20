import { useEffect, useState } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';

import ThemeBasedView from '@/components/view';

import api from '@/utils/api';
// 定义反馈项的类型接口
interface FeedbackItem {
  record_id: string;
  fields: {
    反馈内容?: Array<{ text: string; type: string }>;
    截图?: Array<{
      file_token?: string;
      name?: string;
      size?: number;
      tmp_url?: string;
      type?: string;
      url?: string;
    }>;
    提交时间?: number;
    用户ID?: Array<{ text: string; type: string }>;
    '联系方式（QQ/邮箱）'?: Array<{ text: string; type: string }>;
    问题来源?: string;
    问题状态?: string;
    问题类型?: string;
  };
}

function FeedbackHistory() {
  const [feedbackHistory, setFeedbackHistory] = useState<FeedbackItem[]>([]);

  const getFeedbackHistory = async () => {
    try {
      const response = await api.post('/sheet/getrecord', {
        desc: true,
        field_names: [
          '用户ID',
          '反馈内容',
          '截图',
          '问题类型',
          '问题来源',
          '联系方式（QQ/邮箱）',
          '提交时间',
          '问题状态',
          '关联需求',
        ],
        filter_name: '用户ID',
        filter_val: '2024214381',
        pagetoken: '',
        sort_orders: '提交时间',
      });
      if (response.data && response.data.data) {
        console.log('反馈历史:', response.data.data.items);
        setFeedbackHistory(response.data.data.items);
      }
    } catch (error) {
      console.error('获取反馈历史失败:', error);
    }
  };

  useEffect(() => {
    getFeedbackHistory();
  }, []);

  return (
    <ThemeBasedView style={styles.container}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={true}
      >
        <View>
          {Array.isArray(feedbackHistory) &&
            feedbackHistory.map((item, index) => (
              <View key={index} style={styles.itemcontainer}>
                <View style={styles.itemheader}>
                  <View style={styles.itemheaderleft}>
                    {/* 将问题类型按照-符号分割并显示 */}
                    {item.fields?.['问题类型']?.includes('-') ? (
                      item.fields['问题类型'].split('-').map((part, i) => (
                        <View key={i} style={styles.itemheaderleftitem}>
                          <Text style={styles.itemheaderleftitemtext}>
                            {part}
                          </Text>
                        </View>
                      ))
                    ) : (
                      <View style={styles.itemheaderleftitem}>
                        <Text style={styles.itemheaderleftitemtext}>
                          {item.fields?.['问题类型'] || '未知类型'}
                        </Text>
                      </View>
                    )}
                  </View>
                  <View style={{ paddingVertical: 8 }}>
                    <Text style={styles.itemheaderright}>
                      {item.fields?.['提交时间']
                        ? new Date(item.fields['提交时间']).toLocaleDateString(
                            'zh-CN'
                          )
                        : '未知时间'}
                    </Text>
                  </View>
                </View>
                <View style={styles.itemcontent}>
                  <Text style={styles.itemcontenttitle}>反馈内容</Text>
                  <Text style={styles.itemcontenttext}>
                    {item.fields?.['反馈内容']?.[0]?.text || '暂无内容'}
                  </Text>
                </View>
                <View style={styles.itemfooter}>
                  <View style={[styles.itemfootercontainer]}>
                    <Text
                      style={[
                        styles.itemfootertext,
                        item.fields?.['问题状态'] === '处理中'
                          ? styles.itemyellowtext
                          : item.fields?.['问题状态'] === '已解决'
                            ? styles.itemgreentext
                            : null,
                      ]}
                    >
                      {item.fields?.['问题状态'] || '未知状态'}
                    </Text>
                  </View>
                </View>
              </View>
            ))}
        </View>
      </ScrollView>

      {/*<View style={styles.itemcontainer}>
        <View style={styles.itemheader}>
          <View style={styles.itemheaderleft}>
            <View style={styles.itemheaderleftitem}><Text style={styles.itemheaderleftitemtext}>功能异常</Text></View>
            <View style={styles.itemheaderleftitem}><Text style={styles.itemheaderleftitemtext}>其他问题</Text></View>
          </View>
          <View style={{paddingVertical:8}}>
          <Text style={styles.itemheaderright}>2023-08-01</Text>
          </View>

        </View>
        <View style={styles.itemcontent}>
          <Text style={styles.itemcontenttitle}>登录页面无法正常显示验证码</Text>
          <Text style={styles.itemcontenttext}>在使用Chrome浏览器时，登录页面的验证码图片
无法正常加载，显示空白。已尝试清除浏览器缓存
但问题依然存在。</Text>
        </View>
        <View style={styles.itemfooter}>
          <View style={[styles.itemfootercontainer]}>
          <Text style={styles.itemfootertext}>待解决</Text>
        </View>
        </View>
      </View>*/}
    </ThemeBasedView>
  );
}
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F9FB',
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  scrollContent: {
    flexGrow: 1,
    paddingBottom: 20,
  },
  itemcontainer: {
    backgroundColor: 'white',
    padding: 16,
    borderRadius: 12,
    marginBottom: 8,
    marginTop: 8,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 0.5,
    },
    shadowOpacity: 0.15,
    shadowRadius: 1,
  },
  itemheader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  itemcontent: {
    marginVertical: 12,
  },
  itemfooter: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
  },
  itemheaderleft: {
    flexDirection: 'row',
  },
  itemheaderleftitem: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 16,
    backgroundColor: '#F6F5FF',
    marginRight: 8,
  },
  itemheaderleftitemtext: {
    fontSize: 14,
    fontWeight: '400',
    color: '#7B70F1',
  },
  itemheaderright: {
    fontSize: 14,
    fontWeight: '400',
    color: '#9CA3AF',
  },
  itemcontenttitle: {
    fontSize: 18,
    fontWeight: '500',
    color: '#000000',
    marginBottom: 15,
  },
  itemcontenttext: {
    fontSize: 16,
    fontWeight: '400',
    color: '#4B5563',
  },
  itemfootertext: {
    fontSize: 14,
    fontWeight: '400',
    color: '#4B5563',
  },
  itemfootercontainer: {
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 16,
    backgroundColor: '#F3F4F6',
  },
  itemyellow: {
    backgroundColor: '#FFF7D4',
  },
  itemgreen: {
    backgroundColor: '#E6FFED',
  },
  itemyellowtext: {
    color: '#FFC107',
  },
  itemgreentext: {
    color: '#4CAF50',
  },
});
export default FeedbackHistory;
