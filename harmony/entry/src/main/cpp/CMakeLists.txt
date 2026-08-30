cmake_minimum_required(VERSION 3.11)
project(rnapp)

set(RNOH_APP_DIR "${CMAKE_CURRENT_SOURCE_DIR}")
set(RNOH_CPP_DIR "${CMAKE_CURRENT_SOURCE_DIR}/../../../../oh_modules/@rnoh/react-native-openharmony/src/main/cpp")
if(NOT EXISTS "${RNOH_CPP_DIR}/CMakeLists.txt")
  file(GLOB RNOH_CPP_DIR_CANDIDATES
    "${CMAKE_CURRENT_SOURCE_DIR}/../../../../oh_modules/.ohpm/@rnoh+react-native-openharmony@*/oh_modules/@rnoh/react-native-openharmony/src/main/cpp"
  )

  list(LENGTH RNOH_CPP_DIR_CANDIDATES RNOH_CPP_DIR_CANDIDATE_COUNT)
  if(RNOH_CPP_DIR_CANDIDATE_COUNT GREATER 0)
    list(GET RNOH_CPP_DIR_CANDIDATES 0 RNOH_CPP_DIR)
  endif()
endif()

if(NOT EXISTS "${RNOH_CPP_DIR}/CMakeLists.txt")
  file(GLOB RNOH_LOCAL_DEP_CPP_DIR_CANDIDATES
    "${CMAKE_CURRENT_SOURCE_DIR}/../../../../expo-harmony-local-deps/*react_native_openharmony*/src/main/cpp"
    "${CMAKE_CURRENT_SOURCE_DIR}/../../../../.expo-harmony/ohpm-local-deps/*react_native_openharmony*/src/main/cpp"
  )

  list(LENGTH RNOH_LOCAL_DEP_CPP_DIR_CANDIDATES RNOH_LOCAL_DEP_CPP_DIR_CANDIDATE_COUNT)
  if(RNOH_LOCAL_DEP_CPP_DIR_CANDIDATE_COUNT GREATER 0)
    list(GET RNOH_LOCAL_DEP_CPP_DIR_CANDIDATES 0 RNOH_CPP_DIR)
  endif()
endif()

if(NOT EXISTS "${RNOH_CPP_DIR}/CMakeLists.txt")
  message(FATAL_ERROR "Unable to locate RNOH C++ sources under oh_modules, oh_modules/.ohpm, or expo-harmony-local-deps. Re-sync Harmony dependencies before building.")
endif()

set(RNOH_GENERATED_DIR "${CMAKE_CURRENT_SOURCE_DIR}/generated")
set(OH_MODULES_DIR "${CMAKE_CURRENT_SOURCE_DIR}/../../../../oh_modules")
add_compile_options(
  "-Wno-error=unused-command-line-argument"
  "-Qunused-arguments"
  "-fstack-protector-strong"
  "-fPIC"
)

add_subdirectory("${RNOH_CPP_DIR}" ./rn)
include("${CMAKE_CURRENT_SOURCE_DIR}/autolinking.cmake")

# The Harmony Skia adapter still references APIs removed from RN/RNOH 0.82.
# Patch the generated ohpm sources before CMake compiles them.
set(RNOH_SKIA_COMPAT_HEADERS
  "${OH_MODULES_DIR}/@react-native-oh-tpl/react-native-skia/src/main/cpp/rnskia/HarmonyPlatformContext.h"
  "${OH_MODULES_DIR}/@react-native-oh-tpl/react-native-skia/src/main/cpp/SkiaDomViewComponentDescriptor.h"
  "${OH_MODULES_DIR}/@react-native-oh-tpl/react-native-skia/src/main/cpp/SkiaPictureViewComponentDescriptor.h"
)
foreach(RNOH_SKIA_COMPAT_HEADER ${RNOH_SKIA_COMPAT_HEADERS})
  file(READ "${RNOH_SKIA_COMPAT_HEADER}" RNOH_SKIA_COMPAT_SOURCE)
  set(RNOH_SKIA_COMPAT_ORIGINAL "${RNOH_SKIA_COMPAT_SOURCE}")
  string(REPLACE
    "    friend rnoh::ArkTSTurboModule::Context rnoh::ArkTSTurboModule::getContext();\n"
    ""
    RNOH_SKIA_COMPAT_SOURCE
    "${RNOH_SKIA_COMPAT_SOURCE}"
  )
  string(REPLACE
    "mode(CoreFeatures::enablePropIteratorSetter\n                   ? sourceProps.mode\n                   : convertRawProp(context, rawProps, \"mode\", sourceProps.mode, {}))"
    "mode(convertRawProp(context, rawProps, \"mode\", sourceProps.mode, {}))"
    RNOH_SKIA_COMPAT_SOURCE
    "${RNOH_SKIA_COMPAT_SOURCE}"
  )
  string(REPLACE
    "debug(CoreFeatures::enablePropIteratorSetter\n                    ? sourceProps.debug\n                    : convertRawProp(context, rawProps, \"debug\", sourceProps.debug, {true}))"
    "debug(convertRawProp(context, rawProps, \"debug\", sourceProps.debug, {true}))"
    RNOH_SKIA_COMPAT_SOURCE
    "${RNOH_SKIA_COMPAT_SOURCE}"
  )
  if(NOT RNOH_SKIA_COMPAT_SOURCE STREQUAL RNOH_SKIA_COMPAT_ORIGINAL)
    file(WRITE "${RNOH_SKIA_COMPAT_HEADER}" "${RNOH_SKIA_COMPAT_SOURCE}")
  endif()
endforeach()

add_subdirectory(
  "${OH_MODULES_DIR}/@react-native-oh-tpl/react-native-skia/src/main/cpp"
  ./rnoh_skia
)
add_subdirectory(
  "${CMAKE_CURRENT_SOURCE_DIR}/../../../../../node_modules/@react-native-ohos/jpush-react-native/harmony/jpush_react_native/src/main/cpp"
  ./rnoh_jpush
)

if(DEFINED CMAKE_SYSROOT)
  set(RNOH_FORCE_ASSERT_INCLUDE "-include${CMAKE_SYSROOT}/usr/include/assert.h")
  add_compile_options("${RNOH_FORCE_ASSERT_INCLUDE}")

  foreach(RNOH_TARGET rnoh_core rnoh_core_package)
    if(TARGET ${RNOH_TARGET})
      # RNOH exposes a header named "assert.h" under its public include paths.
      # Force the SDK assert header into every compiled RNOH target first so
      # libc++ <cassert> never resolves to RNOH/assert.h during native builds.
      target_compile_options(${RNOH_TARGET} PRIVATE "${RNOH_FORCE_ASSERT_INCLUDE}")
    endif()
  endforeach()
endif()

file(GLOB GENERATED_CPP_FILES "${CMAKE_CURRENT_SOURCE_DIR}/generated/*.cpp")
add_library(rnoh_app SHARED
  ${GENERATED_CPP_FILES}
  "./PackageProvider.cpp"
  "${RNOH_CPP_DIR}/RNOHAppNapiBridge.cpp"
)

if(DEFINED CMAKE_SYSROOT)
  target_compile_options(rnoh_app PRIVATE "${RNOH_FORCE_ASSERT_INCLUDE}")
endif()

target_link_libraries(rnoh_app PUBLIC rnoh)
target_link_libraries(rnoh_app PUBLIC rnoh_skia)
target_link_libraries(rnoh_app PUBLIC rnoh_jPushModule)
target_link_options(rnoh_app PRIVATE
  "-Wl,-z,relro,-z,now,-z,noexecstack"
  "$<$<CONFIG:Release>:-s>"
)
autolink_libraries(rnoh_app)
