import { createElement, type FC } from 'react';
import {
  Image as RNImage,
  type ImageSourcePropType,
  type ImageStyle,
  type StyleProp,
} from 'react-native';
import type { SvgProps } from 'react-native-svg';

import useVisualScheme from '@/store/visualScheme';
import type { LayoutName, ThemeName } from '@/styles/types';

import TabCalendarIcon from './calendar.svg';
import AddCourseIcon from './calendar/add-course.svg';
import CourseDeleteIcon from './calendar/delete.svg';
import CourseEditIcon from './calendar/edit.svg';
import CourseFailIcon from './calendar/fail.svg';
import CourseLocationIcon from './calendar/location.svg';
import CourseNoteIcon from './calendar/note.svg';
import ScreenshotIcon from './calendar/screenshot.svg';
import CourseSuccessIcon from './calendar/success.svg';
import CourseTeacherIcon from './calendar/teacher.svg';
import CourseTimeIcon from './calendar/time.svg';
import CourseWeekIcon from './calendar/week.svg';
import ChooseIcon from './choose.svg';
import ResolvedFeedbackIcon from './feedback/resolved.svg';
import ResolvedSelectedFeedbackIcon from './feedback/resolved_selected.svg';
import UnresolvedFeedbackIcon from './feedback/unresolved.svg';
import UnresolvedSelectedFeedbackIcon from './feedback/unresolved_selected.svg';
import TabHomeIcon from './home.svg';
import TabNotificationIcon from './notification.svg';
import AndroidAirFeedIcon from './platform/android/air.png';
import AndroidAllIcon from './platform/android/all.svg';
import AndroidCardIcon from './platform/android/card.svg';
import AndroidClassroomIcon from './platform/android/classroom.svg';
import AndroidDateIcon from './platform/android/date.svg';
import AndroidEnergyIcon from './platform/android/energy.svg';
import AndroidEventGlideIcon from './platform/android/event-glide.svg';
import AndroidFeedbackFeedIcon from './platform/android/feedback.png';
import AndroidGradeFeedIcon from './platform/android/grade.png';
import AndroidGradesIcon from './platform/android/grades.svg';
import AndroidHolidayFeedIcon from './platform/android/holiday.png';
import AndroidInformationIcon from './platform/android/information.svg';
import AndroidKestackIcon from './platform/android/kestack.svg';
import AndroidLessonIcon from './platform/android/lesson.svg';
import AndroidMapIcon from './platform/android/map.svg';
import AndroidMoreIcon from './platform/android/more.svg';
import AndroidMuxiFeedIcon from './platform/android/muxi.png';
import AndroidSeatIcon from './platform/android/seat.svg';
import AndroidWebIcon from './platform/android/web.svg';
import IosDarkCardIcon from './platform/ios-dark/card.svg';
import IosDarkClassroomIcon from './platform/ios-dark/classroom.svg';
import IosDarkDateIcon from './platform/ios-dark/date.svg';
import IosDarkEnergyIcon from './platform/ios-dark/energy.svg';
import IosDarkEventGlideIcon from './platform/ios-dark/event-glide.svg';
import IosDarkGradesIcon from './platform/ios-dark/grades.svg';
import IosDarkInformationIcon from './platform/ios-dark/information.svg';
import IosDarkKestackIcon from './platform/ios-dark/kestack.svg';
import IosDarkMapIcon from './platform/ios-dark/map.svg';
import IosDarkMoreIcon from './platform/ios-dark/more.svg';
import IosDarkSeatIcon from './platform/ios-dark/seat.svg';
import IosDarkWebIcon from './platform/ios-dark/web.svg';
import IosAirFeedIcon from './platform/ios/air.png';
import IosAllIcon from './platform/ios/all.svg';
import IosCardIcon from './platform/ios/card.svg';
import IosClassroomIcon from './platform/ios/classroom.svg';
import IosDateIcon from './platform/ios/date.svg';
import IosEnergyIcon from './platform/ios/energy.svg';
import IosEventGlideIcon from './platform/ios/event-glide.svg';
import IosFeedbackFeedIcon from './platform/ios/feedback.png';
import IosGradeFeedIcon from './platform/ios/grade.png';
import IosGradesIcon from './platform/ios/grades.svg';
import IosHolidayFeedIcon from './platform/ios/holiday.png';
import IosInformationIcon from './platform/ios/information.svg';
import IosKestackIcon from './platform/ios/kestack.svg';
import IosLessonIcon from './platform/ios/lesson.svg';
import IosMapIcon from './platform/ios/map.svg';
import IosMoreIcon from './platform/ios/more.svg';
import IosMuxiFeedIcon from './platform/ios/muxi.png';
import IosSeatIcon from './platform/ios/seat.svg';
import IosWebIcon from './platform/ios/web.svg';
import TabSettingIcon from './setting.svg';
import StarGrayIcon from './star-gray.svg';
import StarIcon from './star.svg';
import TabCalendarSelectedIcon from './tabbar/calendar-selected.svg';
import TabHomeSelectedIcon from './tabbar/home-selected.svg';
import TabNotificationSelectedIcon from './tabbar/notification-selected.svg';
import TabSettingSelectedIcon from './tabbar/setting-selected.svg';

export type SvgIcon = FC<SvgProps>;
export type AppIconProps = SvgProps & {
  imageStyle?: StyleProp<ImageStyle>;
  size?: number;
};
export type AppIcon = FC<AppIconProps>;

export type ThemeIcons<T> = {
  light: T;
  dark: T;
  default: T;
};

export type IconStyleIconValue<T> = T | ThemeIcons<T>;

export type IconStyleIcons<T> = {
  android: IconStyleIconValue<T>;
  ios: IconStyleIconValue<T>;
  default: IconStyleIconValue<T>;
};

const isThemeIcons = <T>(icon: IconStyleIconValue<T>): icon is ThemeIcons<T> =>
  typeof icon === 'object' &&
  icon !== null &&
  'light' in icon &&
  'dark' in icon;

const isSvgIcon = (icon: AppIconSource): icon is SvgIcon =>
  typeof icon === 'function';

const selectThemeIconByTheme = <T>(
  icon: IconStyleIconValue<T>,
  themeName: ThemeName
): T => {
  if (!isThemeIcons(icon)) {
    return icon;
  }

  return icon[themeName] ?? icon.default;
};

const selectIconStyleByState = <T>(
  icons: IconStyleIcons<T>,
  iconStyleName: LayoutName,
  themeName: ThemeName
): T => {
  const iconStyleSpecific = icons[iconStyleName];
  if (iconStyleSpecific !== undefined) {
    return selectThemeIconByTheme(iconStyleSpecific, themeName);
  }

  if (icons.default !== undefined) {
    return selectThemeIconByTheme(icons.default, themeName);
  }

  const fallbackLayouts: LayoutName[] = ['ios', 'android'];
  for (const fallback of fallbackLayouts) {
    const candidate = icons[fallback];
    if (candidate !== undefined) {
      return selectThemeIconByTheme(candidate, themeName);
    }
  }

  throw new Error('selectIconStyle expected at least one layout value.');
};

export const selectThemeIcon = <T>(icon: IconStyleIconValue<T>): T => {
  if (!isThemeIcons(icon)) {
    return icon;
  }

  const { themeName } = useVisualScheme.getState();
  return icon[themeName] ?? icon.default;
};

export const selectIconStyle = <T>(icons: IconStyleIcons<T>): T =>
  selectThemeIcon(
    useVisualScheme.getState().iconStyleSelect<IconStyleIconValue<T>>(icons)
  );

type AppIconSource = SvgIcon | ImageSourcePropType;

const createIcon = (
  icons: IconStyleIcons<AppIconSource>,
  displayName: string
): AppIcon => {
  const Icon: AppIcon = ({
    height,
    imageStyle,
    size,
    style,
    width,
    ...svgProps
  }) => {
    const iconStyleName = useVisualScheme(state => state.iconStyleName);
    const themeName = useVisualScheme(state => state.themeName);
    const ResolvedIcon = selectIconStyleByState(
      icons,
      iconStyleName,
      themeName
    );
    const iconWidth = width ?? size;
    const iconHeight = height ?? size;

    if (isSvgIcon(ResolvedIcon)) {
      return createElement(ResolvedIcon, {
        ...svgProps,
        height: iconHeight,
        style,
        width: iconWidth,
      });
    }

    return createElement(RNImage, {
      source: ResolvedIcon,
      style: [
        style as StyleProp<ImageStyle>,
        iconWidth !== undefined && { width: iconWidth as ImageStyle['width'] },
        iconHeight !== undefined && {
          height: iconHeight as ImageStyle['height'],
        },
        imageStyle,
      ],
    });
  };

  Icon.displayName = displayName;
  return Icon;
};

export const tabBarIcons = {
  calendar: TabCalendarIcon,
  home: TabHomeIcon,
  notification: TabNotificationIcon,
  setting: TabSettingIcon,
} satisfies Record<string, SvgIcon>;

export type TabBarIconName = keyof typeof tabBarIcons;

export const tabBarSelectedIcons = {
  calendar: TabCalendarSelectedIcon,
  home: TabHomeSelectedIcon,
  notification: TabNotificationSelectedIcon,
  setting: TabSettingSelectedIcon,
} satisfies Record<TabBarIconName, SvgIcon>;

export const courseTableIcons = {
  addCourse: AddCourseIcon,
  delete: CourseDeleteIcon,
  edit: CourseEditIcon,
  fail: CourseFailIcon,
  location: CourseLocationIcon,
  note: CourseNoteIcon,
  screenshot: ScreenshotIcon,
  success: CourseSuccessIcon,
  teacher: CourseTeacherIcon,
  time: CourseTimeIcon,
  week: CourseWeekIcon,
} satisfies Record<string, SvgIcon>;

export const feedbackIcons = {
  resolved: ResolvedFeedbackIcon,
  resolvedSelected: ResolvedSelectedFeedbackIcon,
  unresolved: UnresolvedFeedbackIcon,
  unresolvedSelected: UnresolvedSelectedFeedbackIcon,
} satisfies Record<string, SvgIcon>;

export const classroomIcons = {
  choose: ChooseIcon,
  star: StarIcon,
  starGray: StarGrayIcon,
} satisfies Record<string, SvgIcon>;

const homeGridIconSpecs = {
  all: {
    android: AndroidAllIcon,
    ios: IosAllIcon,
    default: AndroidAllIcon,
  },
  card: {
    android: AndroidCardIcon,
    ios: {
      light: IosCardIcon,
      dark: IosDarkCardIcon,
      default: IosCardIcon,
    },
    default: AndroidCardIcon,
  },
  classroom: {
    android: AndroidClassroomIcon,
    ios: {
      light: IosClassroomIcon,
      dark: IosDarkClassroomIcon,
      default: IosClassroomIcon,
    },
    default: AndroidClassroomIcon,
  },
  date: {
    android: AndroidDateIcon,
    ios: {
      light: IosDateIcon,
      dark: IosDarkDateIcon,
      default: IosDateIcon,
    },
    default: AndroidDateIcon,
  },
  energy: {
    android: AndroidEnergyIcon,
    ios: {
      light: IosEnergyIcon,
      dark: IosDarkEnergyIcon,
      default: IosEnergyIcon,
    },
    default: AndroidEnergyIcon,
  },
  eventGlide: {
    android: AndroidEventGlideIcon,
    ios: {
      light: IosEventGlideIcon,
      dark: IosDarkEventGlideIcon,
      default: IosEventGlideIcon,
    },
    default: AndroidEventGlideIcon,
  },
  grades: {
    android: AndroidGradesIcon,
    ios: {
      light: IosGradesIcon,
      dark: IosDarkGradesIcon,
      default: IosGradesIcon,
    },
    default: AndroidGradesIcon,
  },
  information: {
    android: AndroidInformationIcon,
    ios: {
      light: IosInformationIcon,
      dark: IosDarkInformationIcon,
      default: IosInformationIcon,
    },
    default: AndroidInformationIcon,
  },
  kestack: {
    android: AndroidKestackIcon,
    ios: {
      light: IosKestackIcon,
      dark: IosDarkKestackIcon,
      default: IosKestackIcon,
    },
    default: AndroidKestackIcon,
  },
  lesson: {
    android: AndroidLessonIcon,
    ios: IosLessonIcon,
    default: AndroidLessonIcon,
  },
  map: {
    android: AndroidMapIcon,
    ios: {
      light: IosMapIcon,
      dark: IosDarkMapIcon,
      default: IosMapIcon,
    },
    default: AndroidMapIcon,
  },
  more: {
    android: AndroidMoreIcon,
    ios: {
      light: IosMoreIcon,
      dark: IosDarkMoreIcon,
      default: IosMoreIcon,
    },
    default: AndroidMoreIcon,
  },
  seat: {
    android: AndroidSeatIcon,
    ios: {
      light: IosSeatIcon,
      dark: IosDarkSeatIcon,
      default: IosSeatIcon,
    },
    default: AndroidSeatIcon,
  },
  web: {
    android: AndroidWebIcon,
    ios: {
      light: IosWebIcon,
      dark: IosDarkWebIcon,
      default: IosWebIcon,
    },
    default: AndroidWebIcon,
  },
} satisfies Record<string, IconStyleIcons<AppIconSource>>;

export const homeGridIcons = {
  all: createIcon(homeGridIconSpecs.all, 'HomeGridAllIcon'),
  card: createIcon(homeGridIconSpecs.card, 'HomeGridCardIcon'),
  classroom: createIcon(homeGridIconSpecs.classroom, 'HomeGridClassroomIcon'),
  date: createIcon(homeGridIconSpecs.date, 'HomeGridDateIcon'),
  energy: createIcon(homeGridIconSpecs.energy, 'HomeGridEnergyIcon'),
  eventGlide: createIcon(
    homeGridIconSpecs.eventGlide,
    'HomeGridEventGlideIcon'
  ),
  grades: createIcon(homeGridIconSpecs.grades, 'HomeGridGradesIcon'),
  information: createIcon(
    homeGridIconSpecs.information,
    'HomeGridInformationIcon'
  ),
  kestack: createIcon(homeGridIconSpecs.kestack, 'HomeGridKestackIcon'),
  lesson: createIcon(homeGridIconSpecs.lesson, 'HomeGridLessonIcon'),
  map: createIcon(homeGridIconSpecs.map, 'HomeGridMapIcon'),
  more: createIcon(homeGridIconSpecs.more, 'HomeGridMoreIcon'),
  seat: createIcon(homeGridIconSpecs.seat, 'HomeGridSeatIcon'),
  web: createIcon(homeGridIconSpecs.web, 'HomeGridWebIcon'),
} satisfies Record<string, AppIcon>;

const feedIconSpecs = {
  energy: {
    android: AndroidAirFeedIcon as ImageSourcePropType,
    ios: IosAirFeedIcon as ImageSourcePropType,
    default: AndroidAirFeedIcon as ImageSourcePropType,
  },
  feedback: {
    android: AndroidFeedbackFeedIcon as ImageSourcePropType,
    ios: IosFeedbackFeedIcon as ImageSourcePropType,
    default: AndroidFeedbackFeedIcon as ImageSourcePropType,
  },
  grade: {
    android: AndroidGradeFeedIcon as ImageSourcePropType,
    ios: IosGradeFeedIcon as ImageSourcePropType,
    default: AndroidGradeFeedIcon as ImageSourcePropType,
  },
  holiday: {
    android: AndroidHolidayFeedIcon as ImageSourcePropType,
    ios: IosHolidayFeedIcon as ImageSourcePropType,
    default: AndroidHolidayFeedIcon as ImageSourcePropType,
  },
  muxi: {
    android: AndroidMuxiFeedIcon as ImageSourcePropType,
    ios: IosMuxiFeedIcon as ImageSourcePropType,
    default: AndroidMuxiFeedIcon as ImageSourcePropType,
  },
} satisfies Record<string, IconStyleIcons<AppIconSource>>;

export const feedIcons = {
  energy: createIcon(feedIconSpecs.energy, 'FeedEnergyIcon'),
  feedback: createIcon(feedIconSpecs.feedback, 'FeedFeedbackIcon'),
  grade: createIcon(feedIconSpecs.grade, 'FeedGradeIcon'),
  holiday: createIcon(feedIconSpecs.holiday, 'FeedHolidayIcon'),
  muxi: createIcon(feedIconSpecs.muxi, 'FeedMuxiIcon'),
} satisfies Record<string, AppIcon>;

export {
  AddCourseIcon,
  ChooseIcon,
  CourseDeleteIcon,
  CourseEditIcon,
  CourseFailIcon,
  CourseLocationIcon,
  CourseNoteIcon,
  CourseSuccessIcon,
  CourseTeacherIcon,
  CourseTimeIcon,
  CourseWeekIcon,
  ResolvedFeedbackIcon,
  ResolvedSelectedFeedbackIcon,
  ScreenshotIcon,
  StarGrayIcon,
  StarIcon,
  UnresolvedFeedbackIcon,
  UnresolvedSelectedFeedbackIcon,
};
