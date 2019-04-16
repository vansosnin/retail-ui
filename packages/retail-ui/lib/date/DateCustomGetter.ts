import { MAX_DATE, MAX_MONTH, MAX_YEAR, MIN_DATE, MIN_MONTH, MIN_YEAR } from './constants';
import { DateCustom } from './DateCustom';
import { DateCustomComponentType, DateCustomComponentsRaw, DateCustomComponentRaw, DateCustomComponents } from './types';

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
    type: DateCustomComponentType | null,
    components: DateCustomComponentsRaw
  ): DateCustomComponentRaw {
    if (type === DateCustomComponentType.Year) {
      return components.year;
    } else if (type === DateCustomComponentType.Month) {
      return components.month;
    }
    return components.date;
  }

  public static getDefaultMin(type: DateCustomComponentType): number {
    if (type === DateCustomComponentType.Year) {
      return MIN_YEAR;
    } else if (type === DateCustomComponentType.Month) {
      return MIN_MONTH;
    } else if (type === DateCustomComponentType.Date) {
      return MIN_DATE;
    }
    return MIN_DATE;
  }

  public static getDefaultMax(type: DateCustomComponentType, components?: DateCustomComponents): number {
    if (type === DateCustomComponentType.Year) {
      return MAX_YEAR;
    } else if (type === DateCustomComponentType.Month) {
      return MAX_MONTH;
    } else if (type === DateCustomComponentType.Date) {
      if (components === undefined) {
        return MAX_DATE;
      }
      const { year, month } = components;
      return year && month ? DateCustomGetter.getMaxDaysInMonth(month, year) : MAX_DATE;
    }
    return MAX_DATE;
  }

  public static getTodayComponents() {
    const date = new Date();
    return {
      date: date.getDate(),
      month: date.getMonth() + 1,
      year: date.getFullYear(),
    };
  }
}
