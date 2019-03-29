import { DateCustom } from './DateCustom';
import DateCustomTransformer from './DateCustomTransformer';
import { DateComponents, DateComponentsType } from './types';

export default class DateCustomValidator {
  public static compareWithNativeDate(dateCustom: DateCustom): boolean {
    const { year, month, date }: DateComponents = dateCustom.getComponents();
    if (year === null || month === null || date === null) {
      return false;
    }
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
    const currentNumber = dateCustom.toNumber();
    const startNumber = start ? start.toNumber() : -Infinity;
    const endNumber = end ? end.toNumber() : Infinity;
    return currentNumber >= startNumber && currentNumber <= endNumber;
  }

  public static checkRangePiecemeal(type: DateComponentsType, dateCustom: DateCustom): boolean {
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

    if (type === DateComponentsType.Year) {
      return !(year < startYear || year > endYear);
    } else if (type === DateComponentsType.Month) {
      return !((year === startYear && month < startMonth) || (year === endYear && month > endMonth));
    } else if (type === DateComponentsType.Date) {
      return !(
        (year === startYear && month === startMonth && date < startDate) ||
        (year === endYear && month === endMonth && date > endDate)
      );
    }
    return true;
  }
}
