package com.muxixyz.ccnubox.widgets.providers

import android.app.PendingIntent
import android.appwidget.AppWidgetManager
import android.appwidget.AppWidgetProvider
import android.content.ComponentName
import android.content.Context
import android.content.Intent
import android.widget.RemoteViews
import androidx.core.net.toUri
import com.muxixyz.ccnubox.R
import com.muxixyz.ccnubox.widgets.services.RecentClassesService
import com.muxixyz.ccnubox.widgets.utils.TimeTableUtils

class TwoDayClassesProvider4x2 : AppWidgetProvider() {

    override fun onReceive(context: Context, intent: Intent) {
        super.onReceive(context, intent)
        val action = intent.action
        if (action == Intent.ACTION_TIME_CHANGED ||
            action == AppWidgetManager.ACTION_APPWIDGET_UPDATE ||
            action == "com.muxixyz.ccnubox.UPDATE_COURSE_WIDGET" ||
            action == "com.muxixyz.ccnubox.ACTION_WIDGET_CLICK"
        ) {
            updateWidgetData(context)
        }
    }

    override fun onUpdate(
        context: Context,
        appWidgetManager: AppWidgetManager,
        appWidgetIds: IntArray
    ) {
        super.onUpdate(context, appWidgetManager, appWidgetIds)
        updateWidgetData(context)
    }

    private fun updateWidgetData(context: Context) {
        val appWidgetManager = AppWidgetManager.getInstance(context)
        val componentName = ComponentName(context, TwoDayClassesProvider4x2::class.java)
        val appWidgetIds = appWidgetManager.getAppWidgetIds(componentName)

        val views = RemoteViews(context.packageName, R.layout.two_day_classes_widget_4x2)

        // 今天
        val weekdayToday = TimeTableUtils.getWeekday(0)
        views.setTextViewText(R.id.date_today, TimeTableUtils.getDateString(0))
        views.setTextViewText(
            R.id.weekday_today,
            "星期" + TimeTableUtils.weekdayIntToString(weekdayToday)
        )

        // 明天
        val weekdayTomorrow = TimeTableUtils.getWeekday(1)
        views.setTextViewText(R.id.date_tomorrow, TimeTableUtils.getDateString(1))
        views.setTextViewText(
            R.id.weekday_tomorrow,
            "星期" + TimeTableUtils.weekdayIntToString(weekdayTomorrow)
        )

        // 今天列表：仅未下课课程
        val todayIntent = Intent(context, RecentClassesService::class.java).apply {
            putExtra("widget_type", "two_day")
            putExtra("day_offset", 0)
            putExtra("only_upcoming", true)
            data = toUri(Intent.URI_INTENT_SCHEME).toUri()
        }
        views.setRemoteAdapter(R.id.lv_today, todayIntent)
        views.setEmptyView(R.id.lv_today, R.id.layout_empty_today)

        // 明天列表：全天课程
        val tomorrowIntent = Intent(context, RecentClassesService::class.java).apply {
            putExtra("widget_type", "two_day")
            putExtra("day_offset", 1)
            putExtra("only_upcoming", false)
            data = toUri(Intent.URI_INTENT_SCHEME).toUri()
        }
        views.setRemoteAdapter(R.id.lv_tomorrow, tomorrowIntent)
        views.setEmptyView(R.id.lv_tomorrow, R.id.layout_empty_tomorrow)

        // 根布局点击刷新
        val clickIntent = Intent(context, TwoDayClassesProvider4x2::class.java).apply {
            action = "com.muxixyz.ccnubox.ACTION_WIDGET_CLICK"
        }
        val clickPendingIntent = PendingIntent.getBroadcast(
            context,
            0,
            clickIntent,
            PendingIntent.FLAG_UPDATE_CURRENT or PendingIntent.FLAG_IMMUTABLE
        )
        views.setOnClickPendingIntent(R.id.layout_root, clickPendingIntent)

        appWidgetManager.notifyAppWidgetViewDataChanged(appWidgetIds, R.id.lv_today)
        appWidgetManager.notifyAppWidgetViewDataChanged(appWidgetIds, R.id.lv_tomorrow)
        appWidgetManager.updateAppWidget(appWidgetIds, views)
    }
}


