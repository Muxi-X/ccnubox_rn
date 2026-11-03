import { BrowserPage } from '@react-native-ohos/react-native-inappbrowser-reborn';

@Entry
@Component
struct BrowserManagerPage {
  build() {
    Column() {
      BrowserPage()
    }
    .height('100%')
    .width('100%')
  }
}
