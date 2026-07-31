package com.muxixyz.ccnubox.widgets

import android.content.ComponentName
import android.content.Context
import android.content.Intent
import android.util.Log
import com.muxixyz.ccnubox.widgets.providers.RecentClassesProvider2x2
import com.muxixyz.ccnubox.widgets.providers.RecentClassesProvider4x2
import expo.modules.kotlin.modules.Module
import expo.modules.kotlin.modules.ModuleDefinition
import org.json.JSONArray
import org.json.JSONObject

class CcnuboxWidgetModule : Module() {
    override fun definition() = ModuleDefinition {
        Name("CcnuboxWidget")

        AsyncFunction("updateCourseData") { text: String ->
            val context = appContext.reactContext
                ?: throw IllegalStateException("React context is unavailable")

            saveCourseData(context, text)
            refreshWidgets(context)
            "Widget data updated successfully"
        }
    }

    private fun saveCourseData(context: Context, jsonString: String) {
        if (jsonString.isBlank()) return

        val json = JSONObject(jsonString)
        val coursesArray = json.optJSONArray("courses") ?: return
        val courseList = JSONArray()

        for (index in 0 until coursesArray.length()) {
            val courseObject = coursesArray.optJSONObject(index) ?: continue
            val parts = courseObject.optString("id").split(":")
            if (parts.size < 9) continue

            val periodRange = parts[5].split("-")
            if (periodRange.size != 2) continue

            val weekday = parts[4].toIntOrNull() ?: continue
            val startPeriod = periodRange[0].toIntOrNull() ?: continue
            val endPeriod = periodRange[1].toIntOrNull() ?: continue
            val weekBitMask = parts[8].toIntOrNull() ?: continue

            courseList.put(JSONObject().apply {
                put("name", parts[1])
                put("weekday", weekday)
                put("startPeriod", startPeriod)
                put("endPeriod", endPeriod)
                put("teacher", parts[6].trim())
                put("location", parts[7])
                put("weekBitMask", weekBitMask)
            })
        }

        context.getSharedPreferences(WIDGET_PREFERENCES, Context.MODE_PRIVATE)
            .edit()
            .putString("all_courses", courseList.toString())
            .putString(
                "current_week",
                json.optString("date").removePrefix("第").removeSuffix("周")
            )
            .apply()

        Log.d(LOG_TAG, "Saved ${courseList.length()} courses")
    }

    private fun refreshWidgets(context: Context) {
        listOf(
            RecentClassesProvider2x2::class.java,
            RecentClassesProvider4x2::class.java
        ).forEach { provider ->
            context.sendBroadcast(Intent(ACTION_UPDATE_WIDGET).apply {
                component = ComponentName(context, provider)
            })
        }
    }

    companion object {
        const val ACTION_UPDATE_WIDGET =
            "com.muxixyz.ccnubox.UPDATE_COURSE_WIDGET"
        const val WIDGET_PREFERENCES = "WidgetData"
        private const val LOG_TAG = "CcnuboxWidget"
    }
}
