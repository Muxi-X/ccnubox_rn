import { Want } from '@kit.AbilityKit';
import { formBindingData, FormExtensionAbility, formInfo } from '@kit.FormKit';
import {
  createEmptyCourseWidgetBindingData,
  refreshCourseWidget,
  registerCourseWidget,
  removeCourseWidget,
} from './CourseWidgetStore';

export default class CourseWidgetAbility extends FormExtensionAbility {
  onAddForm(want: Want): formBindingData.FormBindingData {
    const formId = want.parameters?.[formInfo.FormParam.IDENTITY_KEY];
    const isWide =
      want.parameters?.[formInfo.FormParam.DIMENSION_KEY] ===
      formInfo.FormDimension.Dimension_2_4;
    if (typeof formId === 'string') {
      void registerCourseWidget(this.context, formId, isWide);
    }
    return createEmptyCourseWidgetBindingData(isWide);
  }

  onUpdateForm(formId: string): void {
    void refreshCourseWidget(this.context, formId);
  }

  onRemoveForm(formId: string): void {
    void removeCourseWidget(this.context, formId);
  }
}
