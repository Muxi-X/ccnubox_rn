
#ifdef NSFoundationVersionNumber_iOS_9_x_Max
#import <UserNotifications/UserNotifications.h>
#endif

#import "AppDelegate.h"

#import <React/RCTBundleURLProvider.h>
#import <React/RCTLinkingManager.h>

@implementation AppDelegate

- (BOOL)application:(UIApplication *)application didFinishLaunchingWithOptions:(NSDictionary *)launchOptions
{
  // JPush初始化配置
  [JPUSHService setupWithOption:launchOptions appKey:@"3fdd1ecdd0325fa2a197df7e" channel:@"course_box" apsForProduction:YES];
  // APNS
  JPUSHRegisterEntity * entity = [[JPUSHRegisterEntity alloc] init];
  if (@available(iOS 12.0, *)) {
    entity.types = JPAuthorizationOptionAlert|JPAuthorizationOptionBadge|JPAuthorizationOptionSound|JPAuthorizationOptionProvidesAppNotificationSettings;
  }
  [JPUSHService registerForRemoteNotificationConfig:entity delegate:self];
  [launchOptions objectForKey: UIApplicationLaunchOptionsRemoteNotificationKey];
  // 自定义消息
  NSNotificationCenter *defaultCenter = [NSNotificationCenter defaultCenter];
  [defaultCenter addObserver:self selector:@selector(networkDidReceiveMessage:) name:kJPFNetworkDidReceiveMessageNotification object:nil];
  // 地理围栏
  [JPUSHService registerLbsGeofenceDelegate:self withLaunchOptions:launchOptions];
#if defined(FB_SONARKIT_ENABLED) && __has_include(<FlipperKit/FlipperClient.h>)
  InitializeFlipper(application);
#endif
  self.moduleName = @"main";

  // You can add your custom initial props in the dictionary below.
  // They will be passed down to the ViewController used by React Native.
  self.initialProps = @{};

  return [super application:application didFinishLaunchingWithOptions:launchOptions];
}

- (NSURL *)sourceURLForBridge:(RCTBridge *)bridge
{
  return [self bundleURL];
}

- (NSURL *)bundleURL
{
#if DEBUG
  return [[RCTBundleURLProvider sharedSettings] jsBundleURLForBundleRoot:@".expo/.virtual-metro-entry"];
#else
  return [[NSBundle mainBundle] URLForResource:@"main" withExtension:@"jsbundle"];
#endif
}

// Linking API
- (BOOL)application:(UIApplication *)application openURL:(NSURL *)url options:(NSDictionary<UIApplicationOpenURLOptionsKey,id> *)options {
  return [super application:application openURL:url options:options] || [RCTLinkingManager application:application openURL:url options:options];
}

// Universal Links
- (BOOL)application:(UIApplication *)application continueUserActivity:(nonnull NSUserActivity *)userActivity restorationHandler:(nonnull void (^)(NSArray<id<UIUserActivityRestoring>> * _Nullable))restorationHandler {
  BOOL result = [RCTLinkingManager application:application continueUserActivity:userActivity restorationHandler:restorationHandler];
  return [super application:application continueUserActivity:userActivity restorationHandler:restorationHandler] || result;
}

// Explicitly define remote notification delegates to ensure compatibility with some third-party libraries
- (void)application:(UIApplication *)application didRegisterForRemoteNotificationsWithDeviceToken:(NSData *)deviceToken
{
  [JPUSHService registerDeviceToken:deviceToken];
}

// Explicitly define remote notification delegates to ensure compatibility with some third-party libraries
- (void)application:(UIApplication *)application didFailToRegisterForRemoteNotificationsWithError:(NSError *)error
{
  return [super application:application didFailToRegisterForRemoteNotificationsWithError:error];
}

// Explicitly define remote notification delegates to ensure compatibility with some third-party libraries
- (void)application:(UIApplication *)application didReceiveRemoteNotification:(NSDictionary *)userInfo fetchCompletionHandler:(void (^)(UIBackgroundFetchResult))completionHandler
{
  
      // iOS 10 以下 Required
      NSLog(@"iOS 7 APNS");
      [JPUSHService handleRemoteNotification:userInfo];
      [[NSNotificationCenter defaultCenter] postNotificationName:J_APNS_NOTIFICATION_ARRIVED_EVENT object:userInfo];
      completionHandler(UIBackgroundFetchResultNewData);
      
}

//************************************************JPush start************************************************

        // //注册 APNS 成功并上报 DeviceToken
        // - (void)application:(UIApplication *)application didRegisterForRemoteNotificationsWithDeviceToken:(NSData *)deviceToken {
        //   [JPUSHService registerDeviceToken:deviceToken];
        // }
        
        // //iOS 7 APNS
        // - (void)application:(UIApplication *)application didReceiveRemoteNotification:  (NSDictionary *)userInfo fetchCompletionHandler:(void (^)(UIBackgroundFetchResult))completionHandler {
        //   // iOS 10 以下 Required
        //   NSLog(@"iOS 7 APNS");
        //   [JPUSHService handleRemoteNotification:userInfo];
        //   [[NSNotificationCenter defaultCenter] postNotificationName:J_APNS_NOTIFICATION_ARRIVED_EVENT object:userInfo];
        //   completionHandler(UIBackgroundFetchResultNewData);
        // }
        
        //iOS 10 前台收到消息
        - (void)jpushNotificationCenter:(UNUserNotificationCenter *)center  willPresentNotification:(UNNotification *)notification withCompletionHandler:(void (^)(NSInteger))completionHandler {
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
          //需要执行这个方法，选择是否提醒用户，有 Badge、Sound、Alert 三种类型可以选择设置
          completionHandler(UNNotificationPresentationOptionAlert);
        }
        
        //iOS 10 消息事件回调
        - (void)jpushNotificationCenter:(UNUserNotificationCenter *)center didReceiveNotificationResponse:(UNNotificationResponse *)response withCompletionHandler: (void (^)(void))completionHandler {
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
          // 系统要求执行这个方法
          completionHandler();
        }
        
        //自定义消息
        - (void)networkDidReceiveMessage:(NSNotification *)notification {
          NSDictionary * userInfo = [notification userInfo];
          [[NSNotificationCenter defaultCenter] postNotificationName:J_CUSTOM_NOTIFICATION_EVENT object:userInfo];
        }
        
        //************************************************JPush end************************************************

@end
