const {
  AndroidConfig,
  withAppBuildGradle,
  withSettingsGradle,
  withAndroidManifest,
  withAppDelegate,
  withPodfile,
  withInfoPlist,
} = require('@expo/config-plugins');

let JPUSH_APPKEY = 'appKey',
  JPUSH_CHANNEL = 'channel';

const withJPush = (config, props) => {
  if (!props || !props.appKey || !props.channel)
    throw new Error('[MX_JPush_Expo] 请传入参数 appKey & channel');
  JPUSH_APPKEY = props.appKey;
  JPUSH_CHANNEL = props.channel;
  config = setInfoPList(config);
  config = setInterface(config);
  config = setAppDelegate(config);
  config = setAndroidManifest(config);
  config = setAppBuildGradle(config);
  config = setSettingsGradle(config);
  config = setPodfilePostInstall(config);
  return config;
};
const setInfoPList = config =>
  withInfoPlist(config, config => {
    config.modResults.UIBackgroundModes = ['fetch', 'remote-notification'];
    return config;
  });
const setPodfilePostInstall = config =>
  withPodfile(config, config => {
    const postInstallScript = `
    installer.pods_project.build_configurations.each do |config|
      config.build_settings["EXCLUDED_ARCHS[sdk=iphonesimulator*]"] = "arm64"
    end
    `;
    const installScript = 'post_install do |installer|';
    const { contents } = config.modResults;
    const installIndex = contents.indexOf(installScript);

    if (
      installIndex === -1 &&
      contents.indexOf(
        'config.build_settings["EXCLUDED_ARCHS[sdk=iphonesimulator*]"] = "arm64"'
      ) === -1
    ) {
      // 如果没有 post_install 且没有 arm64 忽略脚本，则插入
      config.modResults.contents += `
        ${installScript}
        ${postInstallScript}
      `;
    } else if (
      installIndex !== -1 &&
      contents.indexOf(
        'config.build_settings["EXCLUDED_ARCHS[sdk=iphonesimulator*]"] = "arm64"'
      ) === -1
    ) {
      // 如果有 post_install 但没有 arm64 忽略脚本，则在 post_install 后插入
      config.modResults.contents =
        contents.slice(0, installIndex + installScript.length) +
        postInstallScript +
        contents.slice(installIndex + installScript.length);
    } else {
      console.log('[MX_JPush_Expo] post_install 脚本已经存在，跳过添加.');
    }
    return config;
  });
const setInterface = config => {
  return withAppDelegate(config, config => {
    const implementationIndex = config.modResults.contents.indexOf(
      '@implementation AppDelegate'
    );

    if (
      implementationIndex !== -1 &&
      config.modResults.contents.indexOf(
        '@interface AppDelegate ()<JPUSHRegisterDelegate>'
      ) === -1
    ) {
      console.log('\n[MX_JPush_Expo] 配置 AppDelegate interface ... ');
      const injectionCode = `
@interface AppDelegate () <JPUSHRegisterDelegate>
@end
`;
      // 在 @implementation AppDelegate 前插入代码
      const updatedData =
        config.modResults.contents.slice(0, implementationIndex) +
        injectionCode +
        config.modResults.contents.slice(implementationIndex);
      config.modResults.contents = updatedData;
    }
    if (implementationIndex === -1) {
      console.error('未找到 @implementation AppDelegate');
    }
    return config;
  });
};

// 配置 iOS AppDelegate
const setAppDelegate = config =>
  withAppDelegate(config, config => {
    if (
      config.modResults.contents.indexOf(
        '#import <UserNotifications/UserNotifications.h>'
      ) === -1
    ) {
      console.log('\n[MX_JPush_Expo] 配置 AppDelegate import ... ');
      config.modResults.contents =
        `#import "AppDelegate.h"
#import <UserNotifications/UserNotifications.h>
#import <RCTJPushModule.h>
#import <React/RCTBridge.h>
#import <React/RCTRootView.h>
` + config.modResults.contents;
    }

    if (
      config.modResults.contents.indexOf(
        'JPUSHRegisterEntity * entity = [[JPUSHRegisterEntity alloc] init];'
      ) === -1
    ) {
      console.log(
        '\n[MX_JPush_Expo] 配置 AppDelegate didFinishLaunchingWithOptions ... '
      );
      const didFinishLaunchingWithOptionsResult =
        config.modResults.contents.match(
          /didFinishLaunchingWithOptions([\s\S]*)launchOptions\n\{\n/
        );
      const [didFinishLaunchingWithOptions] =
        didFinishLaunchingWithOptionsResult;
      const didFinishLaunchingWithOptionsIndex =
        didFinishLaunchingWithOptionsResult.index;
      const didFinishLaunchingWithOptionsStartIndex =
        didFinishLaunchingWithOptionsIndex +
        didFinishLaunchingWithOptions.length;
      config.modResults.contents =
        config.modResults.contents.slice(
          0,
          didFinishLaunchingWithOptionsStartIndex
        ) +
        `  // JPush初始化配置
  [JPUSHService setupWithOption:launchOptions appKey:@"${JPUSH_APPKEY}" channel:@"${JPUSH_CHANNEL}" apsForProduction:YES];
  // APNS 注册实体配置
  JPUSHRegisterEntity *entity = [[JPUSHRegisterEntity alloc] init];
  if (@available(iOS 12.0, *)) {
    entity.types = JPAuthorizationOptionAlert | JPAuthorizationOptionBadge | JPAuthorizationOptionSound;
  }
  [JPUSHService registerForRemoteNotificationConfig:entity delegate:self];
  
  // 监听远程通知和响应通知
  NSNotificationCenter *defaultCenter = [NSNotificationCenter defaultCenter];
  [defaultCenter addObserver:self selector:@selector(networkDidReceiveMessage:) name:kJPFNetworkDidReceiveMessageNotification object:nil];

` +
        config.modResults.contents.slice(
          didFinishLaunchingWithOptionsStartIndex
        );
    } else {
      console.log('\n[MX_JPush_Expo] 配置 AppDelegate appKey & channel ... ');
      config.modResults.contents = config.modResults.contents.replace(
        /appKey\:\@\"(.*)\" channel\:\@\"(.*)\" /,
        `appKey:@"${JPUSH_APPKEY}" channel:@"${JPUSH_CHANNEL}" `
      );
    }
    if (
      config.modResults.contents.indexOf(
        'return [super application:application didRegisterForRemoteNotificationsWithDeviceToken:deviceToken];'
      ) > -1
    ) {
      config.modResults.contents = config.modResults.contents.replace(
        'return [super application:application didRegisterForRemoteNotificationsWithDeviceToken:deviceToken];',
        '[JPUSHService registerDeviceToken:deviceToken];'
      );
    }
    if (
      config.modResults.contents.indexOf(
        'return [super application:application didReceiveRemoteNotification:userInfo fetchCompletionHandler:completionHandler];'
      ) > -1
    ) {
      config.modResults.contents = config.modResults.contents.replace(
        'return [super application:application didReceiveRemoteNotification:userInfo fetchCompletionHandler:completionHandler];',
        `
        // iOS 10 以下 Required
        NSLog(@"iOS 7 APNS");
        [JPUSHService handleRemoteNotification:userInfo];
        [[NSNotificationCenter defaultCenter] postNotificationName:J_APNS_NOTIFICATION_ARRIVED_EVENT object:userInfo];
        completionHandler(UIBackgroundFetchResultNewData);
        `
      );
    }
    if (config.modResults.contents.indexOf('JPush start') === -1) {
      console.log('\n[MX_JPush_Expo] 配置 AppDelegate other ... ');
      config.modResults.contents = config.modResults.contents.replace(
        /\@end([\n]*)$/,
        `//************************************************JPush start************************************************

// iOS 10 及以上版本的通知处理
- (void)jpushNotificationCenter:(UNUserNotificationCenter *)center willPresentNotification:(UNNotification *)notification withCompletionHandler:(void (^)(NSInteger))completionHandler {
  NSDictionary * userInfo = notification.request.content.userInfo;
  if([notification.request.trigger isKindOfClass:[UNPushNotificationTrigger class]]) {
    // Apns
    NSLog(@"iOS 10 APNS 前台收到消息");
    [JPUSHService handleRemoteNotification:userInfo];
    [[NSNotificationCenter defaultCenter] postNotificationName:J_APNS_NOTIFICATION_ARRIVED_EVENT object:userInfo];
  }
  else {
    // 本地通知 todo
    NSLog(@"iOS 10 本地通知 前台收到消息");
    [[NSNotificationCenter defaultCenter] postNotificationName:J_LOCAL_NOTIFICATION_ARRIVED_EVENT object:userInfo];
  }
  completionHandler(UNNotificationPresentationOptionAlert);
}

- (void)jpushNotificationCenter:(UNUserNotificationCenter *)center didReceiveNotificationResponse:(UNNotificationResponse *)response withCompletionHandler:(void (^)(void))completionHandler {
  NSDictionary * userInfo = response.notification.request.content.userInfo;
  if([response.notification.request.trigger isKindOfClass:[UNPushNotificationTrigger class]]) {
    // Apns
    NSLog(@"iOS 10 APNS 消息事件回调");
    [JPUSHService handleRemoteNotification:userInfo];
    // 保障应用被杀死状态下，用户点击推送消息，打开app后可以收到点击通知事件
    [[RCTJPushEventQueue sharedInstance]._notificationQueue insertObject:userInfo atIndex:0];
    [[NSNotificationCenter defaultCenter] postNotificationName:J_APNS_NOTIFICATION_OPENED_EVENT object:userInfo];
  }
  else {
    // 本地通知
    NSLog(@"iOS 10 本地通知 消息事件回调");
    // 保障应用被杀死状态下，用户点击推送消息，打开app后可以收到点击通知事件
    [[RCTJPushEventQueue sharedInstance]._localNotificationQueue insertObject:userInfo atIndex:0];
    [[NSNotificationCenter defaultCenter] postNotificationName:J_LOCAL_NOTIFICATION_OPENED_EVENT object:userInfo];
  }
  completionHandler();
}

// 自定义消息
- (void)networkDidReceiveMessage:(NSNotification *)notification {
  NSDictionary * userInfo = [notification userInfo];
  [[NSNotificationCenter defaultCenter] postNotificationName:J_CUSTOM_NOTIFICATION_EVENT object:userInfo];
}

//************************************************JPush end************************************************

@end
`
      );
    }

    return config;
  });

// 配置 Android AndroidManifest
const setAndroidManifest = config =>
  withAndroidManifest(config, config => {
    if (
      AndroidConfig.Manifest.findMetaDataItem(
        config.modResults.manifest.application[0],
        'JPUSH_CHANNEL'
      ) === -1
    ) {
      console.log('\n[MX_JPush_Expo] 配置 AndroidManifest JPUSH_CHANNEL ... ');
      AndroidConfig.Manifest.addMetaDataItemToMainApplication(
        config.modResults.manifest.application[0],
        'JPUSH_CHANNEL',
        '${JPUSH_CHANNEL}'
      );
    }
    if (
      AndroidConfig.Manifest.findMetaDataItem(
        config.modResults.manifest.application[0],
        'JPUSH_APPKEY'
      ) === -1
    ) {
      console.log('\n[MX_JPush_Expo] 配置 AndroidManifest JPUSH_APPKEY ... ');
      AndroidConfig.Manifest.addMetaDataItemToMainApplication(
        config.modResults.manifest.application[0],
        'JPUSH_APPKEY',
        '${JPUSH_APPKEY}'
      );
    }
    return config;
  });

// 配置 Android build.gradle
const setAppBuildGradle = config =>
  withAppBuildGradle(config, config => {
    const defaultConfig = config.modResults.contents.match(
      /defaultConfig([\s\S]*)versionName(.*)\n/
    );
    if (defaultConfig) {
      const [startString] = defaultConfig;
      const startStringLength = startString.length;
      const startStringIndex =
        config.modResults.contents.indexOf(startString) + startStringLength;
      console.log('\n[MX_JPush_Expo] 配置 build.gradle appKey & channel ... ');
      if (config.modResults.contents.indexOf('JPUSH_APPKEY') === -1) {
        config.modResults.contents =
          config.modResults.contents.slice(0, startStringIndex) +
          `        manifestPlaceholders = [
            JPUSH_APPKEY: "${JPUSH_APPKEY}",
            JPUSH_CHANNEL: "${JPUSH_CHANNEL}"
        ]\n` +
          config.modResults.contents.slice(startStringIndex);
      } else {
        config.modResults.contents = config.modResults.contents.replace(
          /manifestPlaceholders([\s\S]*)JPUSH_APPKEY([\s\S]*)JPUSH_CHANNEL(.*)"\n(.*)\]\n/,
          `manifestPlaceholders = [
            JPUSH_APPKEY: "${JPUSH_APPKEY}",
            JPUSH_CHANNEL: "${JPUSH_CHANNEL}"
        ]\n`
        );
      }
    } else
      throw new Error(
        '[MX_JPush_Expo] 无法完成 build.gradle - defaultConfig 配置'
      );
    const dependencies = config.modResults.contents.match(/dependencies {\n/);
    if (dependencies) {
      const [startString] = dependencies;
      const startStringLength = startString.length;
      const startStringIndex =
        config.modResults.contents.indexOf(startString) + startStringLength;
      if (
        config.modResults.contents.indexOf(
          `implementation project(':jpush-react-native')`
        ) === -1
      ) {
        console.log(
          '\n[MX_JPush_Expo] 配置 build.gradle dependencies jpush-react-native ... '
        );
        config.modResults.contents =
          config.modResults.contents.slice(0, startStringIndex) +
          `    implementation project(':jpush-react-native')\n` +
          config.modResults.contents.slice(startStringIndex);
      }
      if (
        config.modResults.contents.indexOf(
          `implementation project(':jcore-react-native')`
        ) === -1
      ) {
        console.log(
          '\n[MX_JPush_Expo] 配置 build.gradle dependencies jcore-react-native ... '
        );
        config.modResults.contents =
          config.modResults.contents.slice(0, startStringIndex) +
          `    implementation project(':jcore-react-native')\n` +
          config.modResults.contents.slice(startStringIndex);
      }
    } else
      throw new Error(
        '[MX_JPush_Expo] 无法完成 build.gradle dependencies 配置'
      );

    return config;
  });

// 配置 Android settings.gradle
const setSettingsGradle = config =>
  withSettingsGradle(config, config => {
    if (
      config.modResults.contents.indexOf(`include ':jpush-react-native'`) === -1
    ) {
      console.log(
        '\n[MX_JPush_Expo] 配置 settings.gradle include jpush-react-native ... '
      );
      config.modResults.contents =
        config.modResults.contents +
        `
include ':jpush-react-native'
project(':jpush-react-native').projectDir = new File(rootProject.projectDir, '../node_modules/jpush-react-native/android')`;
    }
    if (
      config.modResults.contents.indexOf(`include ':jcore-react-native'`) === -1
    ) {
      console.log(
        '\n[MX_JPush_Expo] 配置 settings.gradle include jcore-react-native ... '
      );
      config.modResults.contents =
        config.modResults.contents +
        `
include ':jcore-react-native'
project(':jcore-react-native').projectDir = new File(rootProject.projectDir, '../node_modules/jcore-react-native/android')`;
    }

    return config;
  });

module.exports = withJPush;
