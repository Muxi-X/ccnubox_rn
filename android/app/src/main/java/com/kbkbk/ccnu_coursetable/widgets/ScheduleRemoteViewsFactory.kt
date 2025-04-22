package com.kbkbk.ccnu_coursetable.widgets

import android.content.Context
import android.util.Log
import android.widget.RemoteViews
import android.widget.RemoteViewsService
import com.kbkbk.ccnu_coursetable.R
import com.kbkbk.ccnu_coursetable.Utils.TimeTableUtils
import com.kbkbk.ccnu_coursetable.widgets.module.CourseInfo

class ScheduleRemoteViewsFactory(private val context: Context) : RemoteViewsService.RemoteViewsFactory {

    private val todayCourses = mutableListOf<CourseInfo>()

    override fun onCreate() {
        loadData()
    }

    override fun onDataSetChanged() {
        loadData()
    }

    private fun loadData() {
        todayCourses.clear()
        todayCourses.addAll(TimeTableUtils.getTodayCourses(context))
    }

    override fun getCount(): Int = todayCourses.size

    override fun getViewAt(position: Int): RemoteViews? {
        if (todayCourses.isEmpty()||position !in todayCourses.indices)return null
        val course = todayCourses[position]
        Log.d("course",course.toString())
        return RemoteViews(context.packageName, R.layout.item_course).apply {
            setTextViewText(R.id.course_name, course.name)
            setTextViewText(R.id.course_location,course.location)
            setTextViewText(R.id.course_time, TimeTableUtils.getSectionTimeRange(course.startPeriod,course.endPeriod))
        }
    }

    override fun getLoadingView(): RemoteViews? = null
    override fun getViewTypeCount(): Int = 1
    override fun getItemId(position: Int): Long = position.toLong()
    override fun hasStableIds(): Boolean = true
    override fun onDestroy() {}
}
