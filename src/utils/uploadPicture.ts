import axios from 'axios';
import * as FileSystem from 'expo-file-system';
import { Platform } from 'react-native';

// 重新实现Adler32计算，飞书接口可能需要这个校验
function calculateAdler32(arrayBuffer: ArrayBuffer): string {
  const view = new Uint8Array(arrayBuffer);
  let a = 1;
  let b = 0;

  for (let i = 0; i < view.length; i++) {
    a = (a + view[i]) % 65521;
    b = (b + a) % 65521;
  }

  return ((b << 16) | a).toString();
}

// 修复Base64解码函数在React Native中的使用
function base64ToUint8Array(base64: string): Uint8Array {
  const decoded = decodeURIComponent(encodeURIComponent(atob(base64)));
  const bytes = new Uint8Array(decoded.length);
  for (let i = 0; i < decoded.length; i++) {
    bytes[i] = decoded.charCodeAt(i);
  }
  return bytes;
}

// 获取文件信息的辅助函数
async function getFileInfo(
  fileUri: string
): Promise<{ size: number; arrayBuffer: ArrayBuffer }> {
  try {
    const fileInfo = await FileSystem.getInfoAsync(fileUri);

    if (!fileInfo.exists) {
      throw new Error('文件不存在');
    }

    const fileContent = await FileSystem.readAsStringAsync(fileUri, {
      encoding: FileSystem.EncodingType.Base64,
    });

    const bytes = base64ToUint8Array(fileContent);
    const arrayBuffer = bytes.buffer as ArrayBuffer;

    return {
      size: fileInfo.size || 0,
      arrayBuffer,
    };
  } catch (error) {
    console.error('获取文件信息失败:', error);
    throw error;
  }
}

async function uploadFileToFeishuBitable(
  accessToken: string,
  fileUri: string,
  fileName: string
): Promise<any> {
  const FIXED_CONFIG = {
    parentType: 'bitable_image',
    parentNode: 'LC8aboXkCaAJaksSACOc9OS5nHf',
  };

  try {
    // 获取文件信息和内容
    const fileInfo = await getFileInfo(fileUri);

    // 构建 FormData
    const formData = new FormData();

    // 添加文本字段
    formData.append('file_name', fileName);
    formData.append('parent_type', FIXED_CONFIG.parentType);
    formData.append('parent_node', FIXED_CONFIG.parentNode);
    formData.append('size', fileInfo.size.toString());

    // 计算并添加校验和
    const checkSum = calculateAdler32(fileInfo.arrayBuffer);
    formData.append('checksum', checkSum);

    // 处理文件URI以兼容iOS和Android
    const fileUriFormatted =
      Platform.OS === 'ios' ? fileUri.replace('file://', '') : fileUri;
    const fileType = fileName.includes('.png') ? 'image/png' : 'image/jpeg';

    // 添加文件
    formData.append('file', {
      uri: fileUriFormatted,
      type: fileType,
      name: fileName,
    } as any);

    console.log('准备上传文件:', {
      fileName,
      fileSize: fileInfo.size,
      fileUri: fileUriFormatted,
      parentType: FIXED_CONFIG.parentType,
      parentNode: FIXED_CONFIG.parentNode,
      checkSum,
      accessTokenPresent: !!accessToken,
    });

    // 发送请求
    const response = await axios.post(
      'https://open.feishu.cn/open-apis/drive/v1/medias/upload_all',
      formData,
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          'Content-Type': 'multipart/form-data; boundary=---7MA4YWxkTrZu0gW',
        },
        timeout: 30000,
        transformRequest: [data => data],
      }
    );

    console.log('上传响应:', response.data);

    if (response.data.code === 0) {
      return response.data;
    } else {
      throw new Error(`上传失败: ${response.data.msg || '未知错误'}`);
    }
  } catch (error: any) {
    console.error('上传错误详情:', {
      message: error.message,
      response: error.response?.data,
      status: error.response?.status,
      accessTokenUsed: !!accessToken,
    });
    throw error;
  }
}

export { uploadFileToFeishuBitable };
