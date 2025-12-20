import AsyncStorage from '@react-native-async-storage/async-storage';
import * as ImagePicker from 'expo-image-picker';
import { useCallback, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Image,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';

import ThemeBasedView from '@/components/view';

import api from '@/utils/api';
import { log } from '@/utils/logger';
import { uploadFileToFeishuBitable } from '@/utils/uploadPicture';

function WriteFeedback() {
  const [selectedIssueType, setSelectedIssueType] = useState<string | null>(
    null
  );
  const [selectedModule, setSelectedModule] = useState<string | null>(null);
  const [description, setDescription] = useState('');
  const [contact, setContact] = useState('');
  const [selectedImage, setSelectedImage] = useState('');
  const isSubmitEnabled =
    !!selectedIssueType && !!selectedModule && description.trim().length > 0;
  const [imageToken, setImageToken] = useState<string | null>(null);
  const [isUploadingImage, setIsUploadingImage] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleDescriptionChange = useCallback((text: string) => {
    if (text.length <= 200) {
      setDescription(text);
    }
  }, []);

  const handleSelectImage = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      log.error('相册权限被拒绝');
      Alert.alert('权限被拒绝', '需要相册权限来选择图片');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: 'images',
      allowsEditing: true,
      quality: 0.7,
      aspect: [4, 3],
    });

    if (!result.canceled) {
      const imageUri = result.assets[0].uri;
      setSelectedImage(imageUri);
      await uploadImageToFeishu(imageUri);
    }
  };
  const uploadImageToFeishu = async (imageUri: string): Promise<void> => {
    try {
      setIsUploadingImage(true);

      const accessToken = (await AsyncStorage.getItem('access_token')) || '';

      console.log('access token when upload:', accessToken);

      if (!accessToken) {
        Alert.alert('上传失败', '请先登录获取访问令牌');
        return;
      }

      const fileName = imageUri.split('/').pop() || 'image.jpg';
      console.log('文件名:', fileName);

      const uploadResult = await uploadFileToFeishuBitable(
        accessToken,
        imageUri,
        fileName
      );
      console.log('完整上传结果:', uploadResult);

      if (uploadResult && uploadResult.data && uploadResult.data.file_token) {
        setImageToken(uploadResult.data.file_token);
        Alert.alert('上传成功', '图片已成功上传到飞书');
      } else {
        Alert.alert('上传失败', '无法获取文件token，请重试');
        setSelectedImage('');
      }
    } catch (error: any) {
      console.error('完整错误信息:', error);
      if (error.response) {
        console.error('响应数据:', error.response.data);
        console.error('响应状态:', error.response.status);
      }
      Alert.alert('图片上传失败', error.message || '请检查网络连接后重试');
      setSelectedImage('');
    } finally {
      setIsUploadingImage(false);
    }
  };

  const handleRemoveImage = () => {
    setSelectedImage('');
    setImageToken(null);
  };

  const handleSubmit = async () => {
    if (!isSubmitEnabled || isSubmitting) return;

    setIsSubmitting(true);
    try {
      const requestData = {
        student_id: '2024214381',
        contact: contact || '未提供联系方式',
        content: description,
        screen_shot: [
          {
            file_token: imageToken,
          },
        ],
        problem_type: `${selectedIssueType}-${selectedModule}`,
        problem_source: '华师匣子',
        ignore_consistency_check: true,
      };

      console.log('提交的请求参数:', requestData);

      const response = await api.post('/sheet/createrecord', requestData);

      if (response.data) {
        Alert.alert('提交成功', '感谢您的反馈！');
        setSelectedIssueType(null);
        setSelectedModule(null);
        setDescription('');
        setContact('');
        setSelectedImage('');
      } else {
        Alert.alert('提交失败', response.data?.message || '请稍后重试');
      }
    } catch (error: any) {
      console.error('提交错误:', error.response || error);
      const errorMessage =
        error.response?.data?.message ||
        error.response?.statusText ||
        '无法连接到服务器，请检查网络';
      Alert.alert('提交失败', errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <ThemeBasedView style={styles.container}>
      <View>
        <View
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            marginTop: 16,
            marginBottom: 6,
          }}
        >
          <Text style={{ fontSize: 16, fontWeight: 400 }}>问题类型</Text>
          <Text style={{ color: 'red', fontSize: 16, fontWeight: 400 }}>*</Text>
        </View>

        <View style={styles.choose1}>
          <TouchableOpacity
            style={[
              styles.issueTypeOption,
              styles.defaultOption,
              selectedIssueType === 'function' && styles.selectedOption,
            ]}
            onPress={() =>
              setSelectedIssueType(prev =>
                prev === 'function' ? null : 'function'
              )
            }
          >
            <Text
              style={[
                styles.defaultText,
                selectedIssueType === 'function' && styles.selectedText,
              ]}
            >
              功能异常
            </Text>
            <Text style={styles.optionDescription}>
              页面加载缓慢、无法使用、闪退
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[
              styles.issueTypeOption,
              styles.defaultOption,
              selectedIssueType === 'improvement' && styles.selectedOption,
            ]}
            onPress={() =>
              setSelectedIssueType(prev =>
                prev === 'improvement' ? null : 'improvement'
              )
            }
          >
            <Text
              style={[
                styles.defaultText,
                selectedIssueType === 'improvement' && styles.selectedText,
              ]}
            >
              产品改进
            </Text>
            <Text style={styles.optionDescription}>
              界面优化、功能建议、体验提升
            </Text>
          </TouchableOpacity>
        </View>

        <View style={styles.choose2}>
          {['首页', '课表', '消息', '更多', '其他问题'].map(module => (
            <TouchableOpacity
              key={module}
              style={[
                styles.moduleOption,
                styles.defaultOption,
                selectedModule === module && styles.selectedOption,
              ]}
              onPress={() =>
                setSelectedModule(prev => (prev === module ? null : module))
              }
            >
              <Text
                style={[
                  styles.defaultText,
                  selectedModule === module && styles.selectedText,
                ]}
              >
                {module}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      <View></View>
      <View>
        <View style={styles.inputContainer}>
          <Text style={styles.label}>问题描述</Text>
          <TextInput
            style={styles.textInput}
            multiline={true}
            placeholder="请详细描述您遇到的问题..."
            value={description}
            onChangeText={handleDescriptionChange}
            maxLength={200}
            textAlignVertical="top"
          />
          <Text style={styles.counter}>{description.length}/200</Text>
        </View>
      </View>
      <View style={styles.uploadContainer}>
        <Text style={styles.label}>上传图片（选填）</Text>
        <TouchableOpacity
          style={styles.uploadArea}
          onPress={handleSelectImage}
          disabled={isUploadingImage}
        >
          {selectedImage ? (
            <Image
              source={{ uri: selectedImage }}
              style={{ width: '100%', height: '100%', borderRadius: 8 }}
            />
          ) : isUploadingImage ? (
            <ActivityIndicator size="small" color="#7B70F1" />
          ) : (
            <Image
              source={require('@/assets/images/add.png')}
              style={{ width: 14, height: 14 }}
            />
          )}
        </TouchableOpacity>
        {isUploadingImage && (
          <Text style={styles.uploadStatus}>图片上传中...</Text>
        )}
      </View>
      <View>
        <View style={styles.inputContainer}>
          <Text style={styles.label}>联系方式（选填）</Text>
          <TextInput
            style={styles.contactInput}
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
          !isSubmitEnabled && styles.submitButtonDisabled,
        ]}
        onPress={handleSubmit}
        disabled={!isSubmitEnabled || isSubmitting}
      >
        <Text
          style={[
            styles.submitButtonText,
            !isSubmitEnabled && styles.submitButtonDisabledText,
          ]}
        >
          提交
        </Text>
      </TouchableOpacity>
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
  inputContainer: {
    marginBottom: 16,
  },
  label: {
    fontSize: 16,
    fontWeight: '400',
    marginBottom: 18,
    marginTop: 8,
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
  },
  textInput: {
    backgroundColor: '#fff',
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#ddd',
    minHeight: 100,
  },
  contactInput: {
    backgroundColor: '#fff',
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#ddd',
    height: 50,
  },
  counter: {
    alignSelf: 'flex-end',
    fontSize: 12,
    color: '#6B7280',
    marginTop: -20,
    marginRight: 8,
  },
  choose1: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginVertical: 16,
  },
  choose2: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginVertical: 16,
  },
  issueTypeOption: {
    flex: 1,
    marginHorizontal: 16,
    borderRadius: 10,
  },
  moduleOption: {
    margin: 5,
    paddingVertical: 12,
    paddingHorizontal: 33,
    borderRadius: 20,
  },
  defaultOption: {
    borderWidth: 1,
    borderColor: '#ddd',
    backgroundColor: '#fff',
    padding: 12,
  },
  selectedOption: {
    borderWidth: 1,
    borderColor: '#7B70F1',
    backgroundColor: '#F6F5FF',
    padding: 12,
  },
  defaultText: {
    color: '#333',
    fontSize: 14,
    fontWeight: 500,
  },
  selectedText: {
    color: '#7B70F1',
    fontSize: 14,
    fontWeight: '500',
  },
  optionDescription: {
    fontSize: 10,
    fontWeight: 400,
    color: '#6B7280',
    marginTop: 16,
    marginBottom: 5,
  },
  uploadContainer: {
    marginBottom: 16,
  },
  uploadArea: {
    height: 80,
    width: 80,
    borderWidth: 1,
    borderColor: '#ddd',
    borderStyle: 'dashed',
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    marginVertical: 8,
  },
  uploadIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#f5f5f5',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  submitButton: {
    backgroundColor: '#7B70F1',
    paddingVertical: 18,
    borderRadius: 30,
    alignItems: 'center',
  },
  submitButtonDisabled: {
    backgroundColor: '#ccc',
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
});
export default WriteFeedback;
