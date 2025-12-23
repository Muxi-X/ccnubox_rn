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
    
    // 判断课程是否已上完（仅对今天的课程有效）
    func isFinished(for day: Int) -> Bool {
        let now = Date()
        let calendar = Calendar.current
        let currentWeekday = calendar.component(.weekday, from: now)
        let adjustedWeekday = currentWeekday == 1 ? 7 : currentWeekday - 1
        
        // 只判断今天的课程
        guard day == adjustedWeekday else { return false }
        
        let currentHour = calendar.component(.hour, from: now)
        let currentMinute = calendar.component(.minute, from: now)
        let currentMinutes = currentHour * 60 + currentMinute
        
        // 根据结束节次计算课程结束时间（分钟）
        let endMinutes = getEndMinutes(for: endSection)
        
        return currentMinutes >= endMinutes
    }
    
    // 根据节次获取结束时间（分钟）
    private func getEndMinutes(for section: Int) -> Int {
        // 节次对应的结束时间（该节的结束时间）
        let sectionEndTimes: [Int: Int] = [
            1: 8 * 60 + 45,   // 08:45 (第1节结束)
            2: 9 * 60 + 40,   // 09:40 (第2节结束)
            3: 10 * 60 + 55,  // 10:55 (第3节结束)
            4: 11 * 60 + 50,  // 11:50 (第4节结束)
            5: 14 * 60 + 45,  // 14:45 (第5节结束)
            6: 15 * 60 + 40,  // 15:40 (第6节结束)
            7: 16 * 60 + 55,  // 16:55 (第7节结束)
            8: 17 * 60 + 50,  // 17:50 (第8节结束)
            9: 19 * 60 + 15,  // 19:15 (第9节结束)
            10: 20 * 60 + 5,  // 20:05 (第10节结束)
            11: 21 * 60 + 0,  // 21:00 (第11节结束)
            12: 21 * 60 + 50  // 21:50 (第12节结束)
        ]
        
        return sectionEndTimes[section] ?? 21 * 60 + 50
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
        
        // 获取当前周并过滤课程
        let currentWeek = getCurrentWeek(from: defaults)
        return filterCoursesByCurrentWeek(courses, currentWeek: currentWeek)
    }
    
    // 计算当前周
    private func getCurrentWeek(from defaults: UserDefaults) -> Int {
        // 从 UserDefaults 读取开学时间（秒级时间戳）
        let schoolTime = defaults.double(forKey: "schoolTime")
        
        // 如果没有开学时间，返回 1（默认第一周）
        guard schoolTime > 0 else {
            return 1
        }
        
        // 将秒级时间戳转换为 Date
        let startDate = Date(timeIntervalSince1970: schoolTime)
        let now = Date()
        
        // 计算时间差（秒）
        let diffTime = now.timeIntervalSince(startDate)
        
        // 如果还没开学，返回 1
        guard diffTime >= 0 else {
            return 1
        }
        
        // 计算天数差
        let diffDays = Int(diffTime / (24 * 60 * 60))
        
        // 计算周数（从第 1 周开始）
        let week = (diffDays / 7) + 1
        
        return max(1, week) // 确保至少是第 1 周
    }
    
    // 过滤课程，只返回当前周的课程
    private func filterCoursesByCurrentWeek(_ courses: [Course], currentWeek: Int) -> [Course] {
        return courses.filter { course in
            // 检查当前周是否在课程的周数范围内
            return course.weeks.contains(currentWeek)
        }
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
                let sortedCourses = getSortedCourses()
                ForEach(sortedCourses.prefix(2)) { course in
                    let isFinished = course.isFinished(for: course.day)
                    VStack(alignment: .leading, spacing: 2) {
                        Text(course.classname)
                            .font(.caption)
                            .fontWeight(.medium)
                            .lineLimit(1)
                            .foregroundColor(isFinished ? .secondary : .primary)
                        Text("第\(course.startSection)-\(course.endSection)节")
                            .font(.caption2)
                            .foregroundColor(isFinished ? .secondary.opacity(0.7) : .secondary)
                    }
                }
            }
        }
        .padding()
        .frame(maxWidth: .infinity, maxHeight: .infinity, alignment: .topLeading)
    }
    
    // 获取排序后的课程列表（未上完的在前，已上完的在后）
    private func getSortedCourses() -> [Course] {
        let unfinished = courses.filter { !$0.isFinished(for: $0.day) }
        let finished = courses.filter { $0.isFinished(for: $0.day) }
        
        // 未上完的按开始节次排序，已上完的也按开始节次排序
        let sortedUnfinished = unfinished.sorted { $0.startSection < $1.startSection }
        let sortedFinished = finished.sorted { $0.startSection < $1.startSection }
        
        // 未上完的在前，已上完的在后
        return sortedUnfinished + sortedFinished
    }
}

// MARK: - Medium Widget

struct MediumWidgetView: View {
    let courses: [Course]
    
    // Medium Widget 的固定尺寸（点）
    private let widgetPadding: CGFloat = 10
    private let headerHeight: CGFloat = 22 // 标题区域高度（包括间距）
    private let courseCardHeight: CGFloat = 40 // 每个课程卡片的高度（包括间距6和卡片内容约34）
    private let columnSpacing: CGFloat = 10
    
    var body: some View {
        let weekday = Calendar.current.component(.weekday, from: Date())
        let today = weekday == 1 ? 7 : weekday - 1
        let tomorrow = today == 7 ? 1 : today + 1
        
        let todayCourses = getSortedCourses(courses.filter { $0.day == today })
        let tomorrowCourses = courses.filter { $0.day == tomorrow }.sorted { $0.startSection < $1.startSection }
        
        GeometryReader { geometry in
            // 根据实际可用高度计算能显示的课程数量
            // 可用高度 = 总高度 - 上下padding - 标题高度
            let actualAvailableHeight = geometry.size.height - (widgetPadding * 2) - headerHeight
            // 计算能完整显示的课程数量（向下取整，确保不截断）
            let actualMaxCourses = max(1, Int(floor(actualAvailableHeight / courseCardHeight)))
            
            HStack(alignment: .top, spacing: columnSpacing) {
                // 今天列
                CourseColumnView(
                    title: "今天",
                    dateString: dateString(for: 0),
                    weekdayName: weekdayName(today),
                    courses: todayCourses,
                    maxCount: actualMaxCourses,
                    color: .purple,
                    isToday: true,
                    todayWeekday: today
                )
                
                // 明天列
                CourseColumnView(
                    title: "明天",
                    dateString: dateString(for: 1),
                    weekdayName: weekdayName(tomorrow),
                    courses: tomorrowCourses,
                    maxCount: actualMaxCourses,
                    color: .orange,
                    isToday: false,
                    todayWeekday: today
                )
            }
            .padding(.horizontal, widgetPadding)
            .padding(.vertical, widgetPadding)
            .frame(maxWidth: .infinity, maxHeight: .infinity, alignment: .topLeading)
        }
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
    
    // 获取排序后的课程列表（未上完的在前，已上完的在后）
    private func getSortedCourses(_ courses: [Course]) -> [Course] {
        let unfinished = courses.filter { !$0.isFinished(for: $0.day) }
        let finished = courses.filter { $0.isFinished(for: $0.day) }
        
        // 未上完的按开始节次排序，已上完的也按开始节次排序
        let sortedUnfinished = unfinished.sorted { $0.startSection < $1.startSection }
        let sortedFinished = finished.sorted { $0.startSection < $1.startSection }
        
        // 未上完的在前，已上完的在后
        return sortedUnfinished + sortedFinished
    }
}

// MARK: - Course Column View

struct CourseColumnView: View {
    let title: String
    let dateString: String
    let weekdayName: String
    let courses: [Course]
    let maxCount: Int
    let color: Color
    let isToday: Bool
    let todayWeekday: Int
    
    var body: some View {
        VStack(alignment: .leading, spacing: 6) {
            // 标题区域
            HStack(spacing: 4) {
                Text(title)
                    .font(.system(size: 13, weight: .medium))
                Text(dateString)
                    .font(.system(size: 11))
                    .foregroundColor(.secondary)
                Text(weekdayName)
                    .font(.system(size: 11))
                    .foregroundColor(.blue)
            }
            
            // 课程列表
            if courses.isEmpty {
                Text("无课程")
                    .font(.system(size: 11))
                    .foregroundColor(.secondary)
                    .padding(.top, 2)
            } else {
                // 只显示能完整显示的课程
                let displayCourses = Array(courses.prefix(maxCount))
                ForEach(displayCourses) { course in
                    let isFinished = isToday ? course.isFinished(for: todayWeekday) : false
                    CourseCardView(course: course, color: color, isFinished: isFinished)
                }
            }
        }
        .frame(maxWidth: .infinity)
        .fixedSize(horizontal: false, vertical: true)
    }
}

// MARK: - Course Card

struct CourseCardView: View {
    let course: Course
    let color: Color
    let isFinished: Bool
    
    var body: some View {
        HStack(spacing: 5) {
            RoundedRectangle(cornerRadius: 3)
                .fill(isFinished ? Color.gray.opacity(0.5) : color)
                .frame(width: 3)
            
            VStack(alignment: .leading, spacing: 1) {
                Text(course.classname)
                    .font(.system(size: 12, weight: .medium))
                    .lineLimit(1)
                    .foregroundColor(isFinished ? .secondary : .primary)
                
                Text(course.where)
                    .font(.system(size: 10))
                    .foregroundColor(isFinished ? .secondary.opacity(0.7) : .secondary)
                    .lineLimit(1)
                
                Text(timeString(from: course.classWhen))
                    .font(.system(size: 10))
                    .foregroundColor(isFinished ? .secondary.opacity(0.7) : .secondary)
            }
            .padding(.vertical, 4)
            .padding(.trailing, 4)
            
            Spacer()
        }
        .padding(.leading, 4)
    }
    
    private func timeString(from classWhen: String) -> String {
        let parts = classWhen.split(separator: "-")
        guard let startSection = Int(parts.first ?? "1"),
              let endSection = Int(parts.last ?? "1") else {
            return classWhen
        }
        
        // 节次对应的开始时间
        let sectionStartTimes: [Int: String] = [
            1: "08:00",
            2: "08:55",
            3: "10:10",
            4: "11:05",
            5: "14:00",
            6: "14:55",
            7: "16:10",
            8: "17:05",
            9: "18:30",
            10: "19:20",
            11: "20:15",
            12: "21:05"
        ]
        
        // 节次对应的结束时间
        let sectionEndTimes: [Int: String] = [
            1: "08:45",
            2: "09:40",
            3: "10:55",
            4: "11:50",
            5: "14:45",
            6: "15:40",
            7: "16:55",
            8: "17:50",
            9: "19:15",
            10: "20:05",
            11: "21:00",
            12: "21:50"
        ]
        
        // 开始时间：开始节次的开始时间
        let startTime = sectionStartTimes[startSection] ?? "08:00"
        // 结束时间：结束节次的结束时间
        let endTime = sectionEndTimes[endSection] ?? "09:40"
        
        return "\(startTime)-\(endTime)"
    }
}

// MARK: - Large Widget

struct LargeWidgetView: View {
    let courses: [Course]
    
    var body: some View {
        let weekday = Calendar.current.component(.weekday, from: Date())
        let today = weekday == 1 ? 7 : weekday - 1
        let tomorrow = today == 7 ? 1 : today + 1
        
        let todayCourses = getSortedCourses(courses.filter { $0.day == today })
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
                            LargeCourseCardView(course: course, color: .purple, isFinished: course.isFinished(for: today))
                        }
                    }
                }
                .frame(maxWidth: .infinity)
                .fixedSize(horizontal: false, vertical: true)
                
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
                            LargeCourseCardView(course: course, color: .orange, isFinished: false)
                        }
                    }
                }
                .frame(maxWidth: .infinity)
                .fixedSize(horizontal: false, vertical: true)
            }
            .padding(.horizontal, 16)
        }
        .padding(.bottom, 12)
        .frame(maxWidth: .infinity, maxHeight: .infinity, alignment: .topLeading)
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
    
    // 获取排序后的课程列表（未上完的在前，已上完的在后）
    private func getSortedCourses(_ courses: [Course]) -> [Course] {
        let unfinished = courses.filter { !$0.isFinished(for: $0.day) }
        let finished = courses.filter { $0.isFinished(for: $0.day) }
        
        // 未上完的按开始节次排序，已上完的也按开始节次排序
        let sortedUnfinished = unfinished.sorted { $0.startSection < $1.startSection }
        let sortedFinished = finished.sorted { $0.startSection < $1.startSection }
        
        // 未上完的在前，已上完的在后
        return sortedUnfinished + sortedFinished
    }
}

struct LargeCourseCardView: View {
    let course: Course
    let color: Color
    let isFinished: Bool
    
    var body: some View {
        HStack(spacing: 6) {
            RoundedRectangle(cornerRadius: 3)
                .fill(isFinished ? Color.gray.opacity(0.5) : color)
                .frame(width: 4)
            
            VStack(alignment: .leading, spacing: 3) {
                Text(course.classname)
                    .font(.system(size: 13, weight: .medium))
                    .lineLimit(1)
                    .foregroundColor(isFinished ? .secondary : .primary)
                
                Text(course.where)
                    .font(.system(size: 11))
                    .foregroundColor(isFinished ? .secondary.opacity(0.7) : .secondary)
                    .lineLimit(1)
                
                Text(timeString(from: course.classWhen))
                    .font(.system(size: 11))
                    .foregroundColor(isFinished ? .secondary.opacity(0.7) : .secondary)
            }
            .padding(.vertical, 8)
            .padding(.trailing, 6)
            
            Spacer()
        }
        .padding(.leading, 6)
    }
    
    private func timeString(from classWhen: String) -> String {
        let parts = classWhen.split(separator: "-")
        guard let startSection = Int(parts.first ?? "1"),
              let endSection = Int(parts.last ?? "1") else {
            return classWhen
        }
        
        // 节次对应的开始时间
        let sectionStartTimes: [Int: String] = [
            1: "08:00",
            2: "08:55",
            3: "10:10",
            4: "11:05",
            5: "14:00",
            6: "14:55",
            7: "16:10",
            8: "17:05",
            9: "18:30",
            10: "19:20",
            11: "20:15",
            12: "21:05"
        ]
        
        // 节次对应的结束时间
        let sectionEndTimes: [Int: String] = [
            1: "08:45",
            2: "09:40",
            3: "10:55",
            4: "11:50",
            5: "14:45",
            6: "15:40",
            7: "16:55",
            8: "17:50",
            9: "19:15",
            10: "20:05",
            11: "21:00",
            12: "21:50"
        ]
        
        // 开始时间：开始节次的开始时间
        let startTime = sectionStartTimes[startSection] ?? "08:00"
        // 结束时间：结束节次的结束时间
        let endTime = sectionEndTimes[endSection] ?? "09:40"
        
        return "\(startTime)-\(endTime)"
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
