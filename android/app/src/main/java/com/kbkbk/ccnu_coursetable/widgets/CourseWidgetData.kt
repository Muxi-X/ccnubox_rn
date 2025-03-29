package com.kbkbk.ccnu_coursetable.widgets



data class CourseWidgetData(
    val date:String,
    val courses:List<CourseType>
)
data class CourseType(
    val classWhen: String,       // 上课时间
    val classname: String,       // 课程名称
    val credit: Int,             // 学分
    val day: Int,                // 星期几
    val id: String,              // 课程 ID
    val semester: String,        // 学期
    val teacher: String,         // 教师姓名
    val weekDuration: String,    // 周次范围（如第几周到第几周）
    val weeks: List<Int>,        // 上课的具体周次列表
    val where: String,           // 上课地点
    val year: String             // 学年
)

//下面这些暂时用不上
// 定义课程表属性接口
data class CourseTableProps(
    val data: List<CourseType>,                           // 课程列表
    val currentWeek: Int,                                 // 当前周次
    val onTimetableRefresh: (forceRefresh: Boolean) -> Unit // 刷新课程表方法
)

// 定义课程中间类型，比 CourseType 多了 rowIndex 和 colIndex
data class CourseTransferType(
    val id: String,           // 课程 ID
    val courseName: String,   // 课程名称
    val teacher: String,      // 教师
    val classroom: String,    // 教室
    val timeSpan: Int,        // 课程时间跨度
    val rowIndex: Int,        // 行索引
    val colIndex: Int,        // 列索引
    val date: String,         // 日期
    val isThisWeek: Boolean   // 是否本周课程
)
