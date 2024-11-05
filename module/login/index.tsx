import { Icon, Input, Checkbox, Toast } from '@ant-design/react-native';
import { OnChangeParams } from '@ant-design/react-native/es/checkbox/PropsType';
import { FC, useState } from 'react';
import { StyleSheet, Text, View, Image } from 'react-native';

import AnimatedFade from '@/components/animatedView/AnimatedFade';
import AnimatedOpacity from '@/components/animatedView/AnimatedOpacity';
import Button from '@/components/button';
import { useKeyboardShow } from '@/hooks/useKeyboardShow';
import useVisualScheme from '@/store/visualScheme';
import { commonStyles } from '@/styles/common';

const LoginPage: FC = () => {
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
    <AnimatedFade direction="vertical" distance={16} style={[styles.form]}>
      <Image
        source={require('../../assets/images/mx-logo.png')}
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
            已阅读并同意 <Text style={styles.link}>服务协议</Text>
          </Text>
        </Checkbox>
      </View>
      <Button
        onPress={handleLogin}
        isLoading={loginTriggered}
        style={[styles.login_button, currentStyle?.button_style]}
      >
        登陆
      </Button>
    </AnimatedFade>
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
