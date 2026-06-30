import { Icon } from '@ant-design/react-native';
import { File as ExpoFile, Paths } from 'expo-file-system';
import * as React from 'react';
import {
  ActivityIndicator,
  Platform,
  StyleSheet,
  useWindowDimensions,
} from 'react-native';
import { Dropdown } from 'react-native-element-dropdown';
import PdfRendererView from 'react-native-pdf-renderer';
import { WebView } from 'react-native-webview';

import Text from '@/components/text';
import View from '@/components/view';

import useVisualScheme from '@/store/visualScheme';

import queryCalendars from '@/request/api/queryCalendars';
import { commonColors } from '@/styles/common';

type CalendarItem = { label: string; value: number };

export default function Calendar() {
  const { width } = useWindowDimensions();
  const currentStyle = useVisualScheme(state => state.currentStyle);
  const [years, setYears] = React.useState<CalendarItem[]>([]);
  const [links, setLinks] = React.useState<Record<number, string>>({});
  const [selectedYear, setSelectedYear] = React.useState<number | null>(null);
  const [loading, setLoading] = React.useState(true);
  const [isFocus, setIsFocus] = React.useState(false);

  React.useEffect(() => {
    queryCalendars()
      .then(res => {
        const raw = res.data?.calendars ?? [];
        const linkMap: Record<number, string> = {};
        raw.forEach(c => {
          if (c.year != null && c.link) linkMap[c.year] = c.link;
        });
        setLinks(linkMap);

        const list = Object.keys(linkMap)
          .map(Number)
          .sort((a, b) => b - a)
          .map(y => ({ label: `${y}～${y + 1} 学年`, value: y }));
        setYears(list);
        if (list.length > 0) setSelectedYear(list[0].value);
      })
      .finally(() => setLoading(false));
  }, []);

  // 主题色
  const bgColor = currentStyle?.background_style?.backgroundColor ?? '#fff';
  const textColor = currentStyle?.text_style?.color ?? '#333';
  const placeholderColor =
    currentStyle?.placeholder_text_style?.color ?? '#999';
  const borderColor =
    currentStyle?.schedule_border_style?.borderColor ?? '#E0E0E0';
  const accentColor = commonColors.purple ?? '#7B71F1';

  const dropdownStyle = React.useMemo(
    () => ({
      height: 50,
      borderWidth: 0.5,
      borderRadius: 8,
      paddingHorizontal: 16,
      backgroundColor: bgColor,
      borderColor: isFocus ? accentColor : borderColor,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.1,
      shadowRadius: 2,
      elevation: 2,
    }),
    [bgColor, borderColor, accentColor, isFocus]
  );

  const dropdownContainerStyle = React.useMemo(
    () => ({
      marginTop: 4,
      borderRadius: 8,
      backgroundColor: bgColor,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.15,
      shadowRadius: 2,
      elevation: 3,
    }),
    [bgColor]
  );

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={accentColor} />
        <Text style={[styles.loadingText, { color: textColor }]}>
          加载中...
        </Text>
      </View>
    );
  }

  return (
    <View style={[styles.wrapper, { backgroundColor: bgColor }]}>
      <View style={styles.dropdownWrap}>
        {(selectedYear != null || isFocus) && (
          <Text
            style={[
              styles.label,
              {
                backgroundColor: bgColor,
                color: isFocus ? accentColor : placeholderColor,
              },
            ]}
          >
            选择学年
          </Text>
        )}
        <Dropdown
          style={dropdownStyle}
          containerStyle={dropdownContainerStyle}
          placeholderStyle={{ color: placeholderColor }}
          selectedTextStyle={{ fontSize: 16, color: textColor }}
          iconColor={placeholderColor.toString()}
          data={years}
          labelField="label"
          valueField="value"
          value={selectedYear}
          showsVerticalScrollIndicator={false}
          flatListProps={{
            extraData: { textColor, accentColor, bgColor },
            contentContainerStyle: { marginHorizontal: 4 },
          }}
          renderItem={(item, selected) => (
            <View
              style={[
                itemStyles.wrapper,
                { backgroundColor: selected ? accentColor : bgColor },
              ]}
            >
              <Text style={[itemStyles.text, { color: textColor }]}>
                {item.label}
              </Text>
            </View>
          )}
          onFocus={() => setIsFocus(true)}
          onBlur={() => setIsFocus(false)}
          onChange={item => {
            setSelectedYear(item.value);
            setIsFocus(false);
          }}
          placeholder={!isFocus ? '选择学年' : '...'}
          maxHeight={150}
          autoScroll={false}
          renderRightIcon={() => (
            <Icon
              name={isFocus ? 'caret-down' : 'caret-right'}
              size={25}
              color={accentColor}
            />
          )}
        />
      </View>
      {selectedYear && links[selectedYear] ? (
        Platform.select({
          ios: (
            <WebView
              style={[styles.webview, { width }]}
              source={{ uri: links[selectedYear], cache: true }}
              scalesPageToFit
              javaScriptEnabled
              domStorageEnabled
            />
          ),
          android: (
            <AndroidCalendarView
              url={links[selectedYear]}
              year={selectedYear}
            />
          ),
        })
      ) : (
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>暂无校历数据</Text>
        </View>
      )}
    </View>
  );
}

// Android: 下载 PDF 到本地后用 PdfRendererView 渲染
const AndroidCalendarView: React.FC<{ url: string; year: number }> = ({
  url,
  year,
}) => {
  const [downloading, setDownloading] = React.useState(true);
  const [source, setSource] = React.useState<string>();

  React.useEffect(() => {
    const localFile = new ExpoFile(Paths.document, `calendar_${year}.pdf`);

    if (localFile.exists) {
      setSource(localFile.uri);
      setDownloading(false);
      return;
    }

    ExpoFile.downloadFileAsync(url, localFile)
      .then(file => setSource(file.uri))
      .finally(() => setDownloading(false));
  }, [url, year]);

  if (downloading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#7878F8" />
        <Text style={styles.loadingText}>加载中...</Text>
      </View>
    );
  }

  return <PdfRendererView source={source} />;
};

const styles = StyleSheet.create({
  wrapper: {
    flex: 1,
  },
  dropdownWrap: {
    marginHorizontal: 16,
    marginTop: 16,
    marginBottom: 8,
  },
  label: {
    position: 'absolute',
    left: 10,
    top: -10,
    zIndex: 999,
    paddingHorizontal: 6,
    fontSize: 13,
  },
  webview: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 16,
    paddingVertical: 10,
  },
});

const itemStyles = StyleSheet.create({
  wrapper: {
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  text: {
    fontSize: 16,
  },
});
