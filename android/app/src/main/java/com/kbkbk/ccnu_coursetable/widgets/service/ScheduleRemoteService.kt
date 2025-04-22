package com.kbkbk.ccnu_coursetable.widgets.service

import android.content.Intent
import android.widget.RemoteViewsService
import com.kbkbk.ccnu_coursetable.widgets.ScheduleRemoteViewsFactory

class ScheduleRemoteService : RemoteViewsService() {
    override fun onGetViewFactory(intent: Intent): RemoteViewsFactory {
        return ScheduleRemoteViewsFactory(applicationContext)
    }
}
