import { Toast } from '@ant-design/react-native';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { router } from 'expo-router';
import { getItem } from 'expo-secure-store';
import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';

import ThemeBasedView from '@/components/view';

import useVisualScheme from '@/store/visualScheme';

import {
  FEEDBACK_TABLE_IDENTIFY,
  ISSUE_TYPE_MAP,
  MODULE_MAP,
} from '@/constants/FEEDBACK';
import { createFeedbackRecord } from '@/request/api/feedback';
import { log } from '@/utils/logger';
import { uploadFileToFeishuBitable } from '@/utils/uploadPicture';

type ImageItem = {
  uri: string;
  token?: string | null;
  uploading?: boolean;
};

function WriteFeedback() {
  const [selectedIssueType, setSelectedIssueType] =
    useState<string>('function');
  const [selectedModule, setSelectedModule] = useState<string>(
    MODULE_MAP.function[0]
  );
  const [description, setDescription] = useState('');
  const [contact, setContact] = useState('');
  const [images, setImages] = useState<ImageItem[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { currentStyle } = useVisualScheme(({ currentStyle }) => ({
    currentStyle,
  }));

  const currentModules = useMemo(() => {
    return MODULE_MAP[selectedIssueType];
  }, [selectedIssueType]);

  useEffect(() => {
    const modules = MODULE_MAP[selectedIssueType];
    setSelectedModule(modules[0]);
  }, [selectedIssueType]);

  const isSubmitEnabled =
    selectedIssueType &&
    selectedModule &&
    description.trim().length > 0 &&
    !images.some(img => img.uploading);

  const handleDescriptionChange = useCallback((text: string) => {
    if (text.length <= 200) {
      setDescription(text);
    }
  }, []);

  const uploadImageToFeishu = async (
    imageUri: string
  ): Promise<string | null> => {
    try {
      const fileName = imageUri.split('/').pop() || 'image.jpg';
      const uploadResult = await uploadFileToFeishuBitable(imageUri, fileName);

      if (uploadResult && uploadResult.data && uploadResult.data.file_token) {
        return uploadResult.data.file_token;
      } else {
        console.warn('上传缺少token', uploadResult);
        return null;
      }
    } catch (error: any) {
      console.error('上传图片出错:', error);
      return null;
    }
  };

  const handleSelectImage = async () => {
    Toast.info('应用将申请相册权限用于上传图片');
    try {
      const { status } =
        await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== 'granted') {
        log.error('相册权限被拒绝');
        Toast.fail('权限被拒绝,需要相册权限来选择图片');
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: 'images',
        allowsEditing: true,
        quality: 0.7,
        aspect: [4, 3],
      });

      if (result.canceled) return;

      const assets = result.assets || [];
      if (assets.length === 0) return;

      for (const asset of assets) {
        const uri = asset.uri;
        setImages(prev => {
          if (prev.some(i => i.uri === uri)) return prev;
          return [...prev, { uri, uploading: true }];
        });

        (async () => {
          const token = await uploadImageToFeishu(uri);
          setImages(prev =>
            prev.map(item =>
              item.uri === uri
                ? { ...item, token: token ?? null, uploading: false }
                : item
            )
          );

          if (!token) {
            setTimeout(
              () => Toast.fail('图片上传失败，请重试或删除该图片'),
              3500
            );
          }
        })();
      }
    } catch (err: any) {
      console.error('选择图片出错:', err);
      Toast.fail('选择图片失败,请重试');
    }
  };

  const handleRemoveImage = (uri: string) => {
    setImages(prev => prev.filter(img => img.uri !== uri));
  };

  const handleSubmit = async () => {
    if (!isSubmitEnabled || isSubmitting) return;

    setIsSubmitting(true);
    try {
      const user = getItem('user');
      const userId = user ? JSON.parse(user)?.state?.student_id : undefined;

      const fileTokens = images.map(img => img.token).filter(Boolean);

      const requestData = {
        table_identify: FEEDBACK_TABLE_IDENTIFY,
        student_id: userId,
        content: description,
        contact_info: contact,
        images: fileTokens,
        extra_record: {
          问题类型: selectedModule,
          问题来源: ISSUE_TYPE_MAP[selectedIssueType!],
        },
      };

      const res = await createFeedbackRecord(requestData as any);

      if (res.code === 0 && res.data) {
        Toast.success('提交成功,感谢您的反馈！');
        setDescription('');
        setContact('');
        setImages([]);
      } else {
        Toast.fail('提交失败, 请稍后重试');
      }
    } catch (error: any) {
      console.error('提交错误:', error.response || error);
      Toast.fail('提交失败,无法连接到服务器，请检查网络');
    } finally {
      setIsSubmitting(false);
      router.back();
    }
  };

  const isAnyImageUploading = useMemo(
    () => images.some(img => img.uploading),
    [images]
  );

  return (
    <ThemeBasedView style={styles.container}>
      <ScrollView>
        <View>
          <View
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              marginTop: 16,
              marginBottom: 6,
            }}
          >
            <Text
              style={[
                { fontSize: 16, fontWeight: '400' },
                currentStyle?.text_style,
              ]}
            >
              问题类型
            </Text>
            <Text style={{ color: 'red', fontSize: 16, fontWeight: '400' }}>
              *
            </Text>
          </View>

          <View style={styles.choose1}>
            <TouchableOpacity
              style={[
                styles.issueTypeOption,
                styles.defaultOption,
                currentStyle?.feedback_defaultOption_style,
                selectedIssueType === 'function' && styles.selectedOption,
              ]}
              onPress={() => setSelectedIssueType('function')}
            >
              <Text
                style={[
                  styles.defaultText,
                  currentStyle?.text_style,
                  selectedIssueType === 'function' && styles.selectedText,
                ]}
              >
                功能异常
              </Text>
              <Text
                style={[styles.optionDescription, currentStyle?.text_style]}
              >
                页面加载缓慢、无法使用、闪退
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[
                styles.issueTypeOption,
                styles.defaultOption,
                currentStyle?.feedback_defaultOption_style,
                selectedIssueType === 'improvement' && styles.selectedOption,
              ]}
              onPress={() => setSelectedIssueType('improvement')}
            >
              <Text
                style={[
                  styles.defaultText,
                  currentStyle?.text_style,
                  selectedIssueType === 'improvement' && styles.selectedText,
                ]}
              >
                产品改进
              </Text>
              <Text
                style={[styles.optionDescription, currentStyle?.text_style]}
              >
                界面优化、功能建议、体验提升
              </Text>
            </TouchableOpacity>
          </View>

          <View style={styles.choose2}>
            {currentModules.map(module => (
              <TouchableOpacity
                key={module}
                style={[
                  styles.moduleOption,
                  styles.defaultOption,
                  currentStyle?.feedback_defaultOption_style,
                  selectedModule === module && styles.selectedOption,
                ]}
                onPress={() => {
                  setSelectedModule(module);
                }}
              >
                <Text
                  style={[
                    styles.defaultText,
                    currentStyle?.text_style,
                    selectedModule === module && styles.selectedText,
                  ]}
                >
                  {module}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        <View>
          <View style={styles.inputContainer}>
            <Text style={[styles.label, currentStyle?.text_style]}>
              问题描述{' '}
              <Text style={{ color: 'red', fontSize: 16, fontWeight: '400' }}>
                *
              </Text>
            </Text>

            <TextInput
              style={[
                styles.textInput,
                currentStyle?.feedback_defaultOption_style as any,
                currentStyle?.text_style,
              ]}
              multiline={true}
              placeholderTextColor={'#9E9E9E'}
              placeholder={
                '请详细描述您遇到的问题...\n如: "首页查算学分绩功能，点击查询后无法显示学分绩"'
              }
              value={description}
              onChangeText={handleDescriptionChange}
              maxLength={200}
              textAlignVertical="top"
            />
            <Text style={styles.counter}>{description.length}/200</Text>
          </View>
        </View>

        <View style={styles.uploadContainer}>
          <Text style={[styles.label, currentStyle?.text_style]}>上传图片</Text>

          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            <View style={styles.thumbnailList}>
              {images.map(img => (
                <View key={img.uri} style={styles.thumbnailWrapper}>
                  <Image source={{ uri: img.uri }} style={styles.thumbnail} />
                  {img.uploading && (
                    <View style={styles.thumbnailOverlay}>
                      <ActivityIndicator size="small" />
                    </View>
                  )}
                  <TouchableOpacity
                    style={styles.removeButton}
                    onPress={() => handleRemoveImage(img.uri)}
                  >
                    <Text
                      style={[
                        styles.removeButtonText,
                        currentStyle?.text_style,
                      ]}
                    >
                      ×
                    </Text>
                  </TouchableOpacity>
                </View>
              ))}

              <TouchableOpacity
                style={styles.addThumbnail}
                onPress={handleSelectImage}
                disabled={isAnyImageUploading}
              >
                <Ionicons
                  name="add"
                  size={18}
                  color={currentStyle?.information_text_style?.color}
                />
              </TouchableOpacity>
            </View>
          </ScrollView>
        </View>

        <View>
          <View style={styles.inputContainer}>
            <Text style={[styles.label, currentStyle?.text_style]}>
              联系方式
            </Text>
            <TextInput
              style={[
                styles.contactInput,
                currentStyle?.feedback_defaultOption_style as any,
                currentStyle?.text_style,
              ]}
              placeholderTextColor={'#9E9E9E'}
              placeholder="QQ/邮箱"
              value={contact}
              onChangeText={setContact}
              keyboardType="default"
            />
          </View>
        </View>

        <TouchableOpacity
          style={[
            styles.submitButton,
            (!isSubmitEnabled || isSubmitting) &&
              currentStyle?.feedback_disabledSubmitButton_style,
          ]}
          onPress={handleSubmit}
          disabled={!isSubmitEnabled || isSubmitting}
        >
          <Text
            style={[
              styles.submitButtonText,
              currentStyle?.text_style,
              (!isSubmitEnabled || isSubmitting) &&
                styles.submitButtonDisabledText,
            ]}
          >
            {isSubmitting ? '提交中...' : '提交'}
          </Text>
        </TouchableOpacity>

        <View style={styles.tipWrapper}>
          <Text style={[currentStyle?.text_style]}>
            上传图片与联系方式，帮助我们更好的解决问题~
          </Text>
        </View>
      </ScrollView>
    </ThemeBasedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F9FB',
    paddingHorizontal: 16,
    paddingVertical: 6,
  },
  inputContainer: {
    marginBottom: 14,
  },
  label: {
    fontSize: 16,
    fontWeight: '400',
    marginBottom: 14,
    marginTop: 6,
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
  },
  textInput: {
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
    minHeight: 100,
  },
  contactInput: {
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
    height: 50,
  },
  counter: {
    alignSelf: 'flex-end',
    fontSize: 12,
    color: '#6B7280',
    marginTop: -18,
    marginRight: 8,
  },
  choose1: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginVertical: 14,
  },
  choose2: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginVertical: 16,
  },
  issueTypeOption: {
    width: '48%',
    borderRadius: 10,
  },
  moduleOption: {
    margin: 4,
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
  },
  defaultOption: {
    borderWidth: 1,
    borderColor: '#ddd',
    backgroundColor: '#fff',
    padding: 8,
  },
  selectedOption: {
    borderWidth: 1,
    borderColor: '#7B70F1',
    padding: 12,
  },
  defaultText: {
    color: '#333',
    fontSize: 14,
    fontWeight: '500',
  },
  selectedText: {
    color: '#7B70F1',
    fontSize: 14,
    fontWeight: '500',
  },
  optionDescription: {
    fontSize: 10,
    fontWeight: '400',
    color: '#6B7280',
    marginTop: 12,
    marginBottom: 6,
  },
  uploadContainer: {
    marginBottom: 14,
  },
  thumbnailList: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 4,
  },
  thumbnailWrapper: {
    width: 72,
    height: 72,
    borderRadius: 8,
    marginRight: 10,
    overflow: 'hidden',
    position: 'relative',
  },
  thumbnail: {
    width: '100%',
    height: '100%',
  },
  thumbnailOverlay: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.6)',
  },
  removeButton: {
    position: 'absolute',
    top: 2,
    right: 2,
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: 'rgba(0,0,0,0.6)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  removeButtonText: {
    color: '#fff',
    fontSize: 14,
    lineHeight: 14,
  },
  addThumbnail: {
    width: 72,
    height: 72,
    borderRadius: 8,
    borderWidth: 1,
    borderStyle: 'dashed',
    borderColor: '#a9a9a9ff',
    justifyContent: 'center',
    alignItems: 'center',
  },
  addText: {
    fontSize: 12,
    marginTop: 6,
    color: '#666',
  },
  submitButton: {
    backgroundColor: '#7B70F1',
    paddingVertical: 18,
    borderRadius: 30,
    alignItems: 'center',
  },
  submitButtonDisabled: {
    backgroundColor: '#E5E5E5',
  },
  submitButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '500',
  },
  submitButtonDisabledText: {
    color: '#999999',
  },
  uploadStatus: {
    marginTop: 8,
    fontSize: 12,
    color: '#7B70F1',
    textAlign: 'center',
  },
  tipWrapper: {
    marginTop: 8,
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default WriteFeedback;
