import { Toast } from '@ant-design/react-native';
import { useLocalSearchParams } from 'expo-router';
import React, { useEffect, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Image,
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

import ThemeBasedView from '@/components/view';

import useVisualScheme from '@/store/visualScheme';

import { STATUS_COLORS, STATUS_LABELS } from '@/constants/FEEDBACK';
import { getFeedbackImg } from '@/request/api/feedback';
import { log } from '@/utils/logger';

interface FeedbackDetailItem {
  record_id: string;
  fields: {
    content: string;
    screenshots: Array<{ file_token: string }>;
    submitTime: number;
    contact: string;
    source: string;
    status: string;
    type: string;
  };
}

const getStatusStep = (status: string) => {
  if (status === '待处理') return 1;
  if (status === '处理中') return 2;
  if (status === '已完成') return 3;
  return 1;
};

export default function FeedbackDetail() {
  const params = useLocalSearchParams<{ item?: string }>();
  const [previewVisible, setPreviewVisible] = useState(false);
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const [expandContent, setExpandContent] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [imageUrls, setImageUrls] = useState<string[] | null>(null);

  const { currentStyle } = useVisualScheme(({ currentStyle }) => ({
    currentStyle,
  }));

  const feedbackItem: FeedbackDetailItem | null = useMemo(() => {
    if (!params.item) return null;
    try {
      return JSON.parse(decodeURIComponent(params.item));
    } catch {
      return null;
    }
  }, [params.item]);

  useEffect(() => {
    const fetchImages = async () => {
      if (!feedbackItem) {
        setImageUrls(null);
        setIsLoading(false);
        return;
      }

      const tokens =
        feedbackItem.fields.screenshots
          .map(t => t.file_token)
          .filter(Boolean) || [];

      if (!tokens.length) {
        setImageUrls([]);
        setIsLoading(false);
        return;
      }

      setImageUrls(Array(tokens.length).fill(''));
      setIsLoading(true);

      try {
        const res = (await getFeedbackImg({ file_tokens: tokens })) as any;

        if (res?.code === 0 && Array.isArray(res.data?.files)) {
          const map: Record<string, string> = {};

          res.data.files.forEach((it: any) => {
            if (it?.file_token && it?.tmp_download_url) {
              map[it.file_token] = it.tmp_download_url;
            }
          });

          setImageUrls(tokens.map(t => map[t] || ''));
        } else {
          setImageUrls(tokens.map(() => ''));
          Toast.fail('获取图片失败');
        }
      } catch (err) {
        setImageUrls(tokens.map(() => ''));
        log.error('获取图片异常:', err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchImages();
  }, [feedbackItem]);

  if (!feedbackItem) {
    return (
      <ThemeBasedView style={styles.container}>
        <Text style={styles.errorText}>数据加载失败</Text>
      </ThemeBasedView>
    );
  }

  const statusStep = getStatusStep(feedbackItem.fields.status);

  const handleImagePress = (uri: string) => {
    if (!uri) return;
    setPreviewVisible(true);
    setPreviewImage(uri);
  };

  const contentText = feedbackItem.fields.content;
  const isLongContent = contentText.length > 133;
  const displayText =
    !isLongContent || expandContent
      ? contentText
      : contentText.slice(0, 100) + '...';

  const imgTokenCount = feedbackItem.fields.screenshots.length;

  return (
    <View style={[styles.container, currentStyle?.page_background_style]}>
      <View style={styles.progressContainer}>
        {[1, 2, 3].map((step, index) => (
          <React.Fragment key={step}>
            <View style={styles.stepContainer}>
              <View
                style={[
                  styles.circle,
                  statusStep === step && {
                    backgroundColor: STATUS_COLORS[STATUS_LABELS[step - 1]],
                  },
                ]}
              >
                <Text style={styles.circleText}>{step}</Text>
              </View>
              <Text
                style={[
                  styles.stepLabel,
                  statusStep === step && {
                    color: STATUS_COLORS[STATUS_LABELS[step - 1]],
                  },
                ]}
              >
                {STATUS_LABELS[index]}
              </Text>
            </View>

            {index < 2 && (
              <View style={styles.connectorContainer}>
                {[1, 2, 3, 4, 5].map(i => (
                  <View key={i} style={styles.connectorBar} />
                ))}
              </View>
            )}
          </React.Fragment>
        ))}
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View
          style={[styles.card, currentStyle?.feedbackItem_background_style]}
        >
          <View style={styles.infoBlock}>
            <View style={styles.infoRowItem}>
              <Text style={[styles.infoLabel, currentStyle?.text_style]}>
                问题类型
              </Text>
              <View style={styles.infoContainer}>
                <View style={styles.itemTypeleftitem}>
                  <Text style={styles.itemTypeleftitemtext}>
                    {feedbackItem.fields.source}
                  </Text>
                </View>
                <View style={styles.itemTypeleftitem}>
                  <Text style={styles.itemTypeleftitemtext}>
                    {feedbackItem.fields.type}
                  </Text>
                </View>
              </View>
            </View>

            <View style={styles.infoRowItem}>
              <Text style={[styles.infoLabel, currentStyle?.text_style]}>
                进度
              </Text>
              <View
                style={[
                  {
                    backgroundColor:
                      (currentStyle!.feedbackStatus_background_style as any)[
                        feedbackItem.fields.status
                      ] || '',
                  },
                  styles.itemStatuscontainer,
                ]}
              >
                <Text
                  style={[
                    styles.itemStatustext,
                    { color: STATUS_COLORS[feedbackItem.fields.status] },
                  ]}
                >
                  {feedbackItem.fields.status}
                </Text>
              </View>
            </View>

            <View style={styles.infoRowItem}>
              <Text style={[styles.infoLabel, currentStyle?.text_style]}>
                时间
              </Text>

              <Text style={styles.timeText}>
                {feedbackItem.fields.submitTime}
              </Text>
            </View>
          </View>

          <View style={styles.section}>
            <Text style={[styles.sectionTitle, currentStyle?.text_style]}>
              问题描述
            </Text>
            <TouchableOpacity
              activeOpacity={0.8}
              onPress={() => {
                if (isLongContent) setExpandContent(prev => !prev);
              }}
            >
              <Text style={styles.sectionContent}>{displayText}</Text>
              {isLongContent && !expandContent && (
                <Text style={styles.expandText}>点击查看全部</Text>
              )}
            </TouchableOpacity>
          </View>

          <View style={styles.section}>
            <Text style={[styles.sectionTitle, currentStyle?.text_style]}>
              问题截图
            </Text>

            {imgTokenCount === 0 ? (
              <Text style={styles.sectionContent}>暂无图片</Text>
            ) : (
              <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                <View style={styles.imageRow}>
                  {isLoading && imageUrls?.length === imgTokenCount
                    ? imageUrls.map((_, idx) => (
                        <View key={idx} style={styles.imagePlaceholder}>
                          <ActivityIndicator />
                        </View>
                      ))
                    : imageUrls?.length === imgTokenCount
                      ? imageUrls.map((uri, idx) =>
                          uri ? (
                            <TouchableOpacity
                              key={idx}
                              onPress={() => handleImagePress(uri)}
                              activeOpacity={0.8}
                            >
                              <Image source={{ uri }} style={styles.image} />
                            </TouchableOpacity>
                          ) : (
                            <View key={idx} style={styles.imagePlaceholder}>
                              <Text style={styles.placeholderText}>
                                获取失败
                              </Text>
                            </View>
                          )
                        )
                      : Array.from({ length: imgTokenCount }).map((_, idx) => (
                          <View key={idx} style={styles.imagePlaceholder}>
                            <ActivityIndicator />
                          </View>
                        ))}
                </View>
              </ScrollView>
            )}
          </View>

          <View style={styles.section}>
            <Text style={[styles.sectionTitle, currentStyle?.text_style]}>
              联系方式
            </Text>
            <Text style={styles.sectionContent}>
              {feedbackItem.fields.contact || '暂无联系方式'}
            </Text>
          </View>
        </View>
      </ScrollView>

      <Modal
        visible={previewVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setPreviewVisible(false)}
      >
        <View style={styles.previewOverlay}>
          <TouchableOpacity
            style={[StyleSheet.absoluteFill, styles.previewTouchable]}
            activeOpacity={1}
            onPress={() => {
              setPreviewVisible(false);
            }}
          >
            {previewImage && (
              <Image
                source={{ uri: previewImage }}
                style={styles.previewImage}
                resizeMode="contain"
              />
            )}
          </TouchableOpacity>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    position: 'relative',
    paddingHorizontal: 8,
    paddingVertical: 8,
  },
  progressContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    paddingHorizontal: 32,
    paddingVertical: 28,
  },
  stepContainer: {
    flex: 1,
    alignItems: 'center',
  },
  circle: {
    width: 45,
    height: 45,
    borderRadius: 22.5,
    backgroundColor: '#E5E7EB',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  circleText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
  },
  stepLabel: {
    fontSize: 12,
    color: '#d7d8db',
    fontWeight: '600',
  },
  connectorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 24,
  },
  connectorBar: {
    width: 8,
    height: 7,
    borderRadius: 4,
    backgroundColor: '#E5E7EB',
    marginHorizontal: 3,
  },
  scrollContent: {
    padding: 16,
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.02,
    shadowRadius: 12,
    elevation: 2,
  },
  infoBlock: {
    marginBottom: 24,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
    paddingBottom: 24,
  },
  infoRowItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  infoLabel: {
    color: '#9CA3AF',
    fontSize: 14,
  },
  infoContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: 4,
  },
  timeText: {
    fontSize: 14,
    color: '#9E9E9E',
  },
  itemTypeleftitem: {
    width: 72,
    height: 27,
    paddingHorizontal: 6,
    paddingVertical: 4,
    borderRadius: 999,
    backgroundColor: '#F6F5FF',
    marginRight: 0,
    justifyContent: 'center',
    alignItems: 'center',
  },
  itemTypeleftitemtext: {
    fontSize: 12,
    lineHeight: 16,
    fontWeight: '400',
    color: '#7B70F1',
    textAlign: 'center',
  },
  itemStatustext: {
    fontSize: 12,
    fontWeight: '400',
  },
  itemStatuscontainer: {
    height: 27,
    paddingHorizontal: 10,
    borderRadius: 999,
    justifyContent: 'center',
    alignItems: 'center',
  },
  section: {
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '500',
    marginBottom: 8,
    color: '#374151',
  },
  sectionContent: {
    fontSize: 15,
    color: '#9E9E9E',
    lineHeight: 22,
  },
  expandText: {
    fontSize: 13,
    color: '#7B70F1',
    marginTop: 4,
  },
  imageRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  image: {
    width: 72,
    height: 72,
    borderRadius: 8,
    marginRight: 8,
    backgroundColor: '#F3F4F6',
  },
  imagePlaceholder: {
    width: 72,
    height: 72,
    borderRadius: 8,
    marginRight: 8,
    backgroundColor: '#F3F4F6',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  placeholderText: {
    color: '#9CA3AF',
    fontSize: 12,
  },
  previewOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.85)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  previewTouchable: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  previewImage: {
    width: '90%',
    height: '90%',
  },
  errorText: {
    marginTop: 40,
    textAlign: 'center',
    color: '#EF4444',
  },
});
