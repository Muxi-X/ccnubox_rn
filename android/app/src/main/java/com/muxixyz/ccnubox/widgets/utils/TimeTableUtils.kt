package com.muxixyz.ccnubox.widgets.utils

import android.content.Context
import android.util.Log
import com.muxixyz.ccnubox.widgets.CourseInfo
import org.json.JSONArray
import java.util.Calendar

object TimeTableUtils {

    //学期第一天早上八点的Unix时间戳
//    private var startTimestamp = 1739721600L

    //每节课的开始时间是一天中的第几分钟
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

    //每节课持续时间 有生之年应该不会改了
    private const val DEFAULT_DURATION = 45L

//    public fun setStartTimeStamp(startTimestamp: Long) {
//        this.startTimestamp = startTimestamp;
//    }

    public fun getDateString(): String {
        val calendar = Calendar.getInstance()
        val month = calendar.get(Calendar.MONTH) + 1 // 月份从 0 开始，所以要 +1
        val day = calendar.get(Calendar.DAY_OF_MONTH)
        return "${month}月${day}日"
    }

    public fun getWeekday(): Int {
        val calendar = Calendar.getInstance()
        // 注意：Calendar.DAY_OF_WEEK 返回的是 1~7（周日是1，周一是2...）
        val dayOfWeek = calendar.get(Calendar.DAY_OF_WEEK)

        // 如果你希望返回 1 = 周一，7 = 周日（更贴合中国习惯）：
        return if (dayOfWeek == Calendar.SUNDAY) 7 else dayOfWeek - 1
    }


    fun weekIntToString(num: Int): String {
        val digits = listOf("零", "一", "二", "三", "四", "五", "六", "七", "八", "九")

        return when (num) {
            in 0..9 -> digits[num]
            10 -> "十"
            in 11..19 -> "十" + digits[num % 10]
            20 -> "二十"
            else -> throw IllegalArgumentException("只支持 0 到 20 之间的数字")
        }
    }

    fun weekdayIntToString(num: Int): String {
        val digits = listOf("零", "一", "二", "三", "四", "五", "六", "日")

        return digits[num]
    }


//    fun getWeek(): Int {
//        val now = System.currentTimeMillis()
//        val startMillis = startTimestamp * 1000 // 时间戳是秒，转成毫秒
//        if (now < startMillis) return 0 // 开学前
//
//        val diff = now - startMillis
//        val weekMillis = 7 * 24 * 60 * 60 * 1000L
//        return (diff / weekMillis).toInt() + 1 // 从第1周开始
//    }


    fun getTodayCourses(context: Context): List<CourseInfo> {
        val weekday = getWeekday()
        val sp = context.getSharedPreferences("WidgetData", Context.MODE_PRIVATE)
        val stored = sp.getString("all_courses", null) ?: return emptyList()

        val currentWeek = sp.getString("current_week", null)?.toIntOrNull() ?: return emptyList()

        Log.d("stored", stored)

        val result = mutableListOf<CourseInfo>()

        // 当前时间（分钟）
        val now = Calendar.getInstance()
        val currentMinutes = now.get(Calendar.HOUR_OF_DAY) * 60 + now.get(Calendar.MINUTE)

        try {
            val array = JSONArray(stored)
            for (i in 0 until array.length()) {
                val obj = array.getJSONObject(i)

                val courseWeekday = obj.getInt("weekday")
                if (courseWeekday != weekday) continue

                val bitmask = obj.getInt("weekBitMask")
                if (((bitmask shr (currentWeek - 1)) and 1) == 1) {
                    val startPeriod = obj.getInt("startPeriod")
                    val endPeriod = obj.getInt("endPeriod")

                    // 判断是否课程还没结束
                    val endMinutes = getStartMinuteOfSection(endPeriod).plus(45)
                    if (currentMinutes < endMinutes) {
                        val course = CourseInfo(
                            name = obj.getString("name"),
                            weekday = courseWeekday,
                            startPeriod = startPeriod,
                            endPeriod = endPeriod,
                            teacher = obj.getString("teacher"),
                            location = obj.getString("location"),
                            weekBitMask = bitmask
                        )
                        result.add(course)
                        Log.d("TAG", "course:${course}")
                    }
                }
            }
        } catch (e: Exception) {
            e.printStackTrace()
        }
        Log.d("result", result.toString())

        // 排序 + 取前两个未结束的课程
        return result.sortedBy { it.startPeriod }
    }

    /**
     * 返回节数区间的时间段字符串，例如：1, 2 -> "08:00-09:40"
     */
    fun getSectionTimeRange(startSection: Int, endSection: Int): String {
        val start = getStartMinuteOfSection(startSection)
        val end = getStartMinuteOfSection(endSection) + DEFAULT_DURATION

        return "${formatMinutes(start)}-${formatMinutes(end)}"
    }

    private fun getStartMinuteOfSection(section: Int): Long {
        return sectionStartMinutes[section]
            ?: throw IllegalArgumentException("无效的节数: $section")
    }

    private fun formatMinutes(minutes: Long): String {
        val hour = minutes / 60
        val min = minutes % 60
        return String.format("%02d:%02d", hour, min)
    }

}
