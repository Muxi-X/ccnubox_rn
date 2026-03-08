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
        CourseEntry(date: Date(), courses: [], todayWeek: 1, tomorrowWeek: 1)
    }
    
    func getSnapshot(in context: Context, completion: @escaping (CourseEntry) -> ()) {
        let entry = makeEntry(for: Date())
        completion(entry)
    }
    
    func getTimeline(in context: Context, completion: @escaping (Timeline<CourseEntry>) -> ()) {
        let currentDate = Date()
        let entry = makeEntry(for: currentDate)
        let nextUpdate = Calendar.current.date(byAdding: .hour, value: 1, to: currentDate)!
        let timeline = Timeline(entries: [entry], policy: .after(nextUpdate))
        completion(timeline)
    }
    
    private func makeEntry(for date: Date) -> CourseEntry {
        let courses = loadCourses()
        let defaults = UserDefaults(suiteName: "group.release-20240916")
        let tomorrowDate = Calendar.current.date(byAdding: .day, value: 1, to: date) ?? date
        
        return CourseEntry(
            date: date,
            courses: courses,
            todayWeek: getWeekNumber(for: date, from: defaults),
            tomorrowWeek: getWeekNumber(for: tomorrowDate, from: defaults)
        )
    }
    
    private func loadCourses() -> [Course] {
        guard let defaults = UserDefaults(suiteName: "group.release-20240916"),
              let courseData = defaults.data(forKey: "courseTable"),
              let courses = try? JSONDecoder().decode([Course].self, from: courseData) else {
            return []
        }
        return courses
    }
    
    // 计算给定日期所属的教学周（按自然日计算，避免开学日时分秒导致周次偏移）
    private func getWeekNumber(for date: Date, from defaults: UserDefaults?) -> Int {
        guard let defaults else {
            return 1
        }
        
        let schoolTime = defaults.double(forKey: "schoolTime")
        guard schoolTime > 0 else {
            return 1
        }
        
        let calendar = Calendar.current
        let startDate = Date(timeIntervalSince1970: schoolTime)
        let startDay = calendar.startOfDay(for: startDate)
        let targetDay = calendar.startOfDay(for: date)
        
        guard let diffDays = calendar.dateComponents([.day], from: startDay, to: targetDay).day else {
            return 1
        }

        return max(1, diffDays / 7 + 1)
    }
}

struct CourseEntry: TimelineEntry {
    let date: Date
    let courses: [Course]
    let todayWeek: Int
    let tomorrowWeek: Int
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
            MediumWidgetView(
                todayCourses: getTodayCourses(),
                tomorrowCourses: getTomorrowCourses()
            )
        case .systemLarge:
            LargeWidgetView(
                todayCourses: getTodayCourses(),
                tomorrowCourses: getTomorrowCourses()
            )
        default:
            SmallWidgetView(courses: getTodayCourses())
        }
    }
    
    private func getTodayCourses() -> [Course] {
        let weekday = Calendar.current.component(.weekday, from: Date())
        let adjustedWeekday = weekday == 1 ? 7 : weekday - 1
        return entry.courses
            .filter { $0.day == adjustedWeekday && $0.weeks.contains(entry.todayWeek) }
            .sorted { $0.startSection < $1.startSection }
    }
    
    private func getTomorrowCourses() -> [Course] {
        let weekday = Calendar.current.component(.weekday, from: Date())
        let today = weekday == 1 ? 7 : weekday - 1
        let tomorrow = today == 7 ? 1 : today + 1
        return entry.courses
            .filter { $0.day == tomorrow && $0.weeks.contains(entry.tomorrowWeek) }
            .sorted { $0.startSection < $1.startSection }
    }
}

// MARK: - Small Widget

struct SmallWidgetView: View {
    let courses: [Course]
    
    private var dateHeader: String {
        let formatter = DateFormatter()
        formatter.locale = Locale(identifier: "zh_CN")
        formatter.dateFormat = "M月d日"
        return formatter.string(from: Date())
    }
    
    private var weekdayHeader: String {
        let weekday = Calendar.current.component(.weekday, from: Date())
        let adjusted = weekday == 1 ? 7 : weekday - 1
        let names = ["", "星期一", "星期二", "星期三", "星期四", "星期五", "星期六", "星期日"]
        return names[adjusted]
    }
    
    var body: some View {
        VStack(alignment: .leading, spacing: 2) {
            HStack(alignment: .firstTextBaseline, spacing: 8) {
                Text(dateHeader)
                    .font(.system(size: 12, weight: .medium))
                    .foregroundColor(.primary)
                Text(weekdayHeader)
                    .font(.system(size: 12, weight: .medium))
                    .foregroundColor(.blue)
            }
            .padding(2)
            
            if courses.isEmpty {
                Spacer()
                Text("今天居然没有课")
                    .font(.system(size: 15))
                    .foregroundColor(.secondary)
                    .frame(maxWidth: .infinity, alignment: .center)
                Spacer()
            } else {
                let sortedCourses = getSortedCourses()
                ForEach(sortedCourses.prefix(2)) { course in
                    let isFinished = course.isFinished(for: course.day)
                    CourseCardView(course: course, isFinished: isFinished)
                }
                Spacer(minLength: 0)
            }
        }
        .padding(2)
        .frame(maxWidth: .infinity, maxHeight: .infinity, alignment: .topLeading)
    }
    
    private func getSortedCourses() -> [Course] {
        let unfinished = courses.filter { !$0.isFinished(for: $0.day) }
        let finished = courses.filter { $0.isFinished(for: $0.day) }
        let sortedUnfinished = unfinished.sorted { $0.startSection < $1.startSection }
        let sortedFinished = finished.sorted { $0.startSection < $1.startSection }
        return sortedUnfinished + sortedFinished
    }
}

// MARK: - Medium Widget

struct MediumWidgetView: View {
    let courses: [Course]
    
    private let courseCardHeight: CGFloat = 56
    
    var body: some View {
        let weekday = Calendar.current.component(.weekday, from: Date())
        let today = weekday == 1 ? 7 : weekday - 1
        let tomorrow = today == 7 ? 1 : today + 1
        
        let sortedTodayCourses = getSortedCourses(todayCourses)
        let sortedTomorrowCourses = tomorrowCourses.sorted { $0.startSection < $1.startSection }
        
        GeometryReader { geometry in
            let availableHeight = geometry.size.height
            let maxCourses = max(1, Int(floor(availableHeight / courseCardHeight)))
            
            HStack(alignment: .top, spacing: 6) {
                CourseColumnView(
                    title: "今天",
                    dateString: dateString(for: 0),
                    weekdayName: weekdayName(today),
                    courses: todayCourses,
                    maxCount: maxCourses,
                    gradientColors: [.purple, .blue.opacity(0.7)],
                    isToday: true,
                    todayWeekday: today
                )
                
                CourseColumnView(
                    title: "明天",
                    dateString: dateString(for: 1),
                    weekdayName: weekdayName(tomorrow),
                    courses: tomorrowCourses,
                    maxCount: maxCourses,
                    gradientColors: [.orange, .yellow.opacity(0.8)],
                    isToday: false,
                    todayWeekday: today
                )
            }
            .frame(maxWidth: .infinity, maxHeight: .infinity, alignment: .topLeading)
        }
        .padding(6)
    }
    
    private func dateString(for daysFromNow: Int) -> String {
        let date = Calendar.current.date(byAdding: .day, value: daysFromNow, to: Date()) ?? Date()
        let formatter = DateFormatter()
        formatter.locale = Locale(identifier: "zh_CN")
        formatter.dateFormat = "M月d日"
        return formatter.string(from: date)
    }
    
    private func weekdayName(_ weekday: Int) -> String {
        let names = ["", "星期一", "星期二", "星期三", "星期四", "星期五", "星期六", "星期日"]
        return names[weekday]
    }
    
    private func getSortedCourses(_ courses: [Course]) -> [Course] {
        let unfinished = courses.filter { !$0.isFinished(for: $0.day) }
        let finished = courses.filter { $0.isFinished(for: $0.day) }
        let sortedUnfinished = unfinished.sorted { $0.startSection < $1.startSection }
        let sortedFinished = finished.sorted { $0.startSection < $1.startSection }
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
    let gradientColors: [Color]
    let isToday: Bool
    let todayWeekday: Int
    
    var body: some View {
        VStack(alignment: .leading, spacing: 6) {
            HStack(alignment: .firstTextBaseline, spacing: 4) {
                Text(title)
                    .font(.system(size: 13, weight: .semibold))
                Text(dateString)
                    .font(.system(size: 11))
                    .foregroundColor(.secondary)
                Text(weekdayName)
                    .font(.system(size: 11, weight: .medium))
                    .foregroundColor(.blue)
            }
            
            if courses.isEmpty {
                Text("居然没有课")
                    .font(.system(size: 11))
                    .foregroundColor(.secondary)
                    .padding(.top, 4)
            } else {
                let displayCourses = Array(courses.prefix(maxCount))
                ForEach(displayCourses) { course in
                    let isFinished = isToday ? course.isFinished(for: todayWeekday) : false
                    CourseCardView(course: course, gradientColors: gradientColors, isFinished: isFinished)
                }
            }
        }
        .frame(maxWidth: .infinity, alignment: .leading)
    }
}

// MARK: - Course Card

struct CourseCardView: View {
    let course: Course
    var gradientColors: [Color] = [.purple, .blue.opacity(0.7)]
    let isFinished: Bool
    
    var body: some View {
        HStack(spacing: 6) {
            RoundedRectangle(cornerRadius: 2)
                .fill(
                    isFinished
                        ? LinearGradient(colors: [.gray.opacity(0.4), .gray.opacity(0.3)], startPoint: .top, endPoint: .bottom)
                        : LinearGradient(colors: gradientColors, startPoint: .top, endPoint: .bottom)
                )
                .padding(.vertical, 4)
                .frame(width: 4)
            
            VStack(alignment: .leading, spacing: 2) {
                Text(course.classname)
                    .font(.system(size: 12, weight: .bold))
                    .lineLimit(1)
                    .foregroundColor(isFinished ? .secondary : .primary)
                
                Text(course.where)
                    .font(.system(size: 10))
                    .foregroundColor(isFinished ? .secondary.opacity(0.6) : .secondary)
                    .lineLimit(1)
                
                Text(timeString(from: course.classWhen))
                    .font(.system(size: 10))
                    .foregroundColor(isFinished ? .secondary.opacity(0.6) : .secondary)
            }
            .padding(.vertical, 4)
            
            Spacer(minLength: 0)
        }
        .padding(.leading, 4)
        .frame(maxHeight: 60)
    }
    
    private func timeString(from classWhen: String) -> String {
        let parts = classWhen.split(separator: "-")
        guard let startSection = Int(parts.first ?? "1"),
              let endSection = Int(parts.last ?? "1") else {
            return classWhen
        }
        
        let sectionStartTimes: [Int: String] = [
            1: "08:00", 2: "08:55", 3: "10:10", 4: "11:05",
            5: "14:00", 6: "14:55", 7: "16:10", 8: "17:05",
            9: "18:30", 10: "19:20", 11: "20:15", 12: "21:05"
        ]
        let sectionEndTimes: [Int: String] = [
            1: "08:45", 2: "09:40", 3: "10:55", 4: "11:50",
            5: "14:45", 6: "15:40", 7: "16:55", 8: "17:50",
            9: "19:15", 10: "20:05", 11: "21:00", 12: "21:50"
        ]
        
        let startTime = sectionStartTimes[startSection] ?? "08:00"
        let endTime = sectionEndTimes[endSection] ?? "09:40"
        return "\(startTime)-\(endTime)"
    }
}

// MARK: - Large Widget

struct LargeWidgetView: View {
    let courses: [Course]
    
    private let courseCardHeight: CGFloat = 56
    
    var body: some View {
        let weekday = Calendar.current.component(.weekday, from: Date())
        let today = weekday == 1 ? 7 : weekday - 1
        let tomorrow = today == 7 ? 1 : today + 1
        
        let todayCourses = getSortedCourses(courses.filter { $0.day == today })
        let tomorrowCourses = courses.filter { $0.day == tomorrow }.sorted { $0.startSection < $1.startSection }
      
        Text("课程安排")
            .font(.system(size: 18, weight: .bold))
            .frame(maxWidth: .infinity, alignment: .leading)
            .padding(.horizontal, 6)
            .padding(.top, 12)
      
        GeometryReader { geometry in
            let availableHeight = geometry.size.height
            let maxCourses = max(1, Int(floor(availableHeight / courseCardHeight)))
            
          
            HStack(alignment: .top, spacing: 6) {
                CourseColumnView(
                    title: "今天",
                    dateString: dateString(for: 0),
                    weekdayName: weekdayName(today),
                    courses: todayCourses,
                    maxCount: maxCourses,
                    gradientColors: [.purple, .blue.opacity(0.7)],
                    isToday: true,
                    todayWeekday: today
                )
                
                CourseColumnView(
                    title: "明天",
                    dateString: dateString(for: 1),
                    weekdayName: weekdayName(tomorrow),
                    courses: tomorrowCourses,
                    maxCount: maxCourses,
                    gradientColors: [.orange, .yellow.opacity(0.8)],
                    isToday: false,
                    todayWeekday: today
                )
            }
            .frame(maxWidth: .infinity, maxHeight: .infinity, alignment: .topLeading)
        }
        .padding(6)
    }
    
    private func dateString(for daysFromNow: Int) -> String {
        let date = Calendar.current.date(byAdding: .day, value: daysFromNow, to: Date()) ?? Date()
        let formatter = DateFormatter()
        formatter.locale = Locale(identifier: "zh_CN")
        formatter.dateFormat = "M月d日"
        return formatter.string(from: date)
    }
    
    private func weekdayName(_ weekday: Int) -> String {
        let names = ["", "星期一", "星期二", "星期三", "星期四", "星期五", "星期六", "星期日"]
        return names[weekday]
    }
    
    private func getSortedCourses(_ courses: [Course]) -> [Course] {
        let unfinished = courses.filter { !$0.isFinished(for: $0.day) }
        let finished = courses.filter { $0.isFinished(for: $0.day) }
        let sortedUnfinished = unfinished.sorted { $0.startSection < $1.startSection }
        let sortedFinished = finished.sorted { $0.startSection < $1.startSection }
        return sortedUnfinished + sortedFinished
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
    CourseEntry(date: .now, courses: previewCourses(), todayWeek: 1, tomorrowWeek: 1)
}

#Preview("Medium", as: .systemMedium) {
    widget()
} timeline: {
    CourseEntry(date: .now, courses: previewCourses(), todayWeek: 1, tomorrowWeek: 1)
}

#Preview("Large", as: .systemLarge) {
    widget()
} timeline: {
    CourseEntry(date: .now, courses: previewCourses(), todayWeek: 1, tomorrowWeek: 1)
}

func previewCourses() -> [Course] {
    let weekday = Calendar.current.component(.weekday, from: Date())
    let today = weekday == 1 ? 7 : weekday - 1
    let tomorrow = today == 7 ? 1 : today + 1
    
    return [
        Course(id: "1", classname: "高等数学", teacher: "张老师", where: "n201", day: today,
               classWhen: "9-10", weeksString: "[1,2,3,4,5]", credit: 4, isOfficialInt: 1,
               note: "", semester: "1", weekDuration: "1-15周", year: "2025"),
        Course(id: "2", classname: "大学英语", teacher: "李老师", where: "n305", day: today,
               classWhen: "3-4", weeksString: "[1,2,3,4,5]", credit: 2, isOfficialInt: 1,
               note: "", semester: "1", weekDuration: "1-15周", year: "2025"),
        Course(id: "3", classname: "数据结构", teacher: "王老师", where: "n526", day: tomorrow,
               classWhen: "1-2", weeksString: "[1,2,3,4,5]", credit: 4, isOfficialInt: 1,
               note: "", semester: "1", weekDuration: "1-15周", year: "2025")
    ]
}
