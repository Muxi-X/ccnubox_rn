import ActivityKit
import WidgetKit
import SwiftUI

// MARK: - Activity Attributes

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

// MARK: - Live Activity Widget

struct CourseLiveActivity: Widget {
    var body: some WidgetConfiguration {
        ActivityConfiguration(for: CourseActivityAttributes.self) { context in
            // 锁屏/横幅 UI
            LockScreenView(context: context)
        } dynamicIsland: { context in
            DynamicIsland {
                // 展开状态
                DynamicIslandExpandedRegion(.leading) {
                    VStack(alignment: .leading, spacing: 4) {
                        Image(systemName: "book.fill")
                            .font(.title2)
                            .foregroundColor(.blue)
                        
                        if context.state.isInClass || context.state.classStartTime <= Date() {
                            Text("上课中")
                                .font(.caption2)
                                .foregroundColor(.green)
                        } else {
                            // 系统自动倒计时
                            Text(context.state.classStartTime, style: .timer)
                                .font(.caption2)
                                .foregroundColor(.orange)
                                .monospacedDigit()
                        }
                    }
                }
                
                DynamicIslandExpandedRegion(.trailing) {
                    VStack(alignment: .trailing, spacing: 4) {
                        Text(context.attributes.startTime)
                            .font(.title3)
                            .fontWeight(.semibold)
                        Text(context.attributes.location)
                            .font(.caption)
                            .foregroundColor(.secondary)
                    }
                }
                
                DynamicIslandExpandedRegion(.center) {
                    Text(context.attributes.courseName)
                        .font(.headline)
                        .lineLimit(1)
                }
                
                DynamicIslandExpandedRegion(.bottom) {
                    HStack {
                        Image(systemName: "clock.fill")
                            .font(.caption)
                        Text("\(context.attributes.startTime) - \(context.attributes.endTime)")
                            .font(.caption)
                        
                        Spacer()
                        
                        Image(systemName: "location.fill")
                            .font(.caption)
                        Text(context.attributes.location)
                            .font(.caption)
                    }
                    .foregroundColor(.secondary)
                    .padding(.horizontal)
                }
            } compactLeading: {
                // 紧凑状态左侧 - 地点
                HStack(spacing: 3) {
                    Image(systemName: "location.fill")
                        .font(.system(size: 10))
                        .foregroundColor(.blue)
                    Text(context.attributes.location)
                        .font(.system(size: 12, weight: .medium))
                        .lineLimit(1)
                }
            } compactTrailing: {
                // 紧凑状态右侧 - 课程名 + 倒计时
                HStack(spacing: 6) {
                    Text(context.attributes.courseName)
                        .font(.system(size: 12, weight: .medium))
                        .lineLimit(1)
                        .truncationMode(.tail)
                        .frame(maxWidth: 60)
                    
                    if context.state.isInClass || context.state.classStartTime <= Date() {
                        Text("上课中")
                            .font(.system(size: 12, weight: .semibold))
                            .foregroundColor(.green)
                    } else {
                        Text(context.state.classStartTime, style: .timer)
                            .font(.system(size: 12, weight: .semibold))
                            .foregroundColor(.orange)
                            .monospacedDigit()
                    }
                }
            } minimal: {
                // 最小化状态
                Image(systemName: "book.fill")
                    .font(.system(size: 10))
                    .foregroundColor(.blue)
            }
            .keylineTint(.blue)
        }
    }
}

// MARK: - Lock Screen View

struct LockScreenView: View {
    let context: ActivityViewContext<CourseActivityAttributes>
    
    var body: some View {
        let isInClass = context.state.isInClass || context.state.classStartTime <= Date()

        VStack(alignment: .leading, spacing: 10) {
            HStack(alignment: .center, spacing: 12) {
                ZStack {
                    RoundedRectangle(cornerRadius: 12, style: .continuous)
                        .fill(isInClass ? Color.green.opacity(0.16) : Color.purple.opacity(0.16))
                        .frame(width: 44, height: 44)
                    
                    Image(systemName: "book.fill")
                        .font(.system(size: 18))
                        .foregroundColor(isInClass ? .green : .purple)
                }
                
                VStack(alignment: .leading, spacing: 6) {
                    Text(context.attributes.courseName)
                        .font(.system(size: 16, weight: .bold))
                        .lineLimit(1)
                    
                    HStack(spacing: 6) {
                        Image(systemName: "location.fill")
                            .font(.system(size: 10))
                        Text(context.attributes.location)
                            .lineLimit(1)
                        Text("·")
                        Image(systemName: "clock.fill")
                            .font(.system(size: 10))
                        Text("\(context.attributes.startTime)-\(context.attributes.endTime)")
                            .lineLimit(1)
                    }
                    .font(.system(size: 12))
                    .foregroundColor(.secondary)
                }
                
                Spacer(minLength: 8)
            }
            
            RoundedRectangle(cornerRadius: 10, style: .continuous)
                .fill(isInClass ? Color.green.opacity(0.12) : Color.purple.opacity(0.12))
                .frame(height: 44)
                .overlay(
                    HStack {
                        Label(
                            isInClass ? "课程进行中" : "距离上课",
                            systemImage: isInClass ? "checkmark.circle.fill" : "timer"
                        )
                        .font(.system(size: 13, weight: .semibold))
                        .foregroundColor(isInClass ? .green : .purple)
                        
                        Spacer()

                        Group {
                            if isInClass {
                                Text("上课中")
                                    .font(.system(size: 15, weight: .bold, design: .rounded))
                                    .foregroundColor(.green)
                            } else {
                                Text(context.state.classStartTime, style: .timer)
                                    .font(.system(size: 22, weight: .bold, design: .rounded))
                                    .foregroundColor(.purple)
                                    .monospacedDigit()
                            }
                        }
                        .frame(minWidth: 116, alignment: .trailing)
                        .multilineTextAlignment(.trailing)
                    }
                    .padding(.leading, 12)
                    .padding(.trailing, 12)
                )
        }
        .padding(.horizontal, 16)
        .padding(.vertical, 14)
        .activityBackgroundTint(Color(UIColor.systemBackground))
        .activitySystemActionForegroundColor(.purple)
    }
}

// MARK: - Previews

#Preview("Notification", as: .content, using: CourseActivityAttributes.preview) {
    CourseLiveActivity()
} contentStates: {
    CourseActivityAttributes.ContentState.tenMinutes
    CourseActivityAttributes.ContentState.fiveMinutes
    CourseActivityAttributes.ContentState.inClass
}

extension CourseActivityAttributes {
    fileprivate static var preview: CourseActivityAttributes {
        CourseActivityAttributes(
            courseName: "高等数学",
            location: "n201",
            startTime: "08:00",
            endTime: "09:40"
        )
    }
}

extension CourseActivityAttributes.ContentState {
    fileprivate static var tenMinutes: CourseActivityAttributes.ContentState {
        CourseActivityAttributes.ContentState(
            classStartTime: Date().addingTimeInterval(10 * 60),
            isInClass: false
        )
    }
    
    fileprivate static var fiveMinutes: CourseActivityAttributes.ContentState {
        CourseActivityAttributes.ContentState(
            classStartTime: Date().addingTimeInterval(5 * 60),
            isInClass: false
        )
    }
    
    fileprivate static var inClass: CourseActivityAttributes.ContentState {
        CourseActivityAttributes.ContentState(
            classStartTime: Date(),
            isInClass: true
        )
    }
}
