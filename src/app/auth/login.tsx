import { Checkbox, Icon, Input, Toast } from '@ant-design/react-native';
import { OnChangeParams } from '@ant-design/react-native/es/checkbox/PropsType';
import axios, { AxiosError } from 'axios';
import Constants from 'expo-constants';
import { useRouter } from 'expo-router';
import { setItem } from 'expo-secure-store';
import { FC, useState } from 'react';
import {
  Image,
  ImageSourcePropType,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  Text,
  View,
} from 'react-native';

import { useKeyboardShow } from '@/hooks';

import AnimatedFade from '@/components/animatedView/AnimatedFade';
import AnimatedOpacity from '@/components/animatedView/AnimatedOpacity';
import Button from '@/components/button';
import Modal from '@/components/modal';

import useUserStore from '@/store/user';
import useVisualScheme from '@/store/visualScheme';

import MXLogo from '@/assets/images/mx-logo.png';
import { commonColors, commonStyles } from '@/styles/common';
import { log } from '@/utils/logger';

const LoginPage: FC = () => {
  const router = useRouter();
  // 监听键盘弹起，避免元素遮挡
  const isKeyboardShow = useKeyboardShow();
  const [isPasswordShow, setPasswordVisibility] = useState<boolean>(false);
  const currentStyle = useVisualScheme(state => state.currentStyle);
  const [loginTriggered, setLoginTriggered] = useState<boolean>(false);
  const [privacyChecked, setPrivacyChecked] = useState<boolean>(false);

  const [studentId, setStudentId] = useState(
    useUserStore(state => state.student_id)
  );
  const [password, setPassword] = useState('');
  // use custom axios instance to avoid global error handler
  const request = axios.create({
    baseURL: Constants.expoConfig?.extra?.EXPO_PUBLIC_API_URL,
    adapter: axios.defaults.adapter,
  });
  const handleViewPassword = () => {
    setPasswordVisibility(!isPasswordShow);
  };
  const handleLogin = async () => {
    setLoginTriggered(true);

    if (!studentId || !password) {
      Toast.fail('请输入账号密码', 2);
      setLoginTriggered(false);
      return;
    }
    if (!privacyChecked) {
      Toast.fail('请先阅读隐私条例', 2);
      setLoginTriggered(false);
      return;
    }

    try {
      const payload = { student_id: studentId, password };
      const response = await request.post('/users/login_ccnu', payload, {
        isToken: false,
      });
      if (response.status === 200 || response.status === 201) {
        //  console.log(response.headers);
        useUserStore.setState({
          student_id: studentId,
          password: password,
        });
        setItem('shortToken', response.headers['x-jwt-token']);
        setItem('longToken', response.headers['x-refresh-token']);
        router.navigate('/(tabs)');
      }
    } catch (error) {
      if (error instanceof AxiosError && error.response?.status === 401) {
        Toast.fail('账号密码有误', 2);
      }
      log.error('注册请求失败:', error);
    }
    setLoginTriggered(false);
  };
  const onCheckPrivacy = (e: OnChangeParams) => {
    setPrivacyChecked(e.target.checked);
  };
  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={0}
      style={{ flex: 1 }}
    >
      <AnimatedFade direction="vertical" distance={16} style={[styles.form]}>
        <Image
          source={MXLogo as unknown as ImageSourcePropType}
          style={styles.logo}
        ></Image>
        <AnimatedOpacity toVisible={!isKeyboardShow}>
          <Text
            style={[
              commonStyles.fontExtraLarge,
              commonStyles.fontBold,
              styles.auth,
            ]}
          >
            统一身份认证
          </Text>
        </AnimatedOpacity>
        <Input
          style={styles.input}
          /* 加上前后缀，与下方Input对齐 */
          prefix={<View style={styles.suffixStyle}></View>}
          suffix={<View style={styles.suffixStyle}></View>}
          placeholder="请输入学号"
          value={studentId}
          onChangeText={text => setStudentId(text.toString())}
          placeholderTextColor={styles.textColor.color}
          textAlign="center"
        ></Input>

        <Input
          style={styles.input}
          placeholderTextColor={styles.textColor.color}
          textAlign="center"
          /* 前后缀都要有，不然对不齐 */
          prefix={<View style={styles.suffixStyle}></View>}
          value={password}
          onChangeText={text => setPassword(text.toString())}
          type={isPasswordShow ? 'text' : 'password'}
          suffix={
            <Icon
              name={isPasswordShow ? 'eye' : 'eye-invisible'}
              style={styles.suffixStyle}
              color={styles.textColor.color}
              size="xs"
              onPress={handleViewPassword}
            ></Icon>
          }
          placeholder="请输入教务系统密码"
        ></Input>
        <View style={styles.rules}>
          <Checkbox checked={privacyChecked} onChange={onCheckPrivacy}>
            <Text style={styles.rules_radio}>
              已阅读并同意
              <Text
                style={{
                  color: commonColors.purple,
                }}
                onPress={() => {
                  router.push('/(setting)/agreement');
                  Modal.clear();
                }}
              >
                《用户协议》
              </Text>
              和
              <Text
                style={{
                  color: commonColors.purple,
                }}
                onPress={() => {
                  router.push('/(setting)/privacy');
                  Modal.clear();
                }}
              >
                《隐私政策》
              </Text>
            </Text>
          </Checkbox>
        </View>
        <Button
          onPress={handleLogin}
          isLoading={loginTriggered}
          style={[styles.login_button, currentStyle?.button_style]}
        >
          登录
        </Button>
      </AnimatedFade>
    </KeyboardAvoidingView>
  );
};

export default LoginPage;

export const styles = StyleSheet.create({
  auth: {
    color: 'white',
  },
  logo: {
    width: 130,
    height: 130,
    alignSelf: 'center',
    borderRadius: 25,
    marginBottom: 10,
    marginTop: 80,
  },
  divider: {
    position: 'absolute',
    bottom: 10,
    color: 'white',
    fontSize: 20,
  },
  input: {
    width: '80%',
    height: 40,
    marginTop: 20,
    backgroundColor: '#C2D4FF',
    borderRadius: 15,
    paddingHorizontal: 8,
    textAlign: 'center',
  },
  login_button: {
    width: '50%',
    borderRadius: 12,
    marginTop: 20,
  },
  rules: {
    width: '80%',
    display: 'flex',
    marginTop: 20,
  },
  rules_radio: {
    color: '#DDDDDD',
    fontSize: 15,
  },
  link: {
    color: '#26DAFD',
  },
  form: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 2,
  },
  suffixStyle: {
    width: 20,
    height: 20,
  },
  textColor: {
    color: '#80899E',
  },
});
