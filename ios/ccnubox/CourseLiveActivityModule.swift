import Foundation
import ActivityKit
import React

// MARK: - Activity Attributes (需要与 widget 中的定义保持一致)

struct CourseActivityAttributes: ActivityAttributes {
    public struct ContentState: Codable, Hashable {
        var classStartTime: Date
        var isInClass: Bool
    }
    
    var courseName: String
    var location: String
    var startTime: String
    var endTime: String
}

// MARK: - Native Module

@objc(CourseLiveActivityModule)
class CourseLiveActivityModule: NSObject {
    
    @objc
    static func moduleName() -> String! {
        return "CourseLiveActivityModule"
    }
    
    @objc
    func startActivity(_ courseName: String,
                      location: String,
                      startTime: String,
                      endTime: String,
                      classStartTimestamp: Double,
                      resolver: @escaping RCTPromiseResolveBlock,
                      rejecter: @escaping RCTPromiseRejectBlock) {
        
        if #available(iOS 16.2, *) {
            let attributes = CourseActivityAttributes(
                courseName: courseName,
                location: location,
                startTime: startTime,
                endTime: endTime
            )
            
            let classStartTime = Date(timeIntervalSince1970: classStartTimestamp / 1000)
            let contentState = CourseActivityAttributes.ContentState(
                classStartTime: classStartTime,
                isInClass: false
            )
            
            // 设置 staleDate 为上课时间，到时间后系统会标记为过期
            let staleDate = classStartTime
            
            do {
                let activity = try Activity.request(
                    attributes: attributes,
                    content: .init(state: contentState, staleDate: staleDate)
                )
                NSLog("✅ [LiveActivity] Started: \(activity.id), classStartTime: \(classStartTime)")
                resolver(activity.id)
            } catch {
                NSLog("❌ [LiveActivity] Failed to start: \(error)")
                rejecter("START_ERROR", "Failed to start Live Activity", error)
            }
        } else {
            rejecter("UNSUPPORTED", "Live Activities require iOS 16.2+", nil)
        }
    }
    
    @objc
    func updateActivity(_ activityId: String,
                       classStartTimestamp: Double,
                       isInClass: Bool,
                       resolver: @escaping RCTPromiseResolveBlock,
                       rejecter: @escaping RCTPromiseRejectBlock) {
        
        if #available(iOS 16.2, *) {
            Task {
                let activities = Activity<CourseActivityAttributes>.activities
                guard let activity = activities.first(where: { $0.id == activityId }) else {
                    rejecter("NOT_FOUND", "Activity not found", nil)
                    return
                }
                
                let classStartTime = Date(timeIntervalSince1970: classStartTimestamp / 1000)
                let contentState = CourseActivityAttributes.ContentState(
                    classStartTime: classStartTime,
                    isInClass: isInClass
                )
                
                await activity.update(.init(state: contentState, staleDate: nil))
                NSLog("✅ [LiveActivity] Updated: \(activityId)")
                resolver("Updated")
            }
        } else {
            rejecter("UNSUPPORTED", "Live Activities require iOS 16.2+", nil)
        }
    }
    
    @objc
    func endActivity(_ activityId: String,
                    resolver: @escaping RCTPromiseResolveBlock,
                    rejecter: @escaping RCTPromiseRejectBlock) {
        
        if #available(iOS 16.2, *) {
            Task {
                let activities = Activity<CourseActivityAttributes>.activities
                guard let activity = activities.first(where: { $0.id == activityId }) else {
                    rejecter("NOT_FOUND", "Activity not found", nil)
                    return
                }
                
                await activity.end(nil, dismissalPolicy: .immediate)
                NSLog("✅ [LiveActivity] Ended: \(activityId)")
                resolver("Ended")
            }
        } else {
            rejecter("UNSUPPORTED", "Live Activities require iOS 16.2+", nil)
        }
    }
    
    /// 结束所有活动
    @objc
    func endAllActivities(_ resolver: @escaping RCTPromiseResolveBlock,
                         rejecter: @escaping RCTPromiseRejectBlock) {
        if #available(iOS 16.2, *) {
            Task {
                for activity in Activity<CourseActivityAttributes>.activities {
                    await activity.end(nil, dismissalPolicy: .immediate)
                }
                NSLog("✅ [LiveActivity] Ended all activities")
                resolver("All ended")
            }
        } else {
            rejecter("UNSUPPORTED", "Live Activities require iOS 16.2+", nil)
        }
    }
    
    @objc
    static func requiresMainQueueSetup() -> Bool {
        return false
    }
}
