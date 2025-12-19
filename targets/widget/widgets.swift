import WidgetKit
import SwiftUI

// MARK: - 数据模型

struct Course: Codable, Identifiable {
    let id: String
    let classname: String
    let teacher: String
    let `where`: String
    let day: Int
    let classWhen: String
    let weeksString: String
    let credit: Double
    let isOfficialInt: Int
    let note: String
    let semester: String
    let weekDuration: String
    let year: String
    
    enum CodingKeys: String, CodingKey {
        case id, classname, teacher
        case `where`
        case day
        case classWhen = "class_when"
        case weeksString = "weeks"
        case credit
        case isOfficialInt = "is_official"
        case note, semester
        case weekDuration = "week_duration"
        case year
    }
    
    var weeks: [Int] {
        guard let data = weeksString.data(using: .utf8),
              let array = try? JSONDecoder().decode([Int].self, from: data) else {
            return []
        }
        return array
    }
    
    var isOfficial: Bool {
        return isOfficialInt != 0
    }
    
    var startSection: Int {
        let parts = classWhen.split(separator: "-")
        return Int(parts.first ?? "1") ?? 1
    }
    
    var endSection: Int {
        let parts = classWhen.split(separator: "-")
        return Int(parts.last ?? "1") ?? 1
    }
}

// MARK: - Timeline Provider

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
        let nextUpdate = Calendar.current.date(byAdding: .hour, value: 1, to: currentDate)!
        let timeline = Timeline(entries: [entry], policy: .after(nextUpdate))
        completion(timeline)
    }
    
    private func loadCourses() -> [Course] {
        guard let defaults = UserDefaults(suiteName: "group.release-20240916"),
              let courseData = defaults.data(forKey: "courseTable"),
              let courses = try? JSONDecoder().decode([Course].self, from: courseData) else {
            return []
        }
        return courses
    }
}

struct CourseEntry: TimelineEntry {
    let date: Date
    let courses: [Course]
}

// MARK: - Widget Entry View

struct CourseWidgetEntryView: View {
    var entry: CourseProvider.Entry
    @Environment(\.widgetFamily) var family
    
    var body: some View {
        switch family {
        case .systemSmall:
            SmallWidgetView(courses: getTodayCourses())
        case .systemMedium:
            MediumWidgetView(courses: entry.courses)
        case .systemLarge:
            LargeWidgetView(courses: entry.courses)
        default:
            SmallWidgetView(courses: getTodayCourses())
        }
    }
    
    private func getTodayCourses() -> [Course] {
        let weekday = Calendar.current.component(.weekday, from: Date())
        let adjustedWeekday = weekday == 1 ? 7 : weekday - 1
        return entry.courses.filter { $0.day == adjustedWeekday }
            .sorted { $0.startSection < $1.startSection }
    }
}

// MARK: - Small Widget

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
                        Text(course.classname)
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

// MARK: - Medium Widget

struct MediumWidgetView: View {
    let courses: [Course]
    
    var body: some View {
        let weekday = Calendar.current.component(.weekday, from: Date())
        let today = weekday == 1 ? 7 : weekday - 1
        let tomorrow = today == 7 ? 1 : today + 1
        
        let todayCourses = courses.filter { $0.day == today }.sorted { $0.startSection < $1.startSection }
        let tomorrowCourses = courses.filter { $0.day == tomorrow }.sorted { $0.startSection < $1.startSection }
        
        HStack(spacing: 12) {
            VStack(alignment: .leading, spacing: 8) {
                HStack(spacing: 4) {
                    Text("今天")
                        .font(.system(size: 14, weight: .medium))
                    Text(dateString(for: 0))
                        .font(.system(size: 12))
                        .foregroundColor(.secondary)
                    Text(weekdayName(today))
                        .font(.system(size: 12))
                        .foregroundColor(.blue)
                }
                
                if todayCourses.isEmpty {
                    Text("无课程")
                        .font(.system(size: 11))
                        .foregroundColor(.secondary)
                        .padding(.top, 4)
                } else {
                    ForEach(todayCourses.prefix(3)) { course in
                        CourseCardView(course: course, color: .purple)
                    }
                }
                Spacer()
            }
            .frame(maxWidth: .infinity, alignment: .leading)
            
            VStack(alignment: .leading, spacing: 8) {
                HStack(spacing: 4) {
                    Text("明天")
                        .font(.system(size: 14, weight: .medium))
                    Text(dateString(for: 1))
                        .font(.system(size: 12))
                        .foregroundColor(.secondary)
                    Text(weekdayName(tomorrow))
                        .font(.system(size: 12))
                        .foregroundColor(.blue)
                }
                
                if tomorrowCourses.isEmpty {
                    Text("无课程")
                        .font(.system(size: 11))
                        .foregroundColor(.secondary)
                        .padding(.top, 4)
                } else {
                    ForEach(tomorrowCourses.prefix(3)) { course in
                        CourseCardView(course: course, color: .orange)
                    }
                }
                Spacer()
            }
            .frame(maxWidth: .infinity, alignment: .leading)
        }
        .padding(.horizontal, 12)
        .padding(.vertical, 12)
    }
    
    private func dateString(for daysFromNow: Int) -> String {
        let date = Calendar.current.date(byAdding: .day, value: daysFromNow, to: Date()) ?? Date()
        let formatter = DateFormatter()
        formatter.dateFormat = "MM/dd"
        return formatter.string(from: date)
    }
    
    private func weekdayName(_ weekday: Int) -> String {
        let names = ["", "星期一", "星期二", "星期三", "星期四", "星期五", "星期六", "星期日"]
        return names[weekday]
    }
}

// MARK: - Course Card

struct CourseCardView: View {
    let course: Course
    let color: Color
    
    var body: some View {
        HStack(spacing: 6) {
            RoundedRectangle(cornerRadius: 3)
                .fill(color)
                .frame(width: 4)
            
            VStack(alignment: .leading, spacing: 2) {
                Text(course.classname)
                    .font(.system(size: 13, weight: .medium))
                    .lineLimit(1)
                
                Text(course.where)
                    .font(.system(size: 11))
                    .foregroundColor(.secondary)
                    .lineLimit(1)
                
                Text(timeString(from: course.classWhen))
                    .font(.system(size: 11))
                    .foregroundColor(.secondary)
            }
            .padding(.vertical, 8)
            .padding(.trailing, 8)
            
            Spacer()
        }
        .padding(.leading, 6)
    }
    
    private func timeString(from classWhen: String) -> String {
        let parts = classWhen.split(separator: "-")
        guard let start = Int(parts.first ?? "1") else { return classWhen }
        
        let times = ["", "08:00-09:40", "10:10-11:50", "14:00-15:40",
                     "16:10-17:50", "19:00-20:40", "20:50-22:30"]
        
        return start < times.count ? times[start] : "第\(classWhen)节"
    }
}

// MARK: - Large Widget

struct LargeWidgetView: View {
    let courses: [Course]
    
    var body: some View {
        let weekday = Calendar.current.component(.weekday, from: Date())
        let today = weekday == 1 ? 7 : weekday - 1
        let tomorrow = today == 7 ? 1 : today + 1
        
        let todayCourses = courses.filter { $0.day == today }.sorted { $0.startSection < $1.startSection }
        let tomorrowCourses = courses.filter { $0.day == tomorrow }.sorted { $0.startSection < $1.startSection }
        
        VStack(alignment: .leading, spacing: 12) {
            Text("课程安排")
                .font(.system(size: 18, weight: .bold))
                .padding(.horizontal, 16)
                .padding(.top, 12)
            
            HStack(alignment: .top, spacing: 16) {
                VStack(alignment: .leading, spacing: 8) {
                    HStack(spacing: 4) {
                        Text("今天")
                            .font(.system(size: 15, weight: .semibold))
                        Text(dateString(for: 0))
                            .font(.system(size: 12))
                            .foregroundColor(.secondary)
                        Text(weekdayName(today))
                            .font(.system(size: 12))
                            .foregroundColor(.blue)
                    }
                    
                    if todayCourses.isEmpty {
                        Text("无课程")
                            .font(.system(size: 11))
                            .foregroundColor(.secondary)
                            .padding(.top, 4)
                    } else {
                        ForEach(todayCourses) { course in
                            LargeCourseCardView(course: course, color: .purple)
                        }
                    }
                    Spacer()
                }
                .frame(maxWidth: .infinity, alignment: .leading)
                
                VStack(alignment: .leading, spacing: 8) {
                    HStack(spacing: 4) {
                        Text("明天")
                            .font(.system(size: 15, weight: .semibold))
                        Text(dateString(for: 1))
                            .font(.system(size: 12))
                            .foregroundColor(.secondary)
                        Text(weekdayName(tomorrow))
                            .font(.system(size: 12))
                            .foregroundColor(.blue)
                    }
                    
                    if tomorrowCourses.isEmpty {
                        Text("无课程")
                            .font(.system(size: 11))
                            .foregroundColor(.secondary)
                            .padding(.top, 4)
                    } else {
                        ForEach(tomorrowCourses) { course in
                            LargeCourseCardView(course: course, color: .orange)
                        }
                    }
                    Spacer()
                }
                .frame(maxWidth: .infinity, alignment: .leading)
            }
            .padding(.horizontal, 16)
        }
        .padding(.bottom, 12)
    }
    
    private func dateString(for daysFromNow: Int) -> String {
        let date = Calendar.current.date(byAdding: .day, value: daysFromNow, to: Date()) ?? Date()
        let formatter = DateFormatter()
        formatter.dateFormat = "MM/dd"
        return formatter.string(from: date)
    }
    
    private func weekdayName(_ weekday: Int) -> String {
        let names = ["", "周一", "周二", "周三", "周四", "周五", "周六", "周日"]
        return names[weekday]
    }
}

struct LargeCourseCardView: View {
    let course: Course
    let color: Color
    
    var body: some View {
        HStack(spacing: 6) {
            RoundedRectangle(cornerRadius: 3)
                .fill(color)
                .frame(width: 4)
            
            VStack(alignment: .leading, spacing: 3) {
                Text(course.classname)
                    .font(.system(size: 13, weight: .medium))
                    .lineLimit(1)
                
                Text(course.where)
                    .font(.system(size: 11))
                    .foregroundColor(.secondary)
                    .lineLimit(1)
                
                Text(timeString(from: course.classWhen))
                    .font(.system(size: 11))
                    .foregroundColor(.secondary)
            }
            .padding(.vertical, 8)
            .padding(.trailing, 6)
            
            Spacer()
        }
        .padding(.leading, 6)
    }
    
    private func timeString(from classWhen: String) -> String {
        let parts = classWhen.split(separator: "-")
        guard let start = Int(parts.first ?? "1") else { return classWhen }
        
        let times = ["", "08:00-09:40", "10:10-11:50", "14:00-15:40",
                     "16:10-17:50", "19:00-20:40", "20:50-22:30"]
        
        return start < times.count ? times[start] : "第\(classWhen)节"
    }
}

// MARK: - Widget Configuration

struct widget: Widget {
    let kind: String = "CourseWidget"
    
    var body: some WidgetConfiguration {
        StaticConfiguration(kind: kind, provider: CourseProvider()) { entry in
            CourseWidgetEntryView(entry: entry)
                .containerBackground(Color(UIColor.systemBackground), for: .widget)
        }
        .configurationDisplayName("课程表")
        .description("查看今日或本周的课程安排")
        .supportedFamilies([.systemSmall, .systemMedium, .systemLarge])
    }
}

// MARK: - Previews

#Preview("Small", as: .systemSmall) {
    widget()
} timeline: {
    CourseEntry(date: .now, courses: previewCourses())
}

#Preview("Medium", as: .systemMedium) {
    widget()
} timeline: {
    CourseEntry(date: .now, courses: previewCourses())
}

#Preview("Large", as: .systemLarge) {
    widget()
} timeline: {
    CourseEntry(date: .now, courses: previewCourses())
}

func previewCourses() -> [Course] {
    let weekday = Calendar.current.component(.weekday, from: Date())
    let today = weekday == 1 ? 7 : weekday - 1
    let tomorrow = today == 7 ? 1 : today + 1
    
    return [
        Course(id: "1", classname: "高等数学", teacher: "张老师", where: "n201", day: today,
               classWhen: "1-2", weeksString: "[1,2,3,4,5]", credit: 4, isOfficialInt: 1,
               note: "", semester: "1", weekDuration: "1-15周", year: "2025"),
        Course(id: "2", classname: "大学英语", teacher: "李老师", where: "n305", day: today,
               classWhen: "3-4", weeksString: "[1,2,3,4,5]", credit: 2, isOfficialInt: 1,
               note: "", semester: "1", weekDuration: "1-15周", year: "2025"),
        Course(id: "3", classname: "数据结构", teacher: "王老师", where: "n526", day: tomorrow,
               classWhen: "1-2", weeksString: "[1,2,3,4,5]", credit: 4, isOfficialInt: 1,
               note: "", semester: "1", weekDuration: "1-15周", year: "2025")
    ]
}
