package com.muxixyz.ccnubox.widgets.providers

import android.app.PendingIntent
import android.appwidget.AppWidgetManager
import android.appwidget.AppWidgetProvider
import android.content.ComponentName
import android.content.Context
import android.content.Intent
import android.util.Log
import android.widget.RemoteViews
import androidx.core.net.toUri
import com.muxixyz.ccnubox.R
import com.muxixyz.ccnubox.widgets.utils.TimeTableUtils
import com.muxixyz.ccnubox.widgets.services.RecentClassesService

class RecentClassesProvider4x2 : AppWidgetProvider() {
    override fun onReceive(context: Context, intent: Intent) {
        super.onReceive(context, intent)
        val action = intent.action

        if (action == Intent.ACTION_TIME_CHANGED ||
            action == AppWidgetManager.ACTION_APPWIDGET_UPDATE ||
            action == "com.muxixyz.ccnubox.UPDATE_COURSE_WIDGET" ||
            action == "com.muxixyz.ccnubox.ACTION_WIDGET_CLICK" // 新增点击事件处理
        ) {
            Log.d("4x2action",action)
            updateWidgetData(context)
        }
    }

    override fun onUpdate(context: Context, appWidgetManager: AppWidgetManager, appWidgetIds: IntArray) {
        super.onUpdate(context, appWidgetManager, appWidgetIds)
        updateWidgetData(context)
    }

    private fun updateWidgetData(context: Context) {
        val appWidgetManager = AppWidgetManager.getInstance(context)
        val componentName = ComponentName(context, RecentClassesProvider4x2::class.java)
        val appWidgetIds = appWidgetManager.getAppWidgetIds(componentName)

        val views = RemoteViews(context.packageName, R.layout.recent_classes_widget_2x2)

        val weekday = TimeTableUtils.getWeekday()
        views.setTextViewText(R.id.date_in_year, TimeTableUtils.getDateString())
        views.setTextViewText(R.id.date_in_week,"星期"+TimeTableUtils.weekdayIntToString(weekday))

        val serviceIntent = Intent(context, RecentClassesService::class.java).apply {
            putExtra("widget_type", "4x2")
            data = toUri(Intent.URI_INTENT_SCHEME).toUri()
        }
        views.setRemoteAdapter(R.id.lv, serviceIntent)
        views.setEmptyView(R.id.lv, R.id.layout_empty)

        // 设置点击事件
        val clickIntent = Intent(context, RecentClassesProvider4x2::class.java).apply {
            action = "com.muxixyz.ccnubox.ACTION_WIDGET_CLICK"
        }
        val clickPendingIntent = PendingIntent.getBroadcast(
            context,
            0,
            clickIntent,
            PendingIntent.FLAG_UPDATE_CURRENT or PendingIntent.FLAG_IMMUTABLE
        )
        views.setOnClickPendingIntent(R.id.layout_root, clickPendingIntent)

        appWidgetManager.notifyAppWidgetViewDataChanged(appWidgetIds, R.id.lv)
        appWidgetManager.updateAppWidget(appWidgetIds, views)
    }
}