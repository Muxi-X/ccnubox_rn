import { FC, ReactElement } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';

import MuxiSvg from '@/assets/images/muxi.svg';
import { commonStyles } from '@/styles/common';
import { keyGenerator } from '@/utils';

export const GuideContent: FC<{
  texts: string[];
  extraNodes?: ReactElement;
}> = ({ texts, extraNodes }) => {
  return (
    <ScrollView
      contentContainerStyle={styles.contentWrap}
      showsVerticalScrollIndicator={true}
    >
      {texts.map(text => (
        <Text
          style={[
            commonStyles.fontMedium,
            commonStyles.fontBold,
            styles.textStyle,
          ]}
          key={keyGenerator.next().value as unknown as number}
        >
          {text}
        </Text>
      ))}
      {extraNodes ?? <View></View>}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  contentWrap: {
    display: 'flex',
    width: '100%',
    // flex: 1,
    height: 'auto',
    alignItems: 'center',
  },
  textStyle: {
    color: '#fff',
    marginVertical: 8,
  },
  logo: {
    paddingVertical: 80,
  },
});

export const GUIDE_CONTENTS: { title: string; content: ReactElement }[] = [
  {
    title: '木犀团队',
    content: (
      <GuideContent
        texts={[
          '木犀团队成立于2014年',
          '是华师首个由学生',
          '自主创建并运营的',
          '互联网技术团队',
          '也是i华大的五大中心之一',
          '分管本科生院学工部的',
          '“网络技术中心”',
        ]}
        extraNodes={<MuxiSvg width={80} height={80} style={styles.logo} />}
      />
    ),
  },
  {
    title: '华师匣子',
    content: (
      <GuideContent
        texts={[
          '服务华师全校同学的',
          '校园类APP',
          '简单实用 页面简洁',
          '在华师广泛传播',
          '软件下载量上万',
          '用户日活动最多达5000人',
          '功能涵盖',
          '成绩查询&学分绩计算',
          '课表查询&校园卡消费',
          '校园通知&图书馆预约',
        ]}
      />
    ),
  },
  {
    title: '美好生活',
    content: (
      <GuideContent
        texts={[
          '祝愿你在未来的大学生活中',
          '能发现自己的热爱',
          '乐此不疲',
          '遇见属于自己的美好',
          '刻骨铭心',
          '在漫天星光的操场夜跑',
          '在树林的咖啡馆前听歌',
          '在路灯下的座椅和朋友一起',
          '聊一聊最近的新鲜事',
          '充满活力过每一天',
        ]}
      />
    ),
  },
];
