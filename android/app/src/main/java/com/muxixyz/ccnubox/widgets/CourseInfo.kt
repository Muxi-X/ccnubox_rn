package com.muxixyz.ccnubox.widgets

data class CourseInfo(
    val name: String,
    val weekday: Int,
    val startPeriod: Int,
    val endPeriod: Int,
    val teacher: String,
    val location: String,
    val weekBitMask: Int
)