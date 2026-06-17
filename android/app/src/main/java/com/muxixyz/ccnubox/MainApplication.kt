package com.muxixyz.ccnubox

import android.app.Application
import android.content.res.Configuration

import com.facebook.react.PackageList
import com.facebook.react.ReactApplication
import com.facebook.react.ReactHost
import com.facebook.react.ReactPackage
import com.facebook.react.defaults.DefaultNewArchitectureEntryPoint.load
import com.facebook.react.soloader.OpenSourceMergedSoMapping
import com.facebook.soloader.SoLoader

import expo.modules.ApplicationLifecycleDispatcher
import expo.modules.ExpoReactHostFactory
import com.muxixyz.ccnubox.widgets.WidgetManagerPackage

class MainApplication : Application(), ReactApplication {

  override val reactHost: ReactHost
    get() = ExpoReactHostFactory.getDefaultReactHost(
      context = applicationContext,
      packageList = getPackages(),
      jsMainModulePath = ".expo/.virtual-metro-entry",
      jsBundleAssetPath = "index.android.bundle",
      useDevSupport = BuildConfig.DEBUG
    )

  override fun onCreate() {
    super.onCreate()
    SoLoader.init(this, OpenSourceMergedSoMapping)
    if (BuildConfig.IS_NEW_ARCHITECTURE_ENABLED) {
      load()
    }
    ApplicationLifecycleDispatcher.onApplicationCreate(this)
  }

  override fun onConfigurationChanged(newConfig: Configuration) {
    super.onConfigurationChanged(newConfig)
    ApplicationLifecycleDispatcher.onConfigurationChanged(this, newConfig)
  }

  private fun getPackages(): List<ReactPackage> {
    return PackageList(this).getPackages().also {
      it.add(WidgetManagerPackage())
    }
  }
}
