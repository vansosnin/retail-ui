import { MAX_DATE, MAX_MONTH, MAX_YEAR, MIN_DATE, MIN_MONTH, MIN_YEAR } from './constants';
import { DateCustom } from './DateCustom';
import { DateComponentType, DateCustomComponentsRaw, DateCustomComponentRaw, DateCustomComponents } from './types';

export default class DateCustomGetter {
  public static max = (datesCustom: DateCustom[]): DateCustom =>
    datesCustom.sort((a, b) => b.toNumber() - a.toNumber())[0];

  public static min = (datesCustom: DateCustom[]): DateCustom =>
    datesCustom.sort((a, b) => a.toNumber() - b.toNumber())[0];

  public static getMaxDaysInMonth(month: number, year?: number): number {
    if (month === 2) {
      const isLeapYear = (year !== undefined && ((year % 4 === 0 && year % 100 !== 0) || year % 400 === 0)) || false;
      return isLeapYear ? 29 : 28;
    }
    if (month <= 7) {
      month++;
    }
    return month % 2 === 0 ? 31 : 30;
  }

  public static getValueDateComponent(
    type: DateComponentType | null,
    components: DateCustomComponentsRaw
  ): DateCustomComponentRaw {
    if (type === DateComponentType.Year) {
      return components.year;
    } else if (type === DateComponentType.Month) {
      return components.month;
    }
    return components.date;
  }

  public static getDefaultMin(type: DateComponentType): number {
    if (type === DateComponentType.Year) {
      return MIN_YEAR;
    } else if (type === DateComponentType.Month) {
      return MIN_MONTH;
    } else if (type === DateComponentType.Date) {
      return MIN_DATE;
    }
    return MIN_DATE;
  }

  public static getDefaultMax(type: DateComponentType, components?: DateCustomComponents): number {
    if (type === DateComponentType.Year) {
      return MAX_YEAR;
    } else if (type === DateComponentType.Month) {
      return MAX_MONTH;
    } else if (type === DateComponentType.Date) {
      if (components === undefined) {
        return MAX_DATE;
      }
      const { year, month } = components;
      return year && month ? DateCustomGetter.getMaxDaysInMonth(month, year) : MAX_DATE;
    }
    return MAX_DATE;
  }
}
