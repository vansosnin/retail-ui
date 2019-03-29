import { MAX_DATE, MAX_MONTH, MAX_YEAR, MIN_DATE, MIN_MONTH, MIN_YEAR } from './constants';
import { DateCustom } from './DateCustom';
import DateCustomTransformer from './DateCustomTransformer';
import {
  ChangeValueDateComponentSettings,
  DateComponent,
  DateComponentActionType,
  DateComponents,
  DateComponentsType,
} from './types';

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
    type: DateComponentsType | null,
  ): DateComponent | DateComponents {
    if (type === DateComponentsType.Year) {
      return dateCustom.getYear();
    } else if (type === DateComponentsType.Month) {
      return dateCustom.getMonth();
    } else if (type === DateComponentsType.Date) {
      return dateCustom.getDate();
    } else if (type === DateComponentsType.All) {
      return dateCustom.getComponents();
    }
    return null;
  }

  public static calcStartDateComponent(
    type: DateComponentsType,
    dateCustom: DateCustom,
    start: DateCustom | null = dateCustom.getRangeStart(),
  ): DateComponent {
    const { year, month } = DateCustomTransformer.dateComponentsToNumber(dateCustom);
    const { year: startYear, month: startMonth, date: startDate } = DateCustomTransformer.dateComponentsToNumber(start);

    if (type === DateComponentsType.Year) {
      return startYear;
    } else if (type === DateComponentsType.Month) {
      if (year === startYear) {
        return startMonth;
      }
    } else if (type === DateComponentsType.Date) {
      if (year === startYear && month === startMonth) {
        return startDate;
      }
    }
    return null;
  }

  public static calcEndDateComponent(
    type: DateComponentsType,
    dateCustom: DateCustom,
    end: DateCustom | null = dateCustom.getRangeEnd(),
  ): DateComponent {
    const { year, month } = DateCustomTransformer.dateComponentsToNumber(dateCustom);
    const { year: endYear, month: endMonth, date: endDate } = DateCustomTransformer.dateComponentsToNumber(end);

    if (type === DateComponentsType.Year) {
      return endYear;
    } else if (type === DateComponentsType.Month) {
      if (year === endYear) {
        return endMonth;
      }
    } else if (type === DateComponentsType.Date) {
      if (year === endYear && month === endMonth) {
        return endDate;
      }
    }
    return null;
  }

  public static getDefaultMinValueDateComponent(type: DateComponentsType): number {
    if (type === DateComponentsType.Year) {
      return MIN_YEAR;
    } else if (type === DateComponentsType.Month) {
      return MIN_MONTH;
    } else if (type === DateComponentsType.Date) {
      return MIN_DATE;
    }
    return MIN_DATE;
  }

  public static getDefaultMaxValueDateComponent(type: DateComponentsType, dateCustom: DateCustom): number {
    if (type === DateComponentsType.Year) {
      return MAX_YEAR;
    } else if (type === DateComponentsType.Month) {
      return MAX_MONTH;
    } else if (type === DateComponentsType.Date) {
      const { year, month } = dateCustom.getComponents();
      return year && month ? DateCustomGetter.getMaxDaysInMonth(month, year) : MAX_DATE;
    }
    return MAX_DATE;
  }

  public static calcYear(
    dateCustom: DateCustom,
    actionType: DateComponentActionType,
    value: number | null,
    { isLoop, isRange = false }: ChangeValueDateComponentSettings,
  ): DateComponent {
    const minValue =
      (isRange && DateCustomGetter.calcStartDateComponent(DateComponentsType.Year, dateCustom)) ||
      DateCustomGetter.getDefaultMinValueDateComponent(DateComponentsType.Year);
    const maxValue =
      (isRange && DateCustomGetter.calcEndDateComponent(DateComponentsType.Year, dateCustom)) ||
      DateCustomGetter.getDefaultMaxValueDateComponent(DateComponentsType.Year, dateCustom);

    return DateCustomGetter.getNextValueDateComponent(
      DateComponentsType.Year,
      actionType,
      value,
      dateCustom.getYear(),
      minValue,
      maxValue,
      isLoop,
    );
  }

  public static calcMonth(
    dateCustom: DateCustom,
    actionType: DateComponentActionType,
    value: number | null,
    { isLoop, isRange = false }: ChangeValueDateComponentSettings,
  ): DateComponent {
    const minValue =
      (isRange && DateCustomGetter.calcStartDateComponent(DateComponentsType.Month, dateCustom)) ||
      DateCustomGetter.getDefaultMinValueDateComponent(DateComponentsType.Month);
    const maxValue =
      (isRange && DateCustomGetter.calcEndDateComponent(DateComponentsType.Month, dateCustom)) ||
      DateCustomGetter.getDefaultMaxValueDateComponent(DateComponentsType.Month, dateCustom);

    return DateCustomGetter.getNextValueDateComponent(
      DateComponentsType.Month,
      actionType,
      value,
      dateCustom.getMonth(),
      minValue,
      maxValue,
      isLoop,
    );
  }

  public static calcDate(
    dateCustom: DateCustom,
    actionType: DateComponentActionType,
    value: number | null,
    { isLoop, isRange = false }: ChangeValueDateComponentSettings,
  ): DateComponent {
    const minValue =
      (isRange && DateCustomGetter.calcStartDateComponent(DateComponentsType.Date, dateCustom)) ||
      DateCustomGetter.getDefaultMinValueDateComponent(DateComponentsType.Date);
    const maxValue =
      (isRange && DateCustomGetter.calcEndDateComponent(DateComponentsType.Date, dateCustom)) ||
      DateCustomGetter.getDefaultMaxValueDateComponent(DateComponentsType.Date, dateCustom);

    return DateCustomGetter.getNextValueDateComponent(
      DateComponentsType.Date,
      actionType,
      value,
      dateCustom.getDate(),
      minValue,
      maxValue,
      isLoop,
    );
  }

  public static getNextValueDateComponent(
    componentsType: DateComponentsType,
    actionType: DateComponentActionType,
    value: number | null,
    prevValue: number | null,
    start: number,
    end: number,
    isLoop: boolean = true,
  ): DateComponent {
    if (value === null) {
      return null;
    }
    if (actionType === DateComponentActionType.Shift) {
      value = prevValue === null ? value : prevValue + value;
      if (isLoop) {
        return value < start ? end : value > end ? start : value;
      }
    }
    return value < start ? start : value > end ? end : value;
  }
}
