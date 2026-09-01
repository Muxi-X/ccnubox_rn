import {
  AnyJSBundleProvider,
  MetroJSBundleProvider,
  RNApp,
  RNOHErrorDialog,
  ResourceJSBundleProvider,
  RNOHCoreContext
} from '@rnoh/react-native-openharmony';
import { getRNOHPackages } from '../PackageProvider';

@Entry
@Component
struct Index {
  @StorageLink('RNOHCoreContext') private rnohCoreContext: RNOHCoreContext | undefined = undefined

  build() {
    Column() {
      if (this.rnohCoreContext) {
        if (this.rnohCoreContext?.isDebugModeEnabled) {
          RNOHErrorDialog({ ctx: this.rnohCoreContext })
        }
        RNApp({
          rnInstanceConfig: {
            name: 'ccnubox',
            createRNPackages: getRNOHPackages,
            fontResourceByFontFamily: {
              antoutline: $rawfile('assets/node_modules/@ant-design/icons-react-native/fonts/antoutline.ttf'),
              MaterialIcons: $rawfile('assets/node_modules/@expo/vector-icons/build/vendor/react-native-vector-icons/Fonts/MaterialIcons.ttf'),
              Ionicons: $rawfile('assets/node_modules/@expo/vector-icons/build/vendor/react-native-vector-icons/Fonts/Ionicons.ttf'),
            },
            enableDebugger: this.rnohCoreContext?.isDebugModeEnabled,
          },
          appKey: 'ccnubox',
          jsBundleProvider: this.rnohCoreContext?.isDebugModeEnabled
            ? new AnyJSBundleProvider([
                new MetroJSBundleProvider(),
                new ResourceJSBundleProvider(this.rnohCoreContext.uiAbilityContext.resourceManager, 'bundle.harmony.js'),
              ])
            : new ResourceJSBundleProvider(this.rnohCoreContext.uiAbilityContext.resourceManager, 'bundle.harmony.js'),
        })
      }
    }
    .height('100%')
    .width('100%')
    .expandSafeArea([SafeAreaType.SYSTEM], [SafeAreaEdge.TOP, SafeAreaEdge.BOTTOM])
  }
}
