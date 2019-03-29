import { DateCustom } from './DateCustom';
import { DateComponent, DateComponentsType, ChangeValueDateComponentSettings, DateComponents } from './types';

export default class DateCustomSetter {
  public static setValueDateComponent(
    dateCustom: DateCustom,
    type: DateComponentsType,
    nextValue: DateComponent | DateComponents,
    settingsChange: ChangeValueDateComponentSettings,
  ): DateCustom {
    if (type === DateComponentsType.All) {
      dateCustom.setComponents(nextValue as DateComponents);
      return dateCustom
    }
    nextValue = nextValue !== null ? Number(nextValue) : null;
    if (type === DateComponentsType.Year) {
      dateCustom.setYear(nextValue, settingsChange);
    } else if (type === DateComponentsType.Month) {
      dateCustom.setMonth(nextValue, settingsChange);
    } else if (type === DateComponentsType.Date) {
      dateCustom.setDate(nextValue, settingsChange);
    }
    return dateCustom;
  }

  public static shiftValueDateComponent(dateCustom: DateCustom, type: DateComponentsType, step: number): DateCustom {
    if (type === DateComponentsType.Year) {
      dateCustom.shiftYear(step);
    } else if (type === DateComponentsType.Month) {
      dateCustom.shiftMonth(step);
    } else if (type === DateComponentsType.Date) {
      dateCustom.shiftDate(step);
    } else if (type === DateComponentsType.All) {
      dateCustom.shiftDate(step);
    }
    return dateCustom;
  }
}
