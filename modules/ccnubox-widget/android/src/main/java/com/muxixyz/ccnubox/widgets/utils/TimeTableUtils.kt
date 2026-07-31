package com.muxixyz.ccnubox.widgets.utils

import android.content.Context
import com.muxixyz.ccnubox.widgets.CcnuboxWidgetModule
import com.muxixyz.ccnubox.widgets.CourseInfo
import org.json.JSONArray
import java.util.Calendar

object TimeTableUtils {
    private val sectionStartMinutes = mapOf(
        1 to 8 * 60L,
        2 to 8 * 60L + 55,
        3 to 10 * 60L + 10,
        4 to 11 * 60L + 5,
        5 to 14 * 60L,
        6 to 14 * 60L + 55,
        7 to 16 * 60L + 10,
        8 to 17 * 60L + 5,
        9 to 18 * 60L + 30,
        10 to 19 * 60L + 20,
        11 to 20 * 60L + 15,
        12 to 21 * 60L + 5
    )

    private const val DEFAULT_DURATION = 45L

    fun getDateString(): String {
        val calendar = Calendar.getInstance()
        val month = calendar.get(Calendar.MONTH) + 1
        val day = calendar.get(Calendar.DAY_OF_MONTH)
        return "${month}月${day}日"
    }

    fun getWeekday(): Int {
        val dayOfWeek = Calendar.getInstance().get(Calendar.DAY_OF_WEEK)
        return if (dayOfWeek == Calendar.SUNDAY) 7 else dayOfWeek - 1
    }

    fun weekdayIntToString(number: Int): String {
        val digits = listOf("零", "一", "二", "三", "四", "五", "六", "日")
        return digits[number]
    }

    fun getTodayCourses(context: Context): List<CourseInfo> {
        val preferences = context.getSharedPreferences(
            CcnuboxWidgetModule.WIDGET_PREFERENCES,
            Context.MODE_PRIVATE
        )
        val storedCourses = preferences.getString("all_courses", null)
            ?: return emptyList()
        val currentWeek = preferences.getString("current_week", null)
            ?.toIntOrNull()
            ?: return emptyList()

        if (currentWeek !in 1..20) return emptyList()

        val weekday = getWeekday()
        val now = Calendar.getInstance()
        val currentMinutes =
            now.get(Calendar.HOUR_OF_DAY) * 60 + now.get(Calendar.MINUTE)
        val result = mutableListOf<CourseInfo>()
        val courses = JSONArray(storedCourses)

        for (index in 0 until courses.length()) {
            val course = courses.getJSONObject(index)
            val courseWeekday = course.getInt("weekday")
            if (courseWeekday != weekday) continue

            val weekBitMask = course.getInt("weekBitMask")
            val weekIndex = currentWeek - 1
            val isThisWeek =
                weekIndex in 0..31 && ((weekBitMask ushr weekIndex) and 1) == 1
            if (!isThisWeek) continue

            val startPeriod = course.getInt("startPeriod")
            val endPeriod = course.getInt("endPeriod")
            val endMinutes = getStartMinuteOfSection(endPeriod) + DEFAULT_DURATION
            if (currentMinutes >= endMinutes) continue

            result.add(
                CourseInfo(
                    name = course.getString("name"),
                    weekday = courseWeekday,
                    startPeriod = startPeriod,
                    endPeriod = endPeriod,
                    teacher = course.getString("teacher"),
                    location = course.getString("location"),
                    weekBitMask = weekBitMask
                )
            )
        }

        return result.sortedBy { it.startPeriod }
    }

    fun getSectionTimeRange(startSection: Int, endSection: Int): String {
        val start = getStartMinuteOfSection(startSection)
        val end = getStartMinuteOfSection(endSection) + DEFAULT_DURATION
        return "${formatMinutes(start)}-${formatMinutes(end)}"
    }

    private fun getStartMinuteOfSection(section: Int): Long =
        sectionStartMinutes[section]
            ?: throw IllegalArgumentException("无效的节数: $section")

    private fun formatMinutes(minutes: Long): String {
        val hour = minutes / 60
        val minute = minutes % 60
        return String.format("%02d:%02d", hour, minute)
    }
}
