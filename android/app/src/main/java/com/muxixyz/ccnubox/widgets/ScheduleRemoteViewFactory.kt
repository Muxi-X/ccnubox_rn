package com.muxixyz.ccnubox.widgets

import android.app.PendingIntent
import android.content.Context
import android.content.Intent
import android.util.Log
import android.widget.RemoteViews
import android.widget.RemoteViewsService
import com.muxixyz.ccnubox.R
import com.muxixyz.ccnubox.widgets.utils.TimeTableUtils
import com.muxixyz.ccnubox.widgets.CourseInfo
import com.muxixyz.ccnubox.widgets.providers.RecentClassesProvider

class ScheduleRemoteViewsFactory(private val context: Context) : RemoteViewsService.RemoteViewsFactory {

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
        if(temp == todayCourses) return
        todayCourses.clear()
        todayCourses.addAll(temp)
    }

    override fun getCount(): Int = todayCourses.size

    override fun getViewAt(position: Int): RemoteViews? {
        if (todayCourses.isEmpty()||position !in todayCourses.indices)return null
        val course = todayCourses[position]
        Log.d("course",course.toString())
        val clickIntent = Intent(context, RecentClassesProvider::class.java).apply {
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