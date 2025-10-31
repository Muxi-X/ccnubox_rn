import { Input } from '@ant-design/react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter } from 'expo-router';
import { deleteItemAsync } from 'expo-secure-store';
import { useMemo, useState } from 'react';
import {
  Image,
  type ImageSourcePropType,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  Text,
  View,
} from 'react-native';

import Button from '@/components/button';
import Modal from '@/components/modal';

import useUserStore from '@/store/user';

import logo from '@/assets/images/mx-logo.png';
import { deactivate } from '@/request/api/auth';
import { commonColors, commonStyles } from '@/styles/common';

function SignOff() {
  const router = useRouter();
  const [account, setAccount] = useState(
    useUserStore(state => state.student_id)
  );
  const [password, setPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const isValid = useMemo(
    () => account.trim().length > 0 && password.length > 0,
    [account, password]
  );

  const handleSubmit = () => {
    if (!isValid || isSubmitting) return;
    Modal.show({
      title: '确认注销',
      children: '此操作将永久注销该账户且不可恢复，是否继续？',
      onConfirm: async () => {
        setIsSubmitting(true);
        try {
          deactivate(password)
            .then(() => {
              Promise.all([
                AsyncStorage.multiRemove(['courses']),
                deleteItemAsync('longToken'),
                deleteItemAsync('shortToken'),
                deleteItemAsync('user'),
              ]);
            })
            .finally(() => router.replace('/auth/login'));
        } finally {
          setIsSubmitting(false);
        }
      },
      onCancel: () => {},
      mode: 'middle',
    });
  };

  return (
    <View style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{ flex: 1 }}
      >
        <View style={styles.form}>
          <Image
            source={logo as unknown as ImageSourcePropType}
            style={styles.logo}
          />
          <Text
            style={[
              commonStyles.fontLarge,
              commonStyles.fontExtraBold,
              styles.headerText,
            ]}
          >
            注销账户
          </Text>
          <Text style={[styles.description]}>
            注销后，您的账户与相关数据将从匣子中删除，且不可恢复。请谨慎操作，并输入账户与密码以确认。
          </Text>
          <Input
            style={styles.input}
            placeholder="请输入学号/账号"
            value={account}
            onChangeText={text => setAccount(text.toString())}
            placeholderTextColor={styles.textColor.color}
            textAlign="center"
            disabled
          />
          <Input
            style={styles.input}
            placeholderTextColor={styles.textColor.color}
            textAlign="center"
            value={password}
            onChangeText={text => setPassword(text.toString())}
            type="password"
            placeholder="请输入密码"
          />
          <Button
            onPress={handleSubmit}
            isLoading={isSubmitting}
            style={styles.submitButton}
          >
            确认注销
          </Button>
        </View>
      </KeyboardAvoidingView>
    </View>
  );
}
export default SignOff;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: commonColors.purple as string,
  },
  form: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 20,
  },
  logo: {
    width: 120,
    height: 120,
    borderRadius: 24,
    marginTop: 40,
    marginBottom: 8,
  },
  headerText: {
    color: '#fff',
  },
  description: {
    width: '80%',
    textAlign: 'center',
    color: '#EDEBFF',
    marginTop: 8,
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
  submitButton: {
    width: '50%',
    borderRadius: 12,
    marginTop: 20,
  },
  suffixStyle: {
    width: 20,
    height: 20,
  },
  textColor: {
    color: '#80899E',
  },
});
