import Expo
import React
// @generated begin jpush-swift-import-usernotifications - expo prebuild (DO NOT MODIFY) sync-768cde893f7334c1cbf88f4f0a878cfb3548fdbe
import UserNotifications
// @generated end jpush-swift-import-usernotifications
import ReactAppDependencyProvider

@UIApplicationMain
public class AppDelegate: ExpoAppDelegate {
  var window: UIWindow?

  var reactNativeDelegate: ExpoReactNativeFactoryDelegate?
  var reactNativeFactory: RCTReactNativeFactory?

  public override func application(
    _ application: UIApplication,
    didFinishLaunchingWithOptions launchOptions: [UIApplication.LaunchOptionsKey: Any]? = nil
  ) -> Bool {
    let delegate = ReactNativeDelegate()
    let factory = ExpoReactNativeFactory(delegate: delegate)
    delegate.dependencyProvider = RCTAppDependencyProvider()

    reactNativeDelegate = delegate
    reactNativeFactory = factory
    bindReactNativeFactory(factory)

    JPushColdStartBridge.cacheLaunchNotification(launchOptions)

#if os(iOS) || os(tvOS)
    window = UIWindow(frame: UIScreen.main.bounds)
    factory.startReactNative(
      withModuleName: "main",
      in: window,
      launchOptions: launchOptions)
#endif
// @generated begin jpush-swift-initialization - expo prebuild (DO NOT MODIFY) sync-be636fbaef0caa94830f8b05ca2979ca5cfab2f8

    // JPush 注册配置
    let entity = JPUSHRegisterEntity()
    if #available(iOS 12.0, *) {
      entity.types = Int(UNAuthorizationOptions.alert.rawValue |
                        UNAuthorizationOptions.sound.rawValue |
                        UNAuthorizationOptions.badge.rawValue |
                        UNAuthorizationOptions.provisional.rawValue)
    } else {
      entity.types = Int(UNAuthorizationOptions.alert.rawValue |
                        UNAuthorizationOptions.sound.rawValue |
                        UNAuthorizationOptions.badge.rawValue)
    }
    JPUSHService.register(forRemoteNotificationConfig: entity, delegate: self)

    // 开启调试模式
    JPUSHService.setDebugMode()

    let appKey = Bundle.main.object(forInfoDictionaryKey: "JPUSH_APPKEY") as? String ?? ""
    let channel = Bundle.main.object(forInfoDictionaryKey: "JPUSH_CHANNEL") as? String ?? ""
    let apsForProduction =
      (Bundle.main.object(forInfoDictionaryKey: "JPUSH_APS_FOR_PRODUCTION") as? NSNumber)?.boolValue ?? false

    // 初始化 JPush
    JPUSHService.setup(withOption: launchOptions,
                       appKey: appKey,
                       channel: channel,
                       apsForProduction: apsForProduction)

    // 监听自定义消息
    NotificationCenter.default.addObserver(
      self,
      selector: #selector(self.networkDidReceiveMessage(_:)),
      name: NSNotification.Name.jpfNetworkDidReceiveMessage,
      object: nil
    )

// @generated end jpush-swift-initialization

    return super.application(application, didFinishLaunchingWithOptions: launchOptions)
  }

  // Linking API
  public override func application(
    _ app: UIApplication,
    open url: URL,
    options: [UIApplication.OpenURLOptionsKey: Any] = [:]
  ) -> Bool {
    return super.application(app, open: url, options: options) || RCTLinkingManager.application(app, open: url, options: options)
  }
// @generated begin jpush-swift-remote-notification-methods - expo prebuild (DO NOT MODIFY) sync-4f3c6a094ada6e1279c7e6dd249a97258a9e0d4a

  public override func application(_ application: UIApplication,
                                  didRegisterForRemoteNotificationsWithDeviceToken deviceToken: Data) {
    print("🎉 成功获取 deviceToken: \(deviceToken)")

    // 将 deviceToken 转换为字符串格式
    let tokenParts = deviceToken.map { data in String(format: "%02.2hhx", data) }
    let token = tokenParts.joined()
    print("📱 deviceToken (String): \(token)")

    // 注册到 JPush
    JPUSHService.registerDeviceToken(deviceToken)

    return super.application(application, didRegisterForRemoteNotificationsWithDeviceToken: deviceToken)
  }

  public override func application(_ application: UIApplication,
                                  didFailToRegisterForRemoteNotificationsWithError error: Error) {
    print("❌ 注册推送通知失败: \(error.localizedDescription)")
    return super.application(application, didFailToRegisterForRemoteNotificationsWithError: error)
  }
// @generated end jpush-swift-remote-notification-methods

  // Universal Links
  public override func application(
    _ application: UIApplication,
    continue userActivity: NSUserActivity,
    restorationHandler: @escaping ([UIUserActivityRestoring]?) -> Void
  ) -> Bool {
    let result = RCTLinkingManager.application(application, continue: userActivity, restorationHandler: restorationHandler)
    return super.application(application, continue: userActivity, restorationHandler: restorationHandler) || result
  }
}

// @generated begin jpush-swift-delegate-extension - expo prebuild (DO NOT MODIFY) sync-2ecb0c57f3b74b2917bae086934a171a891c9fc6

extension AppDelegate: JPUSHRegisterDelegate {

  @objc public func jpushNotificationCenter(_ center: UNUserNotificationCenter,
                                     willPresent notification: UNNotification,
                                     withCompletionHandler completionHandler: @escaping (Int) -> Void) {
    let userInfo = notification.request.content.userInfo

    if notification.request.trigger is UNPushNotificationTrigger {
      // 处理远程推送
      JPUSHService.handleRemoteNotification(userInfo)
      print("iOS10 收到远程通知: (userInfo)")
      NotificationCenter.default.post(
        name: NSNotification.Name("J_APNS_NOTIFICATION_ARRIVED_EVENT"),
        object: userInfo
      )
    }

    // 在前台显示通知
    let presentationOptions = UNNotificationPresentationOptions.badge.rawValue |
                             UNNotificationPresentationOptions.sound.rawValue |
                             UNNotificationPresentationOptions.alert.rawValue
    completionHandler(Int(presentationOptions))
  }

  @objc public func jpushNotificationCenter(_ center: UNUserNotificationCenter,
                                     didReceive response: UNNotificationResponse,
                                     withCompletionHandler completionHandler: @escaping () -> Void) {
    let userInfo = response.notification.request.content.userInfo

    if response.notification.request.trigger is UNPushNotificationTrigger {
      // 处理远程推送点击
      JPUSHService.handleRemoteNotification(userInfo)
      JPushColdStartBridge.cacheOpenedNotification(userInfo)
      print("iOS10 用户点击了远程通知: (userInfo)")
      NotificationCenter.default.post(
        name: NSNotification.Name("J_APNS_NOTIFICATION_OPENED_EVENT"),
        object: userInfo
      )
    }

    completionHandler()
  }

  // 自定义消息处理
  @objc public func networkDidReceiveMessage(_ notification: Notification) {
    let userInfo = notification.userInfo
    guard let _ = userInfo else { return }

    print("收到自定义消息: (userInfo!)")
    NotificationCenter.default.post(
      name: NSNotification.Name("J_CUSTOM_NOTIFICATION_EVENT"),
      object: userInfo
    )
  }
  
  // 通知设置
  @objc public func jpushNotificationCenter(_ center: UNUserNotificationCenter, 
                                           openSettingsFor notification: UNNotification?) {
    print("打开通知设置")
  }
  
  // 授权状态
  @objc public func jpushNotificationAuthorization(_ status: JPAuthorizationStatus, 
                                                   withInfo info: [AnyHashable : Any]?) {
    print("receive notification authorization status:(status.rawValue), info:(String(describing: info))")
  }
}

// @generated end jpush-swift-delegate-extension

@objc(JPushColdStartBridge)
class JPushColdStartBridge: NSObject {
  private static var cachedOpenedNotification: [AnyHashable: Any]?

  static func cacheLaunchNotification(
    _ launchOptions: [UIApplication.LaunchOptionsKey: Any]?
  ) {
    guard let userInfo =
      launchOptions?[UIApplication.LaunchOptionsKey.remoteNotification]
        as? [AnyHashable: Any]
    else { return }
    cachedOpenedNotification = userInfo
  }

  static func cacheOpenedNotification(_ userInfo: [AnyHashable: Any]) {
    cachedOpenedNotification = userInfo
  }

  @objc static func requiresMainQueueSetup() -> Bool {
    true
  }

  @objc
  func consumeInitialNotificationOpened(
    _ resolve: RCTPromiseResolveBlock,
    rejecter reject: RCTPromiseRejectBlock
  ) {
    let payload = Self.cachedOpenedNotification
    Self.cachedOpenedNotification = nil
    resolve(Self.stringifyKeys(payload))
  }

  private static func stringifyKeys(_ value: Any?) -> Any? {
    guard let value else { return nil }

    if let dict = value as? [AnyHashable: Any] {
      var result: [String: Any] = [:]
      for (key, nestedValue) in dict {
        result[String(describing: key)] = stringifyKeys(nestedValue)
      }
      return result
    }

    if let array = value as? [Any] {
      return array.map { stringifyKeys($0) as Any }
    }

    return value
  }
}

class ReactNativeDelegate: ExpoReactNativeFactoryDelegate {
  // Extension point for config-plugins

  override func sourceURL(for bridge: RCTBridge) -> URL? {
    // needed to return the correct URL for expo-dev-client.
    bridge.bundleURL ?? bundleURL()
  }

  override func bundleURL() -> URL? {
#if DEBUG
    return RCTBundleURLProvider.sharedSettings().jsBundleURL(forBundleRoot: ".expo/.virtual-metro-entry")
#else
    return Bundle.main.url(forResource: "main", withExtension: "jsbundle")
#endif
  }
}
