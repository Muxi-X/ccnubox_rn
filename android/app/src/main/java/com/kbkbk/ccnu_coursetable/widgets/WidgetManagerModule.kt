package com.kbkbk.ccnu_coursetable.widgets

import android.appwidget.AppWidgetManager
import android.content.ComponentName
import android.content.Context
import android.content.SharedPreferences
import android.util.Log
import com.facebook.react.bridge.Promise
import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.bridge.ReactContextBaseJavaModule
import com.facebook.react.bridge.ReactMethod
import androidx.core.content.edit

class WidgetManagerModule(reactContext: ReactApplicationContext):ReactContextBaseJavaModule(reactContext) {
    override fun getName(): String ="WidgetManager"

            private val sharedPreferences:SharedPreferences =
                reactContext.getSharedPreferences("WidgetData",Context.MODE_PRIVATE)

    @ReactMethod
    fun updateCourseData(text:String,promise: Promise){
        try{
            sharedPreferences.edit() { putString("course_data", text) }

            updateWidget()

            promise.resolve("Widget data update successfully")
        }catch (e:Exception){
            promise.reject("Update_ERROR","Failed to update widget data",e)
        }
    }

    private fun updateWidget() {
        val context = reactApplicationContext
        val appWidgetManager = AppWidgetManager.getInstance(context)
        val componentName = ComponentName(context, DailyCourseWidgetProvider::class.java)

        // 获取所有 widgetId，并手动更新小组件
        val appWidgetIds = appWidgetManager.getAppWidgetIds(componentName)
        if (appWidgetIds.isNotEmpty()) {
            appWidgetManager.notifyAppWidgetViewDataChanged(appWidgetIds, android.R.id.list)
            appWidgetManager.updateAppWidget(appWidgetIds, DailyCourseWidgetProvider().updateRemoteViews(context))
            Log.d("WidgetManager", "小组件已刷新")
        } else {
            Log.d("WidgetManager", "没有找到小组件实例")
        }
    }
}