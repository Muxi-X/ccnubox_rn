package com.muxixyz.ccnubox.widgets

import android.app.PendingIntent
import android.content.Context
import android.util.Log
import android.widget.RemoteViews
import android.widget.RemoteViewsService
import com.muxixyz.ccnubox.widgets.utils.TimeTableUtils

class ScheduleRemoteViewsFactory(
    private val context: Context
) : RemoteViewsService.RemoteViewsFactory {
    private val todayCourses = mutableListOf<CourseInfo>()

    override fun onCreate() = loadData()

    override fun onDataSetChanged() = loadData()

    override fun onDestroy() {
        todayCourses.clear()
    }

    private fun loadData() {
        val courses = TimeTableUtils.getTodayCourses(context)
        if (courses == todayCourses) return

        todayCourses.clear()
        todayCourses.addAll(courses)
        Log.d("CcnuboxWidget", "Loaded ${courses.size} courses")
    }

    override fun getCount(): Int = todayCourses.size

    override fun getViewAt(position: Int): RemoteViews? {
        if (position !in todayCourses.indices) return null

        val course = todayCourses[position]
        val clickPendingIntent = PendingIntent.getActivity(
            context,
            0,
            WidgetIntents.openSchedule(context),
            PendingIntent.FLAG_UPDATE_CURRENT or PendingIntent.FLAG_IMMUTABLE
        )

        return RemoteViews(context.packageName, R.layout.item_course).apply {
            setTextViewText(R.id.course_name, course.name)
            setTextViewText(R.id.course_location, course.location)
            setTextViewText(
                R.id.course_time,
                TimeTableUtils.getSectionTimeRange(
                    course.startPeriod,
                    course.endPeriod
                )
            )
            setOnClickPendingIntent(R.id.course_container, clickPendingIntent)
        }
    }

    override fun getLoadingView(): RemoteViews? = null

    override fun getViewTypeCount(): Int = 1

    override fun getItemId(position: Int): Long = position.toLong()

    override fun hasStableIds(): Boolean = true
}
