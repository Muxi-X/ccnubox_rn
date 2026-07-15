import { requireOptionalNativeModule } from 'expo-modules-core';

type CcnuboxWidgetNativeModule = {
  updateCourseData(data: string): Promise<string>;
};

export default requireOptionalNativeModule<CcnuboxWidgetNativeModule>(
  'CcnuboxWidget'
);
