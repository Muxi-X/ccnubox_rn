package com.kbkbk.ccnu_coursetable.widgets

import android.appwidget.AppWidgetManager
import android.appwidget.AppWidgetProvider
import android.content.Context
import android.widget.RemoteViews
import com.kbkbk.ccnu_coursetable.R
import java.text.SimpleDateFormat
import java.util.Date
import java.util.Locale

class DailyCourseWidgetProvider : AppWidgetProvider() {
    override fun onUpdate(
        context: Context,
        appWidgetManager: AppWidgetManager,
        appWidgetIds: IntArray
    ) {
        for (appWidgetId in appWidgetIds) {
            updateAppWidget(context, appWidgetManager, appWidgetId)
        }
    }

    private fun updateAppWidget(
        context: Context,
        appWidgetManager: AppWidgetManager,
        appWidgetId: Int
    ) {
        val views = RemoteViews(context.packageName, R.layout.daily_course_widget)

        //getData
        //bind

        appWidgetManager.updateAppWidget(appWidgetId, views)
    }

    //搞一些测试数据 后面改成检索符合条件的数据
    public fun getData(): CourseWidgetData {
        val courseWidgetData = CourseWidgetData(
            date = SimpleDateFormat("yyyy年MM月dd日", Locale.getDefault()).format(Date()),
            courses = listOf(
                CourseType(
                    classWhen = "8:00-9:35",
                    classname = "高等数学",
                    credit = 4,
                    day = 1,
                    id = "MATH101",
                    semester = "2024-2025第一学期",
                    teacher = "张三",
                    weekDuration = "第1-16周",
                    weeks = listOf(1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16),
                    where = "教学楼101",
                    year = "2024-2025"
                ),
                CourseType(
                    classWhen = "10:05-11:40",
                    classname = "大学英语",
                    credit = 3,
                    day = 3,
                    id = "ENG102",
                    semester = "2024-2025第一学期",
                    teacher = "李四",
                    weekDuration = "第1-16周",
                    weeks = listOf(1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16),
                    where = "教学楼202",
                    year = "2024-2025"
                ),
                CourseType(
                    classWhen = "14:00-15:35",
                    classname = "程序设计",
                    credit = 4,
                    day = 5,
                    id = "CS103",
                    semester = "2024-2025第一学期",
                    teacher = "王五",
                    weekDuration = "第2-14周",
                    weeks = listOf(2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14),
                    where = "实验楼303",
                    year = "2024-2025"
                ),
                CourseType(
                    classWhen = "16:00-17:35",
                    classname = "数据结构",
                    credit = 3,
                    day = 2,
                    id = "CS201",
                    semester = "2024-2025第二学期",
                    teacher = "赵六",
                    weekDuration = "第3-18周",
                    weeks = listOf(3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18),
                    where = "实验楼202",
                    year = "2024-2025"
                )
            )
        )
        return courseWidgetData
    }
}