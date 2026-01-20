import { Toast } from '@ant-design/react-native';
import { useRouter } from 'expo-router';
import { getItem } from 'expo-secure-store';
import { useCallback, useEffect, useState } from 'react';
import {
  Image,
  ImageSourcePropType,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

import Loading from '@/components/loading';
import SearchBar from '@/components/searchBar';
import ThemeBasedView from '@/components/view';

import useFAQStore from '@/store/FAQs';
import useVisualScheme from '@/store/visualScheme';

import NormalIcon from '@/assets/images/normal-question.png.png';
import { feedbackFAQ, getFAQ } from '@/request/api/feedback';
import handleCopy from '@/utils/handleCopy';
import { log } from '@/utils/logger';

import { FAQ_RECORD_NAMES, FAQ_TABLE_IDENTIFY } from './constants';
import FAQItem from './components/normalquestions';

import { SheetItem } from './type';

function FeedbackPage() {
  const router = useRouter();
  const number = '791185783';
  const user = getItem('user');
  const userId = user ? JSON.parse(user)?.state?.student_id : '';

  const [value, setValue] = useState('');
  const [expandedIndex, setExpandedIndex] = useState<number | null>(null);
  const [sheetData, setSheetData] = useState<SheetItem[]>([]);
  const [fullSheetData, setFullSheetData] = useState<SheetItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const { currentStyle } = useVisualScheme(({ currentStyle }) => ({
    currentStyle,
  }));
  const { FAQs, updateFAQs } = useFAQStore();

  const getFeedbackFAQs = async () => {
    try {
      setIsLoading(true);
      const query = {
        student_id: userId,
        record_names: FAQ_RECORD_NAMES,
        table_identify: FAQ_TABLE_IDENTIFY,
      };

      const res = (await getFAQ(query)) as any;

      if (res.code === 0) {
        const FAQDatas = transformFAQToSheetData(res.data.Records);
        setFullSheetData(FAQDatas);
        setSheetData(FAQDatas);
        updateFAQs(FAQDatas);
      } else {
        setFullSheetData(FAQs);
        setSheetData(FAQs);
        Toast.fail('获取常见问题失败，请稍后再试');
      }
    } catch (err) {
      log.error(err);
      setFullSheetData(FAQs);
      setSheetData(FAQs);
      Toast.fail('网络异常，请稍后再试');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    getFeedbackFAQs();
  }, []);

  const handleFeedback = async (
    recordId: string,
    status: string
  ): Promise<boolean> => {
    try {
      const params = {
        table_identify: 'ccnubox-faq',
        record_id: recordId,
        is_resolved: status === 'resolved',
        resolved_field_name: '已解决',
        unresolved_field_name: '未解决',
        user_id: userId,
      };

      const res = await feedbackFAQ(params);

      if (res?.code === 0) {
        Toast.success('反馈成功');
        return true;
      }

      Toast.fail('反馈失败，请重试');
      return false;
    } catch (err: any) {
      if (err.response?.status === 429 && err.response?.data?.code === 200010) {
        Toast.info('您已达到反馈次数上限，感谢您的反馈');
        return false;
      }

      if (err.response?.status === 429) {
        Toast.info('操作过于频繁，请稍后再试');
        return false;
      }

      log.error(err);
      Toast.fail('网络异常，请稍后再试');
      return false;
    }
  };

  const transformFAQToSheetData = (records: any[]): SheetItem[] => {
    return records.map(item => ({
      record_id: item.RecordID,
      fields: {
        title: item.Record['问题名称'] || '未命名问题',
        description: item.Record['问题描述'] || '暂无',
        solution: item.Record['解决方案'] || '暂无',
        resolvedStatus:
          item.IsResolved === '已解决'
            ? 'resolved'
            : item.IsResolved === '未解决'
              ? 'unresolved'
              : 'notSelected',
      },
    }));
  };

  const debouncedSearch = useCallback(
    (() => {
      let timeoutId: number;
      return (searchValue: string) => {
        setIsLoading(true);
        clearTimeout(timeoutId);
        timeoutId = setTimeout(() => {
          try {
            const lowerSearch = searchValue.toLowerCase().trim();
            if (!lowerSearch) {
              setSheetData(fullSheetData);
            } else {
              const filtered = fullSheetData.filter(item => {
                const title = (item.fields?.title || '').toLowerCase();
                const description = (
                  item.fields?.description || ''
                ).toLowerCase();
                const solution = (item.fields?.solution || '').toLowerCase();
                return (
                  title.includes(lowerSearch) ||
                  description.includes(lowerSearch) ||
                  solution.includes(lowerSearch)
                );
              });
              setSheetData(filtered);
            }
          } catch (error) {
            console.error('Search error:', error);
          } finally {
            setIsLoading(false);
          }
        }, 300);
      };
    })(),
    [fullSheetData]
  );

  return (
    <ThemeBasedView style={[styles.container, currentStyle?.background_style]}>
      <SearchBar
        placeholder="请输入问题关键词"
        value={value}
        onChange={newValue => {
          setValue(newValue);
          debouncedSearch(newValue);
        }}
      />

      <View style={styles.content}>
        <View style={styles.header}>
          <Image
            style={styles.icon}
            source={NormalIcon as unknown as ImageSourcePropType}
          />
          <Text style={[{ fontWeight: 600 }, currentStyle?.text_style]}>
            常见问题
          </Text>
        </View>

        <ScrollView showsVerticalScrollIndicator={false}>
          {isLoading ? (
            <Loading text="搜索中..." color="#847AF2" />
          ) : sheetData.length > 0 ? (
            sheetData.map((item, index) => (
              <FAQItem
                key={item.record_id || index}
                title={item.fields.title}
                content={<Text>{item.fields.description || ''}</Text>}
                solution={<Text>{item.fields.solution || ''}</Text>}
                isExpanded={expandedIndex === index}
                onToggle={() =>
                  setExpandedIndex(expandedIndex === index ? null : index)
                }
                initialStatus={item.fields.resolvedStatus}
                onPress={(status: string) =>
                  handleFeedback(item.record_id, status)
                }
              />
            ))
          ) : (
            <View style={styles.emptyContainer}>
              <Text style={[styles.emptyText, currentStyle?.text_style]}>
                暂无相关问题
              </Text>
            </View>
          )}
        </ScrollView>
      </View>

      <View style={styles.bottom}>
        <TouchableOpacity
          onPress={() => router.push('/feedback/writefeedback')}
          style={styles.button}
        >
          <Text style={styles.buttonText}>我要反馈</Text>
        </TouchableOpacity>

        <View style={currentStyle?.background_style}>
          <View style={styles.groupRow}>
            <Text style={currentStyle?.text_style}>匣子交流群：</Text>
            <Text style={[styles.groupNumber, currentStyle?.text_style]}>
              {number}
            </Text>
            <TouchableOpacity onPress={() => handleCopy(number)}>
              <Text style={styles.copyText}>点击复制</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </ThemeBasedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  content: {
    paddingHorizontal: 16,
    marginTop: 16,
    flex: 2,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-start',
    marginBottom: 16,
  },
  icon: {
    width: 32,
    height: 32,
    marginRight: 12,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 16,
    color: '#999',
  },
  groupContainer: {
    backgroundColor: '#FFF',
    borderRadius: 8,
    padding: 16,
    marginBottom: 24,
  },
  groupRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  groupNumber: {
    fontSize: 14,
    color: '#666',
    marginHorizontal: 8,
  },
  copyText: {
    fontSize: 14,
    color: '#4A90E2',
  },
  bottom: {
    flex: 0,
    paddingVertical: 8,
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
  },
  button: {
    backgroundColor: '#847AF2',
    borderRadius: 12,
    paddingVertical: 14,
    paddingHorizontal: 90,
    marginVertical: 10,
  },
  buttonText: {
    fontSize: 18,
    fontWeight: 400,
    letterSpacing: 13,
    color: '#FFFFFF',
  },
});

export default FeedbackPage;
