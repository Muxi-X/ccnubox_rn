package com.muxixyz.ccnubox.widgets

import android.content.Context
import android.content.Intent
import android.net.Uri

internal object WidgetIntents {
    fun openSchedule(context: Context): Intent =
        Intent(Intent.ACTION_VIEW, Uri.parse("ccnubox://schedule")).apply {
            setPackage(context.packageName)
            flags = Intent.FLAG_ACTIVITY_NEW_TASK or Intent.FLAG_ACTIVITY_CLEAR_TOP
        }
}
