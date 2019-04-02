import { DateCustom } from './DateCustom';
import DateCustomGetter from './DateCustomGetter';
import {
  DateComponentType,
  DateCustomComponent,
  DateCustomComponentRaw,
  DateCustomComponents,
} from './types';

export default class DateCustomCalculator {
  public static calcRangeStartDateComponent(
    type: DateComponentType,
    { year, month, date }: DateCustomComponents,
    { year: startYear, month: startMonth, date: startDate }: DateCustomComponents,
  ): DateCustomComponent {
    if (type === DateComponentType.Year) {
      return startYear;
    } else if (type === DateComponentType.Month) {
      return year === startYear ? startMonth : DateCustomGetter.getDefaultMin(type);
    }
    return year === startYear && month === startMonth ? startDate : DateCustomGetter.getDefaultMin(type);
  }

  public static calcRangeEndDateComponent(
    type: DateComponentType,
    { year, month, date }: DateCustomComponents,
    { year: endYear, month: endMonth, date: endDate }: DateCustomComponents,
  ): DateCustomComponent {
    if (type === DateComponentType.Year) {
      return endYear;
    } else if (type === DateComponentType.Month) {
      return year === endYear ? endMonth : DateCustomGetter.getDefaultMax(type);
    }
    return year === endYear && month === endMonth
      ? endDate
      : DateCustomGetter.getDefaultMax(type, { year, month, date });
  }

  public static calcShiftValueDateComponent(
    step: number,
    prevValue: DateCustomComponentRaw,
    start: number,
    end: number,
    isLoop: boolean = true,
  ): DateCustomComponent {
    const value = step + Number(prevValue);
    if (isLoop) {
      return value < start ? end : value > end ? start : value;
    }
    return value < start ? start : value > end ? end : value;
  }

  public static restoreYear(dateCustom: DateCustom, year: DateCustomComponentRaw): number {
    year = Number(year);
    if (year > 0 && year < 100) {
      if (year > 50) {
        year += 1900;
      } else {
        year += 2000;
      }
    }
    return year
  }
}
