import { DateCustom } from './DateCustom';
import {
  DateCustomComponentType,
  DateCustomComponentRaw,
  DateCustomComponentsRaw,
  DateCustomChangeValueDateComponentSettings,
} from './types';

export default class DateCustomSetter {
  public static setValueDateComponent(
    dateCustom: DateCustom,
    type: DateCustomComponentType,
    nextValue: DateCustomComponentRaw | DateCustomComponentsRaw,
  ): DateCustom {
    if (type === DateCustomComponentType.All) {
      dateCustom.setComponents(nextValue as DateCustomComponentsRaw);
      return dateCustom;
    }
    if (type === DateCustomComponentType.Year) {
      dateCustom.setYear(nextValue as DateCustomComponentRaw);
    } else if (type === DateCustomComponentType.Month) {
      dateCustom.setMonth(nextValue as DateCustomComponentRaw);
    } else if (type === DateCustomComponentType.Date) {
      dateCustom.setDate(nextValue as DateCustomComponentRaw);
    }
    return dateCustom;
  }

  public static shiftValueDateComponent(
    dateCustom: DateCustom,
    type: DateCustomComponentType,
    step: number,
    settings?: DateCustomChangeValueDateComponentSettings,
  ): DateCustom {
    if (type === DateCustomComponentType.Year) {
      dateCustom.shiftYear(step, settings);
    } else if (type === DateCustomComponentType.Month) {
      dateCustom.shiftMonth(step, settings);
    } else if (type === DateCustomComponentType.Date) {
      dateCustom.shiftDate(step, settings);
    } else if (type === DateCustomComponentType.All) {
      dateCustom.shiftDate(step, settings);
    }
    return dateCustom;
  }
}
