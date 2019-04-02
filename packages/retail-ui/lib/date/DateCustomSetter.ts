import { DateCustom } from './DateCustom';
import {
  DateComponentType,
  DateCustomComponentRaw,
  DateCustomComponentsRaw,
} from './types';

export default class DateCustomSetter {
  public static setValueDateComponent(
    dateCustom: DateCustom,
    type: DateComponentType,
    nextValue: DateCustomComponentRaw | DateCustomComponentsRaw,
  ): DateCustom {
    if (type === DateComponentType.All) {
      dateCustom.setComponents(nextValue as DateCustomComponentsRaw);
      return dateCustom;
    }
    if (type === DateComponentType.Year) {
      dateCustom.setYear(nextValue as DateCustomComponentRaw);
    } else if (type === DateComponentType.Month) {
      dateCustom.setMonth(nextValue as DateCustomComponentRaw);
    } else if (type === DateComponentType.Date) {
      dateCustom.setDate(nextValue as DateCustomComponentRaw);
    }
    return dateCustom;
  }

  public static shiftValueDateComponent(dateCustom: DateCustom, type: DateComponentType, step: number): DateCustom {
    if (type === DateComponentType.Year) {
      dateCustom.shiftYear(step);
    } else if (type === DateComponentType.Month) {
      dateCustom.shiftMonth(step);
    } else if (type === DateComponentType.Date) {
      dateCustom.shiftDate(step);
    } else if (type === DateComponentType.All) {
      dateCustom.shiftDate(step);
    }
    return dateCustom;
  }
}
