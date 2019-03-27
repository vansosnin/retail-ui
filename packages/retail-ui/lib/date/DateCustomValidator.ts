import { emptyDateComponentsNumber } from './constants';
import { DateCustom } from './DateCustom';
import DateCustomTransformer from './DateCustomTransformer';
import { DateComponents, DateComponentsType } from './types';

export default class DateCustomValidator {
  public static max = (datesCustom: DateCustom[]): DateCustom =>
    datesCustom.sort((a, b) => b.toNumber() - a.toNumber())[0];

  public static min = (datesCustom: DateCustom[]): DateCustom =>
    datesCustom.sort((a, b) => a.toNumber() - b.toNumber())[0];

  public static leapYear = (year: number): boolean => (year % 4 === 0 && year % 100 !== 0) || year % 400 === 0;

  public static getMaxDaysInMonth(month: number, yearForFebruary?: number): number {
    if (month === 2) {
      return yearForFebruary && DateCustomValidator.leapYear(yearForFebruary) ? 29 : 28;
    }
    if (month <= 7) {
      return month % 2 === 0 ? 30 : 31;
    }
    return month % 2 === 0 ? 31 : 30;
  }

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

  public static checkRangeFully(
    self: DateCustom,
    start?: DateCustom | null,
    end?: DateCustom | null,
  ): boolean {
    if (start === null && end === null) {
      return true;
    }
    const stampSelf = self.toNumber();
    const stampStart = start ? start.toNumber() : -Infinity;
    const stampEnd = end ? end.toNumber() : Infinity;
    return stampSelf >= stampStart && stampSelf <= stampEnd;
  }

  public static checkRangePiecemeal(
    type: DateComponentsType,
    self: DateCustom,
    start?: DateCustom | null,
    end?: DateCustom | null,
  ) {
    if (start === null && end === null) {
      return true;
    }
    const selfComponents = DateCustomTransformer.dateComponentsToNumber(self);
    const startComponents = (start && DateCustomTransformer.dateComponentsToNumber(start)) || emptyDateComponentsNumber;
    const endComponents = (end && DateCustomTransformer.dateComponentsToNumber(end)) || emptyDateComponentsNumber;
    if (selfComponents.year < startComponents.year || selfComponents.year > endComponents.year) {
      return false;
    }
    if (
      (selfComponents.year === startComponents.year && selfComponents.month < startComponents.month) ||
      (selfComponents.year === endComponents.year && selfComponents.month > endComponents.month)
    ) {
      return false;
    }
    return !(
      (selfComponents.month === startComponents.month && selfComponents.date < startComponents.date) ||
      (selfComponents.month === endComponents.month && selfComponents.date > endComponents.date)
    );
  }
}
