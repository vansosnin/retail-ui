import { DateCustom } from './DateCustom';
import {
  DateCustomComponentType,
  DateCustomComponentRaw,
  DateCustomComponentsRaw,
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

  public static shiftValueDateComponent(dateCustom: DateCustom, type: DateCustomComponentType, step: number): DateCustom {
    if (type === DateCustomComponentType.Year) {
      dateCustom.shiftYear(step);
    } else if (type === DateCustomComponentType.Month) {
      dateCustom.shiftMonth(step);
    } else if (type === DateCustomComponentType.Date) {
      dateCustom.shiftDate(step);
    } else if (type === DateCustomComponentType.All) {
      dateCustom.shiftDate(step);
    }
    return dateCustom;
  }
}
