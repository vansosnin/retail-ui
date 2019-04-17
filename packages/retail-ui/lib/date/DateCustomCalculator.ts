import DateCustomGetter from './DateCustomGetter';
import { DateCustomComponentType, DateCustomComponent, DateCustomComponentRaw, DateCustomComponents } from './types';

export default class DateCustomCalculator {
  public static calcRangeStartDateComponent(
    type: DateCustomComponentType,
    { year, month, date }: DateCustomComponents,
    { year: startYear, month: startMonth, date: startDate }: DateCustomComponents,
  ): DateCustomComponent {
    if (type === DateCustomComponentType.Year) {
      return startYear;
    } else if (type === DateCustomComponentType.Month) {
      return year === startYear ? startMonth : DateCustomGetter.getDefaultMin(type);
    }
    return year === startYear && month === startMonth ? startDate : DateCustomGetter.getDefaultMin(type);
  }

  public static calcRangeEndDateComponent(
    type: DateCustomComponentType,
    { year, month, date }: DateCustomComponents,
    { year: endYear, month: endMonth, date: endDate }: DateCustomComponents,
  ): DateCustomComponent {
    if (type === DateCustomComponentType.Year) {
      return endYear;
    } else if (type === DateCustomComponentType.Month) {
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
    if (step !==0 && (start - value > Math.abs(step) || value - end > Math.abs(step))) {
      return step < 0 ? end : start;
    }
    if (isLoop) {
      return value < start ? end : value > end ? start : value;
    }
    return value < start ? start : value > end ? end : value;
  }
}
