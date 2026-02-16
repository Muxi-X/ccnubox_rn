package com.muxixyz.ccnubox.widgets

import android.app.PendingIntent
import android.content.Context
import android.content.Intent
import android.util.Log
import android.widget.RemoteViews
import android.widget.RemoteViewsService
import com.muxixyz.ccnubox.R
import com.muxixyz.ccnubox.widgets.utils.TimeTableUtils
import com.muxixyz.ccnubox.widgets.providers.RecentClassesProvider2x2
import com.muxixyz.ccnubox.widgets.providers.RecentClassesProvider4x2

class ScheduleRemoteViewsFactory(
    private val context: Context,
    private val widgetType: String,
    private val dayOffset: Int,
    private val onlyUpcoming: Boolean
) : RemoteViewsService.RemoteViewsFactory {

    private val courses = mutableListOf<CourseInfo>()

    override fun onCreate() {
        loadData()
    }

    override fun onDataSetChanged() {
        loadData()
    }

    override fun onDestroy() {
        courses.clear()
    }

    private fun loadData() {
        val temp = if (dayOffset == 0 && onlyUpcoming) {
            // 兼容原有行为：仅今天 & 未结束课程
            TimeTableUtils.getTodayCourses(context)
        } else {
            TimeTableUtils.getCoursesForDay(context, dayOffset, onlyUpcoming)
        }
        Log.d("ScheduleFactoryTemp", "widgetType=$widgetType, dayOffset=$dayOffset, onlyUpcoming=$onlyUpcoming, courses=$temp")
        if (temp == courses) return
        courses.clear()
        courses.addAll(temp)
        Log.d("ScheduleFactoryCourses", courses.toString())
    }

    override fun getCount(): Int = courses.size

    override fun getViewAt(position: Int): RemoteViews? {
        if (courses.isEmpty() || position !in courses.indices) return null
        val course = courses[position]
        Log.d("ScheduleFactoryItem", course.toString())
        val clickIntent = Intent(context, when (widgetType) {
            "2x2" -> RecentClassesProvider2x2::class.java
            "4x2" -> RecentClassesProvider4x2::class.java
            "two_day" -> RecentClassesProvider4x2::class.java
            else -> RecentClassesProvider2x2::class.java // 默认值
        }).apply {
            action = "com.muxixyz.ccnubox.ACTION_WIDGET_CLICK"
        }
        val clickPendingIntent = PendingIntent.getBroadcast(
            context,
            0,
            clickIntent,
            PendingIntent.FLAG_UPDATE_CURRENT or PendingIntent.FLAG_IMMUTABLE
        )
        val itemLayout = when {
            widgetType == "two_day" && dayOffset == 0 -> R.layout.item_course_today
            widgetType == "two_day" && dayOffset != 0 -> R.layout.item_course_tomorrow
            else -> R.layout.item_course
        }

        return RemoteViews(context.packageName, itemLayout).apply {
            setTextViewText(R.id.course_name, course.name)
            setTextViewText(R.id.course_location,course.location)
            setTextViewText(R.id.course_time, TimeTableUtils.getSectionTimeRange(course.startPeriod,course.endPeriod))
            setOnClickPendingIntent(R.id.course_container,clickPendingIntent)
        }
    }

    override fun getLoadingView(): RemoteViews? = null
    override fun getViewTypeCount(): Int = 1
    override fun getItemId(position: Int): Long = position.toLong()
    override fun hasStableIds(): Boolean = true

}