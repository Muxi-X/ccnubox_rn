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
                        
                        if context.state.isInClass {
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
                    
                    if context.state.isInClass {
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
        VStack(spacing: 12) {
            HStack(alignment: .center, spacing: 12) {
                
                // 1. 左侧：图标
                ZStack {
                    RoundedRectangle(cornerRadius: 10, style: .continuous)
                        .fill(Color.purple.opacity(0.15))
                        .frame(width: 40, height: 40)
                    
                    Image(systemName: "book.fill")
                        .font(.system(size: 18))
                        .foregroundColor(.purple)
                }
                
                // 2. 中间：课程信息
                VStack(alignment: .leading, spacing: 3) {
                    Text(context.attributes.courseName)
                        .font(.system(size: 16, weight: .bold))
                        .foregroundColor(.primary)
                        .lineLimit(1)
                    
                    // 地点和时间分开显示，避免挤压
                    HStack(spacing: 4) {
                        Image(systemName: "location.fill")
                            .font(.system(size: 10))
                        Text(context.attributes.location)
                        
                        Text("·")
                        
                        Image(systemName: "clock.fill")
                            .font(.system(size: 10))
                        Text("\(context.attributes.startTime)-\(context.attributes.endTime)")
                    }
                    .font(.system(size: 12))
                    .foregroundColor(.secondary)
                    .lineLimit(1)
                    .minimumScaleFactor(0.8)
                }
                
                Spacer(minLength: 8)
                
                // 3. 右侧：倒计时（贴右侧）
                if context.state.isInClass {
                    Text("上课中")
                        .font(.system(size: 14, weight: .bold, design: .rounded))
                        .foregroundColor(.white)
                        .padding(.vertical, 5)
                        .padding(.horizontal, 10)
                        .background(Capsule().fill(Color.green))
                        .fixedSize()
                } else {
                    Text(context.state.classStartTime, style: .timer)
                        .font(.system(size: 26, weight: .bold, design: .rounded))
                        .foregroundColor(.purple)
                        .monospacedDigit()
                        .fixedSize()
                }
            }
            .padding(.horizontal, 16)
            .padding(.top, 14)
            
            // 4. 底部进度条 - 使用 ProgressView 自动更新
            ProgressView(
                timerInterval: Date()...context.state.classStartTime,
                countsDown: true
            ) {
                EmptyView()
            } currentValueLabel: {
                EmptyView()
            }
            .progressViewStyle(.linear)
            .tint(context.state.isInClass ? .green : .purple)
            .padding(.horizontal, 16)
            .padding(.bottom, 14)
        }
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
