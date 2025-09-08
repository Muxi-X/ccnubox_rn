import { SearchBar } from '@ant-design/react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios, { AxiosError, AxiosResponse } from 'axios';
import { useRouter } from 'expo-router';
import React, { useCallback, useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

import FAQItem from '@/components/normalquestions';
import ThemeBasedView from '@/components/view';
import useVisualScheme from '@/store/visualScheme';
import handleCopy from '@/utils/handleCopy';

interface SheetItem {
  record_id: string;
  fields: {
    问题名称: Array<{ text: string }>;
    问题描述: Array<{ text: string }>;
    解决方案: Array<{ text: string }>;
  };
}

interface TokenResponse {
  msg?: string;
  code?: number;
  data?: TokenResponseData;
}

interface TokenResponseData {
  access_token?: string;
  expires_in?: number;
  error?: string;
}

interface TokenRequest {
  table_id: string;
  normal_table_id: string;
}

function Feedback() {
  const router = useRouter();
  const number = '791185783';
  const [value, setValue] = useState('');
  const [expandedIndex, setExpandedIndex] = useState<number | null>(null);
  const [sheetData, setSheetData] = useState<SheetItem[]>([]);
  const [fullSheetData, setFullSheetData] = useState<SheetItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const { currentStyle } = useVisualScheme();
  const textStyle = currentStyle?.text_style;

  // 获取token
  const getToken = async (
    requestData: TokenRequest
  ): Promise<TokenResponse> => {
    try {
      const response: AxiosResponse<TokenResponse> = await axios({
        method: 'post',
        url: 'http://116.62.179.155:8080/get_token',
        headers: {
          'Content-Type': 'application/json',
        },
        data: requestData,
      });

      console.log('Token response status:', response.status);
      console.log('Token response data:', response.data);
      return response.data;
    } catch (error) {
      const axiosError = error as AxiosError<TokenResponse>;
      console.error('Token request error:', axiosError);
      if (axiosError.response) {
        console.log('Error response status:', axiosError.response.status);
        console.log('Error response data:', axiosError.response.data);
        return axiosError.response.data;
      } else {
        console.error('Error fetching token:', axiosError.message);
        return { msg: axiosError.message };
      }
    }
  };

  // 获取全部常见问题
  const fetchSheetData = async (token: string) => {
    try {
      const response = await axios.post(
        'http://116.62.179.155:8080/sheet/getnormal',
        {
          desc: true,
          field_names: ['问题名称', '问题描述', '解决方案'],
          pagetoken: '',
          sort_orders: '问题名称',
        },
        {
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
        }
      );
      console.log(
        'Full sheet data loaded:',
        response.data.data.items?.length,
        'items'
      );
      const allItems = response?.data?.data?.items || [];
      setSheetData(allItems);
      setFullSheetData(allItems);
      return response.data;
    } catch (error) {
      console.error('Error fetching sheet data:', error);
      throw error;
    }
  };

  // 搜索常见问题
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
                const question = (
                  item.fields?.['问题名称']?.[0]?.text || ''
                ).toLowerCase();
                const description = (
                  item.fields?.['问题描述']?.[0]?.text || ''
                ).toLowerCase();
                const solution = (
                  item.fields?.['解决方案']?.[0]?.text || ''
                ).toLowerCase();
                return (
                  question.includes(lowerSearch) ||
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

  const fetchToken = async () => {
    const requestData: TokenRequest = {
      table_id: '001',
      normal_table_id: '002',
    };

    const result = await getToken(requestData);
    if (result.code !== 0) {
      console.error('Failed to get token:', result.msg);
    } else {
      console.log('Token received:', result.data?.access_token);
      if (result.data?.access_token) {
        try {
          await AsyncStorage.setItem('access_token', result.data.access_token);
          console.log(
            'Access token stored successfully',
            result.data.access_token
          );
          await fetchSheetData(result.data.access_token);
        } catch (error) {
          console.error('Failed to store access token:', error);
        }
      }
    }
  };

  useEffect(() => {
    fetchToken();
  }, []);

  return (
    <>
      {/* <View style={{ flexDirection:'row', alignItems: 'center', justifyContent: 'center', height: 100, paddingHorizontal: 16 ,backgroundColor: '#847AF2'}}>
      <Image source={require('@/assets/images/back.png')} style={{ position: 'absolute', left: 16, width: 24, height: 24 }} />
      <Text style={{ color: 'white', fontSize: 18, fontWeight: 'bold' }}>反馈</Text>
    </View> */}
      <ThemeBasedView style={styles.container}>
        {/* <TouchableOpacity onPress={() => router.push('/feedback/history')}>
        <Text style={{fontSize:14,fontWeight:400,color:"#7B70F1"}}>
          反馈历史
        </Text>
      </TouchableOpacity> */}
        <SearchBar
          placeholder="请输入问题关键词"
          value={value}
          onChange={newValue => {
            setValue(newValue);
            debouncedSearch(newValue);
          }}
          onSubmit={_value => {
            setValue('');
            debouncedSearch('');
          }}
          style={styles.search}
        />
        <ScrollView>
          <View style={styles.content}>
            <View style={styles.header}>
              <Image
                style={styles.icon}
                source={require('@/assets/images/normal-question.png')}
              />
              <Text style={{ fontSize: 18, fontWeight: 600 }}>常见问题</Text>
            </View>
            {isLoading ? (
              <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color="#847AF2" />
                <Text style={styles.loadingText}>搜索中...</Text>
              </View>
            ) : sheetData.length > 0 ? (
              sheetData.map((item, index) => (
                <FAQItem
                  key={item.record_id || index}
                  title={item.fields?.['问题名称']?.[0]?.text || '未命名问题'}
                  content={
                    <View>
                      <Text
                        style={{
                          fontSize: 16,
                          color: '#9E9E9E',
                          fontFamily: 'Roboto',
                        }}
                      >
                        {item.fields?.['问题描述']?.[0]?.text || ''}
                      </Text>
                    </View>
                  }
                  isExpanded={expandedIndex === index}
                  onToggle={() =>
                    setExpandedIndex(expandedIndex === index ? null : index)
                  }
                />
              ))
            ) : (
              <View style={styles.emptyContainer}>
                <Text style={styles.emptyText}>没有找到匹配的问题</Text>
              </View>
            )}
          </View>
        </ScrollView>

        <View style={styles.bottom}>
          <TouchableOpacity
            onPress={() => router.push('/feedback/writefeedback')}
            style={styles.button}
          >
            <Text style={styles.buttonText}>我要反馈</Text>
          </TouchableOpacity>
          <View style={[styles.groupContainer, currentStyle?.background_style]}>
            <View style={styles.groupRow}>
              <Text>匣子交流群：</Text>
              <Text style={[styles.groupNumber, textStyle]}>{number}</Text>
              <TouchableOpacity onPress={() => handleCopy(number)}>
                <Text style={styles.copyText}>点击复制</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </ThemeBasedView>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F9FB',
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  content: {
    paddingHorizontal: 16,
    marginTop: 16,
    flex: 1,
  },
  search: {
    borderRadius: 10,
    height: 30,
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
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: '#666',
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
    marginBottom: 16,
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
    flex: 1,
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'flex-end',
  },
  button: {
    backgroundColor: '#847AF2',
    borderRadius: 12,
    paddingVertical: 14,
    paddingHorizontal: 90,
  },
  buttonText: {
    fontSize: 18,
    fontWeight: 400,
    letterSpacing: 13,
    color: '#FFFFFF',
  },
});

export default Feedback;
