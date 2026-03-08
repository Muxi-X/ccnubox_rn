#import <React/RCTBridgeModule.h>

@interface RCT_EXTERN_MODULE(JPushColdStartBridge, NSObject)

RCT_EXTERN_METHOD(consumeInitialNotificationOpened:
  (RCTPromiseResolveBlock)resolve
  rejecter:(RCTPromiseRejectBlock)reject)

@end
