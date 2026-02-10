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

import {
  FEEDBACK_RECORD_NAMES,
  FEEDBACK_TABLE_IDENTIFY,
} from '@/constants/FEEDBACKS';
import { queryUserFeedbackSheet } from '@/request/api/feedback';

interface FeedbackItem {
  record_id: string;
  fields: {
    content: string;
    screenshots: Array<{
      file_token?: string;
      name?: string;
      size?: number;
      tmp_url?: string;
      type?: string;
      url?: string;
    }>;
    submitTime: number | string;
    userId: string;
    contact: string;
    reply: string;
    source: string;
    status: string;
    type: string;
  };
}

const FeedbackListItem: React.FC<{ item: FeedbackItem }> = React.memo(
  ({ item }) => {
    const { currentStyle } = useVisualScheme(({ currentStyle }) => ({
      currentStyle,
    }));

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
        style={[styles.itemContainer, currentStyle?.feedback_card_style]}
        onPress={handlePress}
        activeOpacity={0.7}
      >
        <View style={styles.itemHeader}>
          <View style={styles.itemHeaderleft}>
            <View
              style={[
                styles.itemHeaderleftitem,
                currentStyle?.feedback_history_metaData_style,
              ]}
            >
              <Text
                style={[
                  styles.itemHeaderleftitemText,
                  currentStyle?.feedback_history_metaData_text_style,
                ]}
              >
                {item.fields.source}
              </Text>
            </View>
            <View
              style={[
                styles.itemHeaderleftitem,
                currentStyle?.feedback_history_metaData_style,
              ]}
            >
              <Text
                style={[
                  styles.itemHeaderleftitemText,
                  currentStyle?.feedback_history_metaData_text_style,
                ]}
              >
                {item.fields.type}
              </Text>
            </View>
          </View>

          <View style={{ paddingVertical: 8 }}>
            <Text style={styles.itemHeaderright}>{item.fields.submitTime}</Text>
          </View>
        </View>

        <View style={styles.itemContent}>
          <Text style={[styles.itemContenttitle, currentStyle?.text_style]}>
            反馈内容
          </Text>
          <Text style={[styles.itemContenttext, currentStyle?.text_style]}>
            {spliceText(item.fields.content)}
          </Text>
        </View>

        <View style={styles.itemFooter}>
          <View style={[styles.replyContainer]}>
            <Text style={[styles.replyText]}>
              回复: {spliceText(item.fields.reply, 15)}
            </Text>
          </View>
          <View
            style={[
              styles.itemFooterContainer,
              currentStyle?.feedback_status_style?.getStyle(item.fields.status),
            ]}
          >
            <Text
              style={[
                styles.itemFootertext,
                currentStyle?.feedback_statusText_style?.getStyle(
                  item.fields.status
                ),
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

  function formatSubmitTime(timestamp: any): string {
    if (timestamp === null || timestamp === undefined) {
      return '未知时间';
    }

    const tsNum =
      typeof timestamp === 'string' && /^\d+$/.test(timestamp)
        ? Number(timestamp)
        : timestamp;

    const date = new Date(tsNum);
    if (isNaN(date.getTime())) {
      return '未知时间';
    }

    const parts = new Intl.DateTimeFormat('zh-CN', {
      timeZone: 'Asia/Shanghai',
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
    })
      .formatToParts(date)
      .reduce((acc: any, part: any) => {
        acc[part.type] = part.value;
        return acc;
      }, {});

    const year = parts.year;
    const month = parts.month;
    const day = parts.day;

    return `${year}-${month}-${day}`;
  }

  function transformRecordsToFeedbackItems(
    records: Array<{
      record_id: string;
      record: Record<string, any>;
    }>
  ): FeedbackItem[] {
    return records.map(item => ({
      record_id: item.record_id,
      fields: {
        content: item.record['反馈内容'] || '暂无内容',
        screenshots: Array.isArray(item.record['截图'])
          ? item.record['截图'].map((token: string) => ({ file_token: token }))
          : [],
        submitTime: formatSubmitTime(item.record['提交时间']),
        userId: item.record['用户ID'] || '',
        contact: item.record['联系方式（QQ/邮箱）'] || '',
        source: item.record['问题来源'] || '未知来源',
        reply: item.record['回复内容'] || '暂未回复',
        status:
          item.record['进度'] === '待通知'
            ? '处理中'
            : item.record['进度'] || '未知状态',
        type: item.record['问题类型'] || '未知类型',
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
        const list = transformRecordsToFeedbackItems(res.data.records);
        setFeedbackHistory([...feedbackHistory, ...list]);
        setHasMore(res.data.has_more);
        setPageToken(res.data.page_token || '');
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
          没有更多了
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
  itemContainer: {
    margin: 8,
    padding: 16,
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
  itemHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  itemContent: {
    marginVertical: -4,
  },
  itemFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    marginTop: 16,
    marginRight: 12,
  },
  replyContainer: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
  },
  replyText: {
    fontSize: 12,
    lineHeight: 16,
    color: '#C8C8C8',
  },
  itemHeaderleft: {
    flexDirection: 'row',
  },
  itemHeaderleftitem: {
    width: 72,
    height: 27,
    paddingHorizontal: 8,
    paddingVertical: 6,
    borderRadius: 999,
    marginRight: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  itemHeaderleftitemText: {
    fontSize: 12,
    lineHeight: 16,
    fontWeight: '400',
    textAlign: 'center',
  },
  itemHeaderright: {
    fontSize: 14,
    fontWeight: '400',
    color: '#9CA3AF',
  },
  itemContenttitle: {
    fontSize: 18,
    fontWeight: '500',
    marginBottom: 6,
    marginTop: 6,
  },
  itemContenttext: {
    fontSize: 14,
    fontWeight: '400',
  },
  itemFootertext: {
    fontSize: 12,
    fontWeight: '400',
    lineHeight: 16,
  },
  itemFooterContainer: {
    paddingHorizontal: 10,
    height: 24,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
