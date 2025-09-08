import { useRouter } from 'expo-router';
import { Pressable, StyleSheet, Text, TextInput, View } from 'react-native';

export default function Form() {
  const router = useRouter();
  return (
    <View>
      <View style={styles.inputBox}>
        <Text style={[styles.inputText, { marginRight: 60 }]}>主题:</Text>
        <TextInput
          style={styles.input}
          placeholder="请填写研讨主题"
        ></TextInput>
      </View>
      <View style={styles.inputBox}>
        <Text style={[styles.inputText, { marginRight: 60 }]}>成员:</Text>
        <Pressable
          style={styles.input}
          onPress={() => router.push('/(library)/addMember')}
        >
          <Text style={{ lineHeight: 30, color: '#B3B3B3' }}>请添加成员</Text>
        </Pressable>
      </View>
      <View style={styles.inputBox}>
        <Text style={styles.inputText}>申请说明:</Text>
        <TextInput style={styles.input} placeholder="请填写说明"></TextInput>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  input: {
    borderWidth: 1,
    width: '70%',
    height: 35,
    borderColor: '#D4B8FE',
    backgroundColor: '#F9EFFF',
    borderRadius: 10,
    paddingLeft: 10,
    lineHeight: 20,
  },
  inputBox: {
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 10,
  },
  inputText: {
    fontSize: 18,
    marginRight: 24,
  },
});
