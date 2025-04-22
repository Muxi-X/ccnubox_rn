package com.kbkbk.ccnu_coursetable.widgets.module

data class CourseInfo(
    val name: String,
    val weekday: Int,
    val startPeriod: Int,
    val endPeriod: Int,
    val teacher: String,
    val location: String,
    val weekBitMask: Int
)


