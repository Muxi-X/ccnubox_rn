package com.muxixyz.ccnubox.widgets

import android.content.ComponentName
import android.content.Context
import android.content.Intent
import android.content.SharedPreferences
import android.util.Log
import com.facebook.react.bridge.Promise
import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.bridge.ReactContextBaseJavaModule
import com.facebook.react.bridge.ReactMethod
import org.json.JSONArray
import org.json.JSONObject

class WidgetManagerModule(private val reactContext: ReactApplicationContext):ReactContextBaseJavaModule(reactContext) {
    override fun getName(): String = "WidgetManager"

    private val sharedPreferences:SharedPreferences = reactContext.getSharedPreferences("WidgetData",Context.MODE_PRIVATE)

    @ReactMethod
    fun updateCourseData(text:String,promise: Promise){
        try{
            parseCoursesWithOrgJson(text)
            Log.d("course_data",text)

            val updateIntent = Intent("com.muxixyz.ccnubox.UPDATE_COURSE_WIDGET").apply {
                component = ComponentName(
                    reactContext.packageName,
                    "com.muxixyz.ccnubox.widgets.providers.RecentClassesProvider"
                )
            }
            reactContext.sendBroadcast(updateIntent)
            promise.resolve("Widget data update successfully")
        }catch (e:Exception){
            promise.reject("Update_ERROR","Failed to update widget data",e)
        }
    }

    private fun parseCoursesWithOrgJson(jsonString: String?) {

        val editor = sharedPreferences.edit()

        if (jsonString.isNullOrBlank()) return

        try {
            val json = JSONObject(jsonString)
            val coursesArray = json.optJSONArray("courses") ?: return

            val courseList = JSONArray() // 最终存储结构：JSONArray of JSONObject

            for (i in 0 until coursesArray.length()) {
                val courseObject = coursesArray.optJSONObject(i) ?: continue
                val idStr = courseObject.optString("id") ?: continue
                val parts = idStr.split(":")
                if (parts.size < 9) continue

                val name = parts[1]
                val weekday = parts[4].toIntOrNull() ?: continue
                val periodRange = parts[5].split("-")
                if (periodRange.size != 2) continue

                val startPeriod = periodRange[0].toIntOrNull() ?: continue
                val endPeriod = periodRange[1].toIntOrNull() ?: continue
                val teacher = parts[6].trim()
                val location = parts[7]
                val weekBitMask = parts[8].toIntOrNull() ?: continue

                val itemJson = JSONObject().apply {
                    put("name", name)
                    put("weekday", weekday)
                    put("startPeriod", startPeriod)
                    put("endPeriod", endPeriod)
                    put("teacher", teacher)
                    put("location", location)
                    put("weekBitMask", weekBitMask)
                }

                courseList.put(itemJson)
            }

            editor.putString("all_courses", courseList.toString())
            editor.apply()

        } catch (e: Exception) {
            e.printStackTrace()
        }
    }
}