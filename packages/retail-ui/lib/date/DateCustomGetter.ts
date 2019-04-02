import { MAX_DATE, MAX_MONTH, MAX_YEAR, MIN_DATE, MIN_MONTH, MIN_YEAR } from './constants';
import { DateCustom } from './DateCustom';
import { DateComponentType, DateCustomComponentsRaw, DateCustomComponentRaw } from './types';

export default class DateCustomGetter {
  public static max = (datesCustom: DateCustom[]): DateCustom =>
    datesCustom.sort((a, b) => b.toNumber() - a.toNumber())[0];

  public static min = (datesCustom: DateCustom[]): DateCustom =>
    datesCustom.sort((a, b) => a.toNumber() - b.toNumber())[0];

  public static leapYear = (year: number): boolean => (year % 4 === 0 && year % 100 !== 0) || year % 400 === 0;

  public static getMaxDaysInMonth(month: number, yearForFebruary?: number): number {
    if (month === 2) {
      return yearForFebruary && DateCustomGetter.leapYear(yearForFebruary) ? 29 : 28;
    }
    if (month <= 7) {
      month++;
    }
    return month % 2 === 0 ? 31 : 30;
  }

  public static getValueDateComponent(
    dateCustom: DateCustom,
    type: DateComponentType | null,
  ): DateCustomComponentRaw | DateCustomComponentsRaw {
    if (type === DateComponentType.Year) {
      return dateCustom.getYear();
    } else if (type === DateComponentType.Month) {
      return dateCustom.getMonth();
    } else if (type === DateComponentType.Date) {
      return dateCustom.getDate();
    } else if (type === DateComponentType.All) {
      return dateCustom.getComponents();
    }
    return null;
  }

  public static getDefaultMinValueDateComponent(type: DateComponentType): number {
    if (type === DateComponentType.Year) {
      return MIN_YEAR;
    } else if (type === DateComponentType.Month) {
      return MIN_MONTH;
    } else if (type === DateComponentType.Date) {
      return MIN_DATE;
    }
    return MIN_DATE;
  }

  public static getDefaultMaxValueDateComponent(type: DateComponentType, dateCustom?: DateCustom): number {
    if (type === DateComponentType.Year) {
      return MAX_YEAR;
    } else if (type === DateComponentType.Month) {
      return MAX_MONTH;
    } else if (type === DateComponentType.Date) {
      if (!dateCustom) {
        return MAX_DATE;
      }
      const { year, month } = dateCustom.getComponents();
      return year && month ? DateCustomGetter.getMaxDaysInMonth(month, year) : MAX_DATE;
    }
    return MAX_DATE;
  }
}
