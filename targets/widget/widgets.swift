import WidgetKit
import SwiftUI

// 课程数据模型
struct Course: Codable, Identifiable {
    let id: String
    let name: String
    let teacher: String?
    let location: String?
    let weekday: Int
    let startSection: Int
    let endSection: Int
    let weeks: [Int]
    
    enum CodingKeys: String, CodingKey {
        case id
        case name
        case teacher
        case location
        case weekday
        case startSection = "start_section"
        case endSection = "end_section"
        case weeks
    }
}

// 时间线提供者
struct CourseProvider: TimelineProvider {
    func placeholder(in context: Context) -> CourseEntry {
        CourseEntry(date: Date(), courses: [])
    }
    
    func getSnapshot(in context: Context, completion: @escaping (CourseEntry) -> ()) {
        let entry = CourseEntry(date: Date(), courses: loadCourses())
        completion(entry)
    }
    
    func getTimeline(in context: Context, completion: @escaping (Timeline<CourseEntry>) -> ()) {
        let currentDate = Date()
        let courses = loadCourses()
        let entry = CourseEntry(date: currentDate, courses: courses)
        
        // 每小时更新一次
        let nextUpdate = Calendar.current.date(byAdding: .hour, value: 1, to: currentDate)!
        let timeline = Timeline(entries: [entry], policy: .after(nextUpdate))
        completion(timeline)
    }
    
    // 从 UserDefaults 加载课程数据
    private func loadCourses() -> [Course] {
        guard let defaults = UserDefaults(suiteName: "group.release-20240916"),
              let courseData = defaults.string(forKey: "courseTable"),
              let jsonData = courseData.data(using: .utf8) else {
            return []
        }
        
        do {
            let courses = try JSONDecoder().decode([Course].self, from: jsonData)
            return courses
        } catch {
            print("Failed to decode courses: \(error)")
            return []
        }
    }
}

struct CourseEntry: TimelineEntry {
    let date: Date
    let courses: [Course]
}

// 小组件视图
struct CourseWidgetEntryView: View {
    var entry: CourseProvider.Entry
    @Environment(\.widgetFamily) var family
    
    var body: some View {
        switch family {
        case .systemSmall:
            SmallWidgetView(courses: getTodayCourses())
        case .systemMedium:
            MediumWidgetView(courses: getTodayCourses())
        case .systemLarge:
            LargeWidgetView(courses: getWeekCourses())
        default:
            SmallWidgetView(courses: getTodayCourses())
        }
    }
    
    // 获取今天的课程
    private func getTodayCourses() -> [Course] {
        let weekday = Calendar.current.component(.weekday, from: Date())
        let adjustedWeekday = weekday == 1 ? 7 : weekday - 1
        
        return entry.courses.filter { $0.weekday == adjustedWeekday }
            .sorted { $0.startSection < $1.startSection }
    }
    
    // 获取本周课程
    private func getWeekCourses() -> [Course] {
        return entry.courses
    }
}

// 小尺寸视图
struct SmallWidgetView: View {
    let courses: [Course]
    
    var body: some View {
        VStack(alignment: .leading, spacing: 8) {
            Text("今日课程")
                .font(.headline)
                .foregroundColor(.primary)
            
            if courses.isEmpty {
                Text("今天没有课程")
                    .font(.caption)
                    .foregroundColor(.secondary)
            } else {
                ForEach(courses.prefix(3)) { course in
                    VStack(alignment: .leading, spacing: 2) {
                        Text(course.name)
                            .font(.caption)
                            .fontWeight(.medium)
                            .lineLimit(1)
                        Text("第\(course.startSection)-\(course.endSection)节")
                            .font(.caption2)
                            .foregroundColor(.secondary)
                    }
                }
            }
            
            Spacer()
        }
        .padding()
    }
}

// 中等尺寸视图
struct MediumWidgetView: View {
    let courses: [Course]
    
    var body: some View {
        VStack(alignment: .leading, spacing: 8) {
            Text("今日课程")
                .font(.headline)
                .foregroundColor(.primary)
            
            if courses.isEmpty {
                Text("今天没有课程")
                    .font(.body)
                    .foregroundColor(.secondary)
            } else {
                ForEach(courses.prefix(4)) { course in
                    HStack {
                        VStack(alignment: .leading, spacing: 2) {
                            Text(course.name)
                                .font(.subheadline)
                                .fontWeight(.medium)
                                .lineLimit(1)
                            HStack {
                                Text("第\(course.startSection)-\(course.endSection)节")
                                    .font(.caption)
                                    .foregroundColor(.secondary)
                                if let location = course.location {
                                    Text("·")
                                        .foregroundColor(.secondary)
                                    Text(location)
                                        .font(.caption)
                                        .foregroundColor(.secondary)
                                        .lineLimit(1)
                                }
                            }
                        }
                        Spacer()
                    }
                }
            }
            
            Spacer()
        }
        .padding()
    }
}

// 大尺寸视图
struct LargeWidgetView: View {
    let courses: [Course]
    
    var body: some View {
        VStack(alignment: .leading, spacing: 10) {
            Text("本周课程")
                .font(.headline)
                .foregroundColor(.primary)
            
            if courses.isEmpty {
                Text("暂无课程数据")
                    .font(.body)
                    .foregroundColor(.secondary)
            } else {
                ScrollView {
                    ForEach(1...7, id: \.self) { weekday in
                        let dayCourses = courses.filter { $0.weekday == weekday }
                            .sorted { $0.startSection < $1.startSection }
                        
                        if !dayCourses.isEmpty {
                            VStack(alignment: .leading, spacing: 4) {
                                Text(weekdayName(weekday))
                                    .font(.subheadline)
                                    .fontWeight(.semibold)
                                    .foregroundColor(.blue)
                                
                                ForEach(dayCourses) { course in
                                    HStack {
                                        Text(course.name)
                                            .font(.caption)
                                            .lineLimit(1)
                                        Spacer()
                                        Text("第\(course.startSection)-\(course.endSection)节")
                                            .font(.caption2)
                                            .foregroundColor(.secondary)
                                    }
                                }
                            }
                            .padding(.bottom, 4)
                        }
                    }
                }
            }
        }
        .padding()
    }
    
    private func weekdayName(_ weekday: Int) -> String {
        let names = ["", "周一", "周二", "周三", "周四", "周五", "周六", "周日"]
        return names[weekday]
    }
}

// 小组件配置
struct widget: Widget {
    let kind: String = "CourseWidget"
    
    var body: some WidgetConfiguration {
        StaticConfiguration(kind: kind, provider: CourseProvider()) { entry in
            CourseWidgetEntryView(entry: entry)
                .containerBackground(.fill.tertiary, for: .widget)
        }
        .configurationDisplayName("课程表")
        .description("查看今日或本周的课程安排")
        .supportedFamilies([.systemSmall, .systemMedium, .systemLarge])
    }
}
