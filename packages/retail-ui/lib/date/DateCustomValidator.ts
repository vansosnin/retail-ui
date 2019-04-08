import DateCustomGetter from './DateCustomGetter';
import {
  DateComponentType,
  DateCustomComponentRaw,
  DateCustomComponentsNumber,
  DateCustomComponentsRaw,
} from './types';

export default class DateCustomValidator {
  public static checkForNull({ year, month, date }: DateCustomComponentsRaw, type?: DateComponentType) {
    if (type !== undefined) {
      if (type === DateComponentType.Year) {
        return year !== null;
      } else if (type === DateComponentType.Month) {
        return month !== null;
      }
      return date !== null;
    }
    return !(year === null || month === null || date === null);
  }

  public static checkLimits({ year, month, date }: DateCustomComponentsNumber, type?: DateComponentType): boolean {
    if (type !== undefined) {
      const value = type === DateComponentType.Year ? year : type === DateComponentType.Month ? month : date;

      return value >= DateCustomGetter.getDefaultMin(type) && value <= DateCustomGetter.getDefaultMax(type);
    }
    return (
      year >= DateCustomGetter.getDefaultMin(DateComponentType.Year) &&
      year <= DateCustomGetter.getDefaultMax(DateComponentType.Year) &&
      month >= DateCustomGetter.getDefaultMin(DateComponentType.Month) &&
      month <= DateCustomGetter.getDefaultMax(DateComponentType.Month) &&
      date >= DateCustomGetter.getDefaultMin(DateComponentType.Date) &&
      date <= DateCustomGetter.getDefaultMax(DateComponentType.Date)
    );
  }

  public static compareWithNativeDate({ year, month, date }: DateCustomComponentsNumber): boolean {
    const nativeDate: Date = new Date(Date.UTC(year, month - 1, date));

    return (
      nativeDate.getUTCFullYear() === year && nativeDate.getUTCMonth() + 1 === month && nativeDate.getUTCDate() === date
    );
  }

  public static checkRangeFully(date: number, startDate: number | null, endDate: number | null): boolean {
    if (startDate === null && endDate === null) {
      return true;
    }
    startDate = startDate || -Infinity;
    endDate = endDate || Infinity;
    return date >= startDate && date <= endDate;
  }

  public static checkRangePiecemeal(
    type: DateComponentType,
    { year, month, date }: DateCustomComponentsNumber,
    startComponents: DateCustomComponentsNumber | null,
    endComponents: DateCustomComponentsNumber | null,
  ): boolean {
    if (startComponents === null && endComponents === null) {
      return true;
    }
    const { year: startYear = -Infinity, month: startMonth = -Infinity, date: startDate = -Infinity } =
      startComponents || {};
    const { year: endYear = Infinity, month: endMonth = Infinity, date: endDate = Infinity } = endComponents || {};

    if (type === DateComponentType.Year) {
      return !(year < startYear || year > endYear);
    } else if (type === DateComponentType.Month) {
      return !((year === startYear && month < startMonth) || (year === endYear && month > endMonth));
    } else if (type === DateComponentType.Date) {
      return !(
        (year === startYear && month === startMonth && date < startDate) ||
        (year === endYear && month === endMonth && date > endDate)
      );
    }
    return true;
  }

  public static testParseToNumber(value: DateCustomComponentRaw): boolean {
    return value !== null && (typeof value === 'number' || !/^0*$/.test(value) && !Number.isNaN(parseInt(value, 10)));
  }
}
