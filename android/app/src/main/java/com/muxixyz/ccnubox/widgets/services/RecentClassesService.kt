package com.muxixyz.ccnubox.widgets.services

import android.content.Intent
import android.widget.RemoteViewsService
import com.muxixyz.ccnubox.widgets.ScheduleRemoteViewsFactory

class RecentClassesService : RemoteViewsService() {
    override fun onGetViewFactory(intent: Intent): RemoteViewsFactory {
        return ScheduleRemoteViewsFactory(applicationContext, intent.getStringExtra("widget_type") ?: "2x2")
    }
}