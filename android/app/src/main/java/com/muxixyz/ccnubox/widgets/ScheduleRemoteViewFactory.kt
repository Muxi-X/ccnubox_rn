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

class ScheduleRemoteViewsFactory(private val context: Context, val widgetType: String) : RemoteViewsService.RemoteViewsFactory {

    private val todayCourses = mutableListOf<CourseInfo>()

    override fun onCreate() {
        loadData()
    }

    override fun onDataSetChanged() {
        loadData()
    }

    override fun onDestroy() {
        todayCourses.clear()
    }

    private fun loadData() {
        val temp=TimeTableUtils.getTodayCourses(context)
        Log.d("temp", temp.toString())
        if(temp == todayCourses) return
        todayCourses.clear()
        todayCourses.addAll(temp)
        Log.d("course", todayCourses.toString())
    }

    override fun getCount(): Int = todayCourses.size

    override fun getViewAt(position: Int): RemoteViews? {
        if (todayCourses.isEmpty()||position !in todayCourses.indices)return null
        val course = todayCourses[position]
        Log.d("course",course.toString())
        val clickIntent = Intent(context, when (widgetType) {
            "2x2" -> RecentClassesProvider2x2::class.java
            "4x2" -> RecentClassesProvider4x2::class.java
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
        return RemoteViews(context.packageName, R.layout.item_course).apply {
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