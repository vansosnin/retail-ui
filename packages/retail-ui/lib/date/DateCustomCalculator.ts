import { DateCustom } from './DateCustom';
import DateCustomGetter from './DateCustomGetter';
import DateCustomTransformer from './DateCustomTransformer';
import {
  DateComponentType,
  DateCustomChangeValueDateComponentSettings,
  DateCustomComponent,
  DateCustomComponentRaw,
} from './types';

export default class DateCustomCalculator {
  public static calcShiftYear(
    dateCustom: DateCustom,
    step: number,
    prevValue: DateCustomComponentRaw,
    { isLoop, isRange = false }: DateCustomChangeValueDateComponentSettings,
  ): DateCustomComponent {
    const minValue =
      (isRange && DateCustomCalculator.calcStartDateComponent(DateComponentType.Year, dateCustom)) ||
      DateCustomGetter.getDefaultMinValueDateComponent(DateComponentType.Year);
    const maxValue =
      (isRange && DateCustomCalculator.calcEndDateComponent(DateComponentType.Year, dateCustom)) ||
      DateCustomGetter.getDefaultMaxValueDateComponent(DateComponentType.Year);

    return DateCustomCalculator.calcShiftValueDateComponent(
      step,
      prevValue,
      minValue,
      maxValue,
      isLoop,
    );
  }

  public static calcShiftMonth(
    dateCustom: DateCustom,
    step: number,
    prevValue: DateCustomComponentRaw,
    { isLoop, isRange = false }: DateCustomChangeValueDateComponentSettings,
  ): DateCustomComponent {
    const minValue =
      (isRange && DateCustomCalculator.calcStartDateComponent(DateComponentType.Month, dateCustom)) ||
      DateCustomGetter.getDefaultMinValueDateComponent(DateComponentType.Month);
    const maxValue =
      (isRange && DateCustomCalculator.calcEndDateComponent(DateComponentType.Month, dateCustom)) ||
      DateCustomGetter.getDefaultMaxValueDateComponent(DateComponentType.Month);

    return DateCustomCalculator.calcShiftValueDateComponent(
      step,
      prevValue,
      minValue,
      maxValue,
      isLoop,
    );
  }

  public static calcShiftDate(
    dateCustom: DateCustom,
    step: number,
    prevValue: DateCustomComponentRaw,
    { isLoop, isRange = false }: DateCustomChangeValueDateComponentSettings,
  ): DateCustomComponent {
    const minValue =
      (isRange && DateCustomCalculator.calcStartDateComponent(DateComponentType.Date, dateCustom)) ||
      DateCustomGetter.getDefaultMinValueDateComponent(DateComponentType.Date);
    const maxValue =
      (isRange && DateCustomCalculator.calcEndDateComponent(DateComponentType.Date, dateCustom)) ||
      DateCustomGetter.getDefaultMaxValueDateComponent(DateComponentType.Date, dateCustom);

    return DateCustomCalculator.calcShiftValueDateComponent(
      step,
      prevValue,
      minValue,
      maxValue,
      isLoop,
    );
  }

  public static calcStartDateComponent(
    type: DateComponentType,
    dateCustom: DateCustom,
    start: DateCustom | null = dateCustom.getRangeStart(),
  ): DateCustomComponent {
    const { year, month } = DateCustomTransformer.dateComponentsToNumber(dateCustom);
    const { year: startYear, month: startMonth, date: startDate } = DateCustomTransformer.dateComponentsToNumber(start);

    if (type === DateComponentType.Year) {
      return startYear;
    } else if (type === DateComponentType.Month) {
      if (year === startYear) {
        return startMonth;
      }
    } else if (type === DateComponentType.Date) {
      if (year === startYear && month === startMonth) {
        return startDate;
      }
    }
    return null;
  }

  public static calcEndDateComponent(
    type: DateComponentType,
    dateCustom: DateCustom,
    end: DateCustom | null = dateCustom.getRangeEnd(),
  ): DateCustomComponent {
    const { year, month } = DateCustomTransformer.dateComponentsToNumber(dateCustom);
    const { year: endYear, month: endMonth, date: endDate } = DateCustomTransformer.dateComponentsToNumber(end);

    if (type === DateComponentType.Year) {
      return endYear;
    } else if (type === DateComponentType.Month) {
      if (year === endYear) {
        return endMonth;
      }
    } else if (type === DateComponentType.Date) {
      if (year === endYear && month === endMonth) {
        return endDate;
      }
    }
    return null;
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

  public static restoreYear(dateCustom: DateCustom, year: DateCustomComponentRaw): DateCustomComponent {
    year = Number(year);
    if (year > 0 && year < 100) {
      if (year > 50) {
        year += 1900;
      } else {
        year += 2000;
      }
    }
    return DateCustomCalculator.calcShiftYear(dateCustom, year, 0, {
      isLoop: false,
      isRange: true,
    });
  }
  public static restoreMonth(dateCustom: DateCustom, month: DateCustomComponentRaw) {
    month = Number(month);
    return DateCustomCalculator.calcShiftMonth(dateCustom, month, 0, {
      isLoop: false,
      isRange: false,
    });
  }
  public static restoreDate(dateCustom: DateCustom, date: DateCustomComponentRaw) {
    date = Number(date);
    return DateCustomCalculator.calcShiftDate(dateCustom, date, 0, {
      isLoop: false,
      isRange: false,
    });
  }
}
