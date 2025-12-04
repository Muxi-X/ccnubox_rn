package com.muxixyz.ccnubox.widgets.services

import android.content.Intent
import android.widget.RemoteViewsService
import com.muxixyz.ccnubox.widgets.ScheduleRemoteViewsFactory

class RecentClassesService : RemoteViewsService() {
    override fun onGetViewFactory(intent: Intent): RemoteViewsFactory {
        val widgetType = intent.getStringExtra("widget_type") ?: "2x2"
        val dayOffset = intent.getIntExtra("day_offset", 0)
        val onlyUpcoming = intent.getBooleanExtra("only_upcoming", true)
        return ScheduleRemoteViewsFactory(applicationContext, widgetType, dayOffset, onlyUpcoming)
    }
}