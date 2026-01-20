import { Toast } from '@ant-design/react-native';
import { useRouter } from 'expo-router';
import { getItem } from 'expo-secure-store';
import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import {
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  VirtualizedList,
} from 'react-native';

import Loading from '@/components/loading';

import useVisualScheme from '@/store/visualScheme';

import { queryUserFeedbackSheet } from '@/request/api/feedback';

import {
  FEEDBACK_RECORD_NAMES,
  FEEDBACK_TABLE_IDENTIFY,
  STATUS_BG_COLORS,
  STATUS_COLORS,
} from './constants';
import { FeedbackItem } from './type';

const FeedbackListItem: React.FC<{ item: FeedbackItem }> = React.memo(
  ({ item }) => {
    const router = useRouter();

    const handlePress = () => {
      const itemData = encodeURIComponent(JSON.stringify(item));
      router.push({
        pathname: '/feedback/detail',
        params: { item: itemData },
      });
    };

    function spliceText(text: string, maxLength = 65) {
      if (!text) return '';
      return text.length > maxLength ? text.slice(0, maxLength) + '...' : text;
    }

    return (
      <TouchableOpacity
        style={styles.itemcontainer}
        onPress={handlePress}
        activeOpacity={0.7}
      >
        <View style={styles.itemheader}>
          <View style={styles.itemheaderleft}>
            <View style={styles.itemheaderleftitem}>
              <Text style={styles.itemheaderleftitemtext}>
                {item.fields.source}
              </Text>
            </View>
            <View style={styles.itemheaderleftitem}>
              <Text style={styles.itemheaderleftitemtext}>
                {item.fields.type}
              </Text>
            </View>
          </View>

          {/* 最简单的UTC转UTC+8😋 */}
          <View style={{ paddingVertical: 8 }}>
            <Text style={styles.itemheaderright}>
              {item.fields.submitTime === '未知时间'
                ? '未知时间'
                : (() => {
                    const d = new Date(
                      (item.fields.submitTime as number) + 8 * 3600 * 1000
                    );
                    return `${d.getFullYear()}-${d.getMonth() + 1}-${d.getDate()}`;
                  })()}
            </Text>
          </View>
        </View>

        <View style={styles.itemcontent}>
          <Text style={styles.itemcontenttitle}>反馈内容</Text>
          <Text style={styles.itemcontenttext}>
            {spliceText(item.fields.content)}
          </Text>
        </View>

        <View style={styles.itemfooter}>
          <View
            style={[
              styles.itemfootercontainer,
              { backgroundColor: STATUS_BG_COLORS[item.fields.status] },
            ]}
          >
            <Text
              style={[
                styles.itemfootertext,
                { color: STATUS_COLORS[item.fields.status] },
              ]}
            >
              {item.fields.status}
            </Text>
          </View>
        </View>
      </TouchableOpacity>
    );
  }
);

export default function FeedbackHistory() {
  const [isLoading, setIsLoading] = useState(false);
  const [hasMore, setHasMore] = useState(false);
  const [pageToken, setPageToken] = useState<string>('');
  const [feedbackHistory, setFeedbackHistory] = useState<FeedbackItem[]>([]);
  const loadingRef = useRef<boolean>(false);
  const user = getItem('user');

  const { currentStyle } = useVisualScheme(({ currentStyle }) => ({
    currentStyle,
  }));

  function transformRecordsToFeedbackItems(
    records: Array<{
      RecordID: string;
      Record: Record<string, any>;
    }>
  ): FeedbackItem[] {
    return records.map(item => ({
      record_id: item.RecordID,
      fields: {
        content: item.Record['反馈内容'] || '暂无内容',
        screenshots: Array.isArray(item.Record['截图'])
          ? item.Record['截图'].map((token: string) => ({ file_token: token }))
          : [],
        submitTime: item.Record['提交时间'] || '未知时间',
        userId: item.Record['用户ID'] || '',
        contact: item.Record['联系方式（QQ/邮箱）'] || '',
        source: item.Record['问题来源'] || '未知来源',
        status:
          item.Record['进度'] === '待通知'
            ? '处理中'
            : item.Record['进度'] || '未知状态',
        type: item.Record['问题类型'] || '未知类型',
      },
    }));
  }

  const getUserFeedbackSheet = async (isInit: boolean) => {
    if (!isInit && (loadingRef.current || !hasMore)) return;

    loadingRef.current = true;
    setIsLoading(true);

    try {
      const userId = JSON.parse(user!)?.state?.student_id;

      const query = {
        page_token: pageToken,
        record_names: FEEDBACK_RECORD_NAMES,
        key_field: '学号',
        key_value: userId,
        table_identify: FEEDBACK_TABLE_IDENTIFY,
      };

      const res = (await queryUserFeedbackSheet(query)) as any;

      if (res.code === 0) {
        const list = transformRecordsToFeedbackItems(res.data.Records);
        setFeedbackHistory([...feedbackHistory, ...list]);
        setHasMore(res.data.HasMore);
        setPageToken(res.data.PageToken || null);
      }
    } catch (err) {
      console.error('获取用户反馈失败', err);
      Toast.fail('获取反馈历史失败，请稍后再试');
    } finally {
      loadingRef.current = false;
      setIsLoading(false);
    }
  };

  useEffect(() => {
    getUserFeedbackSheet(true);
  }, []);

  const handleEndReached = () => {
    getUserFeedbackSheet(false);
  };

  const renderItem = useCallback(
    ({ item }: { item: FeedbackItem }) => <FeedbackListItem item={item} />,
    []
  );

  const keyExtractor = useCallback((item: FeedbackItem, index: number) => {
    const id = item.record_id ?? 'unknown';
    const time = item.fields.submitTime ?? 0;
    return `${id}_${time}-${index}`;
  }, []);

  const ListFooter = useMemo(() => {
    if (isLoading) {
      return <Loading text="加载中..." color="#847AF2" />;
    }
    if (!hasMore) {
      return (
        <Text style={{ textAlign: 'center', margin: 16, color: '#999' }}>
          再往下也没有了
        </Text>
      );
    }
    return null;
  }, [isLoading, hasMore]);

  return (
    <View style={[styles.container, currentStyle?.page_background_style]}>
      {feedbackHistory.length === 0 && isLoading ? (
        <Loading text="加载中..." color="#847AF2" />
      ) : (
        <VirtualizedList
          data={feedbackHistory}
          initialNumToRender={4}
          windowSize={5}
          maxToRenderPerBatch={4}
          getItemCount={data => (data ? data.length : 0)}
          getItem={(data, index) => (data ? data[index] : null)}
          keyExtractor={keyExtractor}
          renderItem={renderItem}
          onEndReached={handleEndReached}
          onEndReachedThreshold={0.3}
          ListFooterComponent={ListFooter}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    position: 'relative',
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  itemcontainer: {
    backgroundColor: 'white',
    margin: 8,
    padding: 12,
    borderRadius: 12,
    marginBottom: 8,
    marginTop: 8,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 0.5,
    },
    shadowOpacity: 0.02,
    shadowRadius: 1,
  },
  itemheader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  itemcontent: {
    marginVertical: -4,
  },
  itemfooter: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
  },
  itemheaderleft: {
    flexDirection: 'row',
  },
  itemheaderleftitem: {
    width: 72,
    height: 27,
    paddingHorizontal: 8,
    paddingVertical: 6,
    borderRadius: 999,
    backgroundColor: '#F6F5FF',
    marginRight: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  itemheaderleftitemtext: {
    fontSize: 12,
    lineHeight: 16,
    fontWeight: '400',
    color: '#7B70F1',
    textAlign: 'center',
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
    marginBottom: 6,
    marginTop: 6,
  },
  itemcontenttext: {
    fontSize: 14,
    fontWeight: '400',
    color: '#4B5563',
  },
  itemfootertext: {
    fontSize: 12,
    fontWeight: '400',
    lineHeight: 16,
  },
  itemfootercontainer: {
    marginVertical: 12,
    paddingHorizontal: 10,
    height: 24,
    borderRadius: 16,
    backgroundColor: '#F3F4F6',
    justifyContent: 'center',
    alignItems: 'center',
  },
});
