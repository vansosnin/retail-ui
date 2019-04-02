import { MAX_DATE, MAX_MONTH, MAX_YEAR, MIN_DATE, MIN_MONTH, MIN_YEAR } from './constants';
import { DateCustom } from './DateCustom';
import DateCustomTransformer from './DateCustomTransformer';
import { DateComponentType } from './types';

export default class DateCustomValidator {
  public static checkForNull(dateCustom: DateCustom) {
    const { year, month, date } = dateCustom.getComponents();
    return !(year === null || month === null || date === null);
  }

  public static checkLimits(dateCustom: DateCustom): boolean {
    const { year, month, date } = DateCustomTransformer.dateComponentsToNumber(dateCustom);
    return (
      year >= MIN_YEAR &&
      year <= MAX_YEAR &&
      month >= MIN_MONTH &&
      month <= MAX_MONTH &&
      date >= MIN_DATE &&
      date <= MAX_DATE
    );
  }

  public static compareWithNativeDate(dateCustom: DateCustom): boolean {
    const { year, month, date } = DateCustomTransformer.dateComponentsToNumber(dateCustom);
    const nativeDate: Date = new Date(Date.UTC(year, month - 1, date));

    return (
      nativeDate.getUTCFullYear() === year && nativeDate.getUTCMonth() + 1 === month && nativeDate.getUTCDate() === date
    );
  }

  public static checkRangeFully(dateCustom: DateCustom): boolean {
    const start = dateCustom.getRangeStart();
    const end = dateCustom.getRangeEnd();
    if (start === null && end === null) {
      return true;
    }
    const date = dateCustom.toNumber();
    const startDate = start ? start.toNumber() : -Infinity;
    const endDate = end ? end.toNumber() : Infinity;
    return date >= startDate && date <= endDate;
  }

  public static checkRangePiecemeal(type: DateComponentType, dateCustom: DateCustom): boolean {
    const start = dateCustom.getRangeStart();
    const end = dateCustom.getRangeEnd();
    if (start === null && end === null) {
      return true;
    }
    const { year, month, date } = DateCustomTransformer.dateComponentsToNumber(dateCustom);
    const {
      year: startYear = -Infinity,
      month: startMonth = -Infinity,
      date: startDate = -Infinity,
    } = DateCustomTransformer.dateComponentsToNumber(start);
    const {
      year: endYear = Infinity,
      month: endMonth = Infinity,
      date: endDate = Infinity,
    } = DateCustomTransformer.dateComponentsToNumber(end);

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
}
