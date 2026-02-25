#import <React/RCTBridgeModule.h>

@interface RCT_EXTERN_MODULE(CourseLiveActivityModule, NSObject)

RCT_EXTERN_METHOD(startActivity:(NSString *)courseName
                  location:(NSString *)location
                  startTime:(NSString *)startTime
                  endTime:(NSString *)endTime
                  classStartTimestamp:(double)classStartTimestamp
                  resolver:(RCTPromiseResolveBlock)resolve
                  rejecter:(RCTPromiseRejectBlock)reject)

RCT_EXTERN_METHOD(updateActivity:(NSString *)activityId
                  classStartTimestamp:(double)classStartTimestamp
                  isInClass:(BOOL)isInClass
                  resolver:(RCTPromiseResolveBlock)resolve
                  rejecter:(RCTPromiseRejectBlock)reject)

RCT_EXTERN_METHOD(endActivity:(NSString *)activityId
                  resolver:(RCTPromiseResolveBlock)resolve
                  rejecter:(RCTPromiseRejectBlock)reject)

RCT_EXTERN_METHOD(endAllActivities:(RCTPromiseResolveBlock)resolve
                  rejecter:(RCTPromiseRejectBlock)reject)

@end
