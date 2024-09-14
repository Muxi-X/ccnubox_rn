import { Icon, Input, Checkbox, Button, Toast } from '@ant-design/react-native';
import { OnChangeParams } from '@ant-design/react-native/es/checkbox/PropsType';
import { LinearGradient } from 'expo-linear-gradient';
import { Link } from 'expo-router';
import { FC, useState } from 'react';
import {
  StyleSheet,
  Text,
  View,
  KeyboardAvoidingView,
  Platform,
  Image,
} from 'react-native';

import AnimatedFade from '@/components/animatedView/AnimatedFade';
import AnimatedOpacity from '@/components/animatedView/AnimatedOpacity';
import Divider from '@/components/divider';
import { useKeyboardShow } from '@/hooks/useKeyboardShow';
import useVisualScheme from '@/store/visualScheme';
import { commonStyles } from '@/styles/common';
import axiosInstance from '@/request/interceptor';

const Login: FC = () => {
  // 监听键盘弹起，避免元素遮挡
  const isKeyboardShow = useKeyboardShow();
  const [isPasswordShow, setPasswordVisibility] = useState<boolean>(false);
  const currentStyle = useVisualScheme(state => state.currentStyle);
  const [loginTriggered, setLoginTriggered] = useState<boolean>(false);
  const [privacyChecked, setPrivacyChecked] = useState<boolean>(false);
  const handleViewPassword = () => {
    setPasswordVisibility(!isPasswordShow);
  };
  const handleLogin = () => {
    if (!privacyChecked) {
      Toast.fail('请先阅读隐私条例');
      return;
    }
    setLoginTriggered(true);
    setTimeout(() => {
      setLoginTriggered(false);
    }, 3000);
  };
  const onCheckPrivacy = (e: OnChangeParams) => {
    setPrivacyChecked(e.target.checked);
  };
  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={{ flex: 1 }}
    >
      <LinearGradient colors={['#7B6EF1', '#7FB4FB']} style={styles.bg}>
        <AnimatedFade
          direction="vertical"
          distance={20}
          toVisible={!isKeyboardShow}
        >
          <Text style={[styles.text1, commonStyles.fontExtraLarge]}>
            “需求太多？
          </Text>
          <Text style={[styles.text2, commonStyles.fontExtraLarge]}>
            用匣子试试！”
          </Text>
        </AnimatedFade>
        <View style={[styles.form]}>
          <Image
            source={require('../assets/images/mx-logo.png')}
            style={styles.logo}
          ></Image>
          <AnimatedOpacity toVisible={!isKeyboardShow}>
            <Text style={[commonStyles.fontExtraLarge, styles.text3]}>
              统一身份认证
            </Text>
          </AnimatedOpacity>
          <Input
            style={styles.input}
            /* 加上前后缀，与下方Input对齐 */
            prefix={<View style={styles.suffixStyle}></View>}
            suffix={<View style={styles.suffixStyle}></View>}
            placeholder="请输入学号"
            placeholderTextColor={styles.textColor.color}
            textAlign="center"
          ></Input>
          <Input
            style={styles.input}
            placeholderTextColor={styles.textColor.color}
            textAlign="center"
            /* 前后缀都要有，不然对不齐 */
            prefix={<View style={styles.suffixStyle}></View>}
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
            placeholder="请输入密码"
          ></Input>
          <View style={styles.rules}>
            <Checkbox onChange={onCheckPrivacy}>
              <Text style={styles.rules_radio}>
                已阅读并同意{' '}
                <Link href="/login" style={styles.link}>
                  服务协议
                </Link>
              </Text>
            </Checkbox>
          </View>
          <Button
            type="primary"
            activeStyle={false}
            onPress={handleLogin}
            loading={loginTriggered}
            style={[styles.login_button, currentStyle?.button_style]}
            disabled={loginTriggered}
          >
            登陆
          </Button>
          {/* 脚注 */}
          <View
            style={[
              styles.divider,
              { display: isKeyboardShow ? 'none' : 'flex' },
            ]}
          >
            <Divider>木犀团队出品</Divider>
          </View>
        </View>
      </LinearGradient>
    </KeyboardAvoidingView>
  );
};

export default Login;

export const styles = StyleSheet.create({
  bg: {
    width: '100%',
    height: '100%',
    top: 0,
    left: 0,
    zIndex: -1,
  },
  text1: {
    position: 'absolute',
    color: 'white',
    top: 60,
    left: 30,
  },
  text2: {
    position: 'absolute',
    color: 'white',
    top: 100,
    left: 60,
  },
  text3: {
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
