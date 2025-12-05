package com.muxixyz.ccnubox.widgets.utils

import android.content.Context
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

    fun getDateString(offsetDays: Int = 0): String {
        val calendar = Calendar.getInstance()
        if (offsetDays != 0) {
            calendar.add(Calendar.DAY_OF_YEAR, offsetDays)
        }
        val month = calendar.get(Calendar.MONTH) + 1 // 月份从 0 开始，所以要 +1
        val day = calendar.get(Calendar.DAY_OF_MONTH)
        return "${month}月${day}日"
    }

    fun getWeekday(offsetDays: Int = 0): Int {
        val calendar = Calendar.getInstance()
        if (offsetDays != 0) {
            calendar.add(Calendar.DAY_OF_YEAR, offsetDays)
        }
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
        // 兼容旧接口：今天 + 仅未下课课程
        return getCoursesForDay(context, dayOffset = 0, onlyUpcoming = true)
    }

    /**
     * 获取指定天的课程列表。
     *
     * @param dayOffset 0 表示今天，1 表示明天，-1 表示昨天，以此类推
     * @param onlyUpcoming true 表示只返回「尚未下课」的课程（仅对今天有意义），false 表示返回当天所有课程
     */
    fun getCoursesForDay(
        context: Context,
        dayOffset: Int,
        onlyUpcoming: Boolean
    ): List<CourseInfo> {
        // 基于当前星期几计算目标天的星期几（1=周一 ... 7=周日）
        val todayWeekday = getWeekday()
        val weekday = ((todayWeekday - 1 + dayOffset).floorMod(7)) + 1

        val sp = context.getSharedPreferences("WidgetData", Context.MODE_PRIVATE)
        val stored = sp.getString("all_courses", null) ?: return emptyList()

        val currentWeek = sp.getString("current_week", null)?.toIntOrNull() ?: return emptyList()
        
        // 验证当前周数是否在合理范围内（1-20周）
        if (currentWeek < 1 || currentWeek > 20) {
            return emptyList()
        }

        val result = mutableListOf<CourseInfo>()

        // 当前时间（分钟），仅在需要过滤「未结束课程」时才使用
        val now = Calendar.getInstance()
        val currentMinutes = now.get(Calendar.HOUR_OF_DAY) * 60 + now.get(Calendar.MINUTE)

        try {
            val array = JSONArray(stored)
            for (i in 0 until array.length()) {
                val obj = array.getJSONObject(i)

                val courseWeekday = obj.getInt("weekday")
                if (courseWeekday != weekday) continue

                val bitmask = obj.getInt("weekBitMask")
                
                // 检查当前周是否在课程的周数范围内
                // weekBitMask 是一个位掩码，第 0 位代表第 1 周，第 1 位代表第 2 周，以此类推
                // 例如：如果课程只在第 1 周有，位掩码是 1 (0b0001)，第 0 位是 1
                //      如果课程只在第 2 周有，位掩码是 2 (0b0010)，第 1 位是 1
                //      如果课程在第 1 和第 2 周都有，位掩码是 3 (0b0011)，第 0 位和第 1 位都是 1
                // 我们需要检查第 (currentWeek - 1) 位是否为 1
                val weekIndex = currentWeek - 1
                
                // 严格检查：只有当位掩码中对应周的位置为 1 时才显示
                // 使用无符号右移避免符号扩展问题，并确保检查的是正确的位
                val isThisWeek = if (weekIndex >= 0 && weekIndex < 32) {
                    ((bitmask ushr weekIndex) and 1) == 1
                } else {
                    false
                }
                
                // 只添加当前周有效的课程
                if (isThisWeek) {
                    val startPeriod = obj.getInt("startPeriod")
                    val endPeriod = obj.getInt("endPeriod")

                    val shouldAdd = if (onlyUpcoming && dayOffset == 0) {
                        // 仅今天需要根据当前时间过滤「未结束」课程
                        val endMinutes = getStartMinuteOfSection(endPeriod).plus(DEFAULT_DURATION)
                        currentMinutes < endMinutes
                    } else {
                        true
                    }

                    if (shouldAdd) {
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
                    }
                }
            }
        } catch (e: Exception) {
            e.printStackTrace()
        }

        // 按节次排序
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

    internal fun getStartMinuteOfSection(section: Int): Long {
        return sectionStartMinutes[section]
            ?: throw IllegalArgumentException("无效的节数: $section")
    }

    /**
     * Int 的取模运算，始终返回非负结果
     */
    private fun Int.floorMod(mod: Int): Int {
        val r = this % mod
        return if (r < 0) r + mod else r
    }

    private fun formatMinutes(minutes: Long): String {
        val hour = minutes / 60
        val min = minutes % 60
        return String.format("%02d:%02d", hour, min)
    }

}
