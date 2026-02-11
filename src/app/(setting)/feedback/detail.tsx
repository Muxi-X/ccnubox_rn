import { Toast } from '@ant-design/react-native';
import { useLocalSearchParams } from 'expo-router';
import React, { useEffect, useState } from 'react';
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

import Loading from '@/components/loading';
import ThemeBasedView from '@/components/view';

import useVisualScheme from '@/store/visualScheme';

import { FEEDBACK_TABLE_IDENTIFY, STATUS_LABELS } from '@/constants/FEEDBACKS';
import {
  getFeedbackImg,
  getSingleFeedbackRecord,
} from '@/request/api/feedback';
import { log } from '@/utils/logger';

import {
  FeedbackItem as FeedbackDetailItem,
  transformSingleRecord,
} from './history';

const getStatusStep = (status: string) => {
  if (status === '待处理') return 1;
  if (status === '处理中') return 2;
  if (status === '已完成') return 3;
  return 1;
};

export default function FeedbackDetail() {
  const params = useLocalSearchParams<{
    item?: string;
    record_id?: string;
  }>();

  const [previewVisible, setPreviewVisible] = useState(false);
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const [expandContent, setExpandContent] = useState(false);
  const [isLoadingImages, setIsLoadingImages] = useState(false);
  const [isLoadingDetail, setIsLoadingDetail] = useState(false);
  const [imageUrls, setImageUrls] = useState<string[] | null>(null);
  const [feedbackItem, setFeedbackItem] = useState<FeedbackDetailItem | null>(
    null
  );

  const { currentStyle } = useVisualScheme(({ currentStyle }) => ({
    currentStyle,
  }));

  const currentSource = params.item
    ? 'history'
    : params.record_id
      ? 'message'
      : 'unknown';

  useEffect(() => {
    const fetchFeedbackDetail = async () => {
      if (currentSource === 'history' && params.item) {
        try {
          const parsedData = JSON.parse(decodeURIComponent(params.item));
          setFeedbackItem(parsedData);
        } catch {
          Toast.fail('数据获取失败');
        }
        return;
      }

      if (currentSource === 'message' && params.record_id) {
        setIsLoadingDetail(true);
        try {
          const requestData = {
            record_id: params.record_id,
            table_identify: FEEDBACK_TABLE_IDENTIFY,
          };

          const res = (await getSingleFeedbackRecord(requestData)) as any;

          if (res?.code === 0 && res.data) {
            const feedbackData = transformSingleRecord(
              params.record_id,
              res.data.record
            );
            setFeedbackItem(feedbackData);
          } else {
            Toast.fail(res?.message || '获取详情失败');
            setFeedbackItem(null);
          }
        } catch (error) {
          log.error('获取反馈详情异常:', error);
          Toast.fail('网络请求失败');
          setFeedbackItem(null);
        } finally {
          setIsLoadingDetail(false);
        }
        return;
      }

      if (currentSource === 'unknown') {
        setFeedbackItem(null);
        Toast.fail('获取详情失败');
      }
    };

    fetchFeedbackDetail();
  }, [currentSource, params.item, params.record_id]);

  useEffect(() => {
    const fetchImages = async () => {
      if (!feedbackItem) {
        setImageUrls(null);
        setIsLoadingImages(false);
        return;
      }

      const tokens =
        feedbackItem.fields.screenshots
          .map(t => t.file_token)
          .filter(Boolean) || [];

      if (!tokens.length) {
        setImageUrls([]);
        setIsLoadingImages(false);
        return;
      }

      setImageUrls(Array(tokens.length).fill(''));
      setIsLoadingImages(true);

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
        setIsLoadingImages(false);
      }
    };

    fetchImages();
  }, [feedbackItem]);

  if (isLoadingDetail) {
    return <Loading />;
  }

  if (!feedbackItem) {
    return (
      <ThemeBasedView style={[styles.container, styles.centered]}>
        <Text style={currentStyle?.text_style}>
          {currentSource === 'unknown' ? '跳转路径错误' : '数据加载失败'}
        </Text>
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
                  statusStep === step
                    ? currentStyle?.feedback_detail_statusCircle_style?.getStyle(
                        STATUS_LABELS[step - 1]
                      )
                    : currentStyle?.feedback_detail_statusCircle_style?.getStyle(
                        '默认'
                      ),
                ]}
              >
                <Text
                  style={[
                    styles.circleText,
                    step === 1 &&
                      statusStep === step &&
                      currentStyle?.inverted_text_style,
                  ]}
                >
                  {step}
                </Text>
              </View>
              <Text
                style={[
                  styles.stepLabel,
                  statusStep === step &&
                    currentStyle?.feedback_statusText_style?.getStyle(
                      STATUS_LABELS[step - 1]
                    ),
                ]}
              >
                {STATUS_LABELS[index]}
              </Text>
            </View>

            {index < 2 && (
              <View style={styles.connectorContainer}>
                {[1, 2, 3, 4, 5].map(i => (
                  <View
                    key={i}
                    style={[
                      styles.connectorBar,
                      currentStyle?.feedback_detail_statusCircle_style?.getStyle(
                        '默认'
                      ),
                    ]}
                  />
                ))}
              </View>
            )}
          </React.Fragment>
        ))}
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={[styles.card, currentStyle?.feedback_card_style]}>
          <View style={styles.infoBlock}>
            <View style={styles.infoRowItem}>
              <Text style={styles.infoLabel}>问题类型</Text>
              <View style={styles.infoContainer}>
                <View
                  style={[
                    styles.itemTypeleftitem,
                    currentStyle?.feedback_history_metaData_style,
                  ]}
                >
                  <Text
                    style={[
                      styles.itemTypeleftitemtext,
                      currentStyle?.feedback_history_metaData_text_style,
                    ]}
                  >
                    {feedbackItem.fields.source}
                  </Text>
                </View>
                <View
                  style={[
                    styles.itemTypeleftitem,
                    currentStyle?.feedback_history_metaData_style,
                  ]}
                >
                  <Text
                    style={[
                      styles.itemTypeleftitemtext,
                      currentStyle?.feedback_history_metaData_text_style,
                    ]}
                  >
                    {feedbackItem.fields.type}
                  </Text>
                </View>
              </View>
            </View>

            <View style={styles.infoRowItem}>
              <Text style={styles.infoLabel}>进度</Text>
              <View
                style={[
                  styles.itemStatuscontainer,
                  currentStyle?.feedback_status_style?.getStyle(
                    feedbackItem.fields.status
                  ),
                ]}
              >
                <Text
                  style={[
                    styles.itemStatustext,
                    currentStyle?.feedback_statusText_style?.getStyle(
                      feedbackItem.fields.status
                    ),
                  ]}
                >
                  {feedbackItem.fields.status}
                </Text>
              </View>
            </View>

            <View style={styles.infoRowItem}>
              <Text style={styles.infoLabel}>时间</Text>
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
              <Text
                style={[
                  styles.sectionContent,
                  currentStyle?.feedback_detail_text_style,
                ]}
              >
                {displayText}
              </Text>
              {isLongContent && !expandContent && (
                <Text style={styles.expandText}>点击查看全部</Text>
              )}
              <Text
                style={[
                  styles.sectionContent,
                  {
                    marginTop: 6,
                    color: '#7F838A',
                  },
                ]}
              >
                回复：{feedbackItem.fields.reply}
              </Text>
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
                  {isLoadingImages && imageUrls?.length === imgTokenCount
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
  centered: {
    justifyContent: 'center',
    alignItems: 'center',
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
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  circleText: {
    fontSize: 18,
    color: '#FFFFFF',
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
    width: 9,
    height: 7,
    borderRadius: 4,
    marginHorizontal: 3,
  },
  scrollContent: {
    padding: 16,
  },
  card: {
    borderRadius: 12,
    padding: 20,
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.02,
    shadowRadius: 12,
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
    color: '#9E9E9E',
    fontSize: 14,
  },
  infoContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: 4,
  },
  timeText: {
    fontSize: 14,
    color: '#9CA3AF',
  },
  itemTypeleftitem: {
    width: 72,
    height: 27,
    paddingHorizontal: 6,
    paddingVertical: 4,
    borderRadius: 999,
    marginRight: 0,
    justifyContent: 'center',
    alignItems: 'center',
  },
  itemTypeleftitemtext: {
    fontSize: 12,
    lineHeight: 16,
    fontWeight: '400',
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
    backgroundColor: '#F6F5FF',
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
  },
  sectionContent: {
    fontSize: 15,
    color: '#9CA3AF',
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
});
