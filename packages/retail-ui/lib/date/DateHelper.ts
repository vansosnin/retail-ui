import { Nullable } from '../../typings/utility-types';
import { CHAR_MASK, CHAR_PAD, defaultDateComponentsOrder, LENGTH_DATE, LENGTH_MONTH, LENGTH_YEAR } from './constants';
import { DateCustom } from './DateCustom';
import { DateComponents, DateComponentsOrder, DateComponentsType, DateFragment } from './types';

export class DateHelper {
  public static cache: {
    dates: { [key: string]: DateComponents };
    values: Map<DateComponents, string>;
    numbers: Map<DateComponents, number>;
  } = {
    dates: {},
    values: new Map(),
    numbers: new Map(),
  };

  public static padStart = (value: Nullable<number>, length: number): string =>
    String(value || '').padStart(length, value ? CHAR_PAD : CHAR_MASK);

  public static padYear = (year: Nullable<number>): string => DateHelper.padStart(year, LENGTH_YEAR);
  public static padMonth = (month: Nullable<number>): string => DateHelper.padStart(month, LENGTH_MONTH);
  public static padDate = (date: Nullable<number>): string => DateHelper.padStart(date, LENGTH_DATE);

  public static dateToFragments = (
    dateCustom: DateCustom,
    {
      order = dateCustom.getOrder(),
      withSeparator = false,
    }: { order?: DateComponentsOrder; withSeparator?: boolean } = {},
  ): DateFragment[] => {
    const components = dateCustom.getComponents();
    const padYear = { type: DateComponentsType.Year, value: DateHelper.padYear(components.year) };
    const padMonth = { type: DateComponentsType.Month, value: DateHelper.padMonth(components.month) };
    const padDate = { type: DateComponentsType.Date, value: DateHelper.padDate(components.date) };

    const fragments: DateFragment[] = [];
    if (order === DateComponentsOrder.YMD) {
      fragments.push(padYear, padMonth, padDate);
    } else if (order === DateComponentsOrder.MDY) {
      fragments.push(padMonth, padDate, padYear);
    } else if (order === DateComponentsOrder.DMY) {
      fragments.push(padDate, padMonth, padYear);
    }

    if (withSeparator) {
      const separator: DateFragment = { type: DateComponentsType.Separator, value: dateCustom.getSeparator() };
      fragments.splice(1, 0, separator);
      fragments.splice(3, 0, separator);
    }

    return fragments;
  };

  public static parseValueToDate(
    value: Nullable<string>,
    order: DateComponentsOrder = defaultDateComponentsOrder,
  ): DateComponents {
    const dateComponents: DateComponents = {
      year: null,
      month: null,
      date: null,
    };
    if (!value) {
      return dateComponents;
    }
    if (DateHelper.cache.dates[value]) {
      return {...DateHelper.cache.dates[value]};
    }

    const match = DateHelper.getRegExpForParse(order).exec(value);

    if (match) {
      const matchFinished = match.slice(1).map(item => (item ? Number(item) : null));
      if (order === DateComponentsOrder.YMD) {
        ({ 0: dateComponents.year, 1: dateComponents.month, 2: dateComponents.date } = matchFinished);
      } else if (order === DateComponentsOrder.MDY) {
        ({ 2: dateComponents.year, 0: dateComponents.month, 1: dateComponents.date } = matchFinished);
      } else if (order === DateComponentsOrder.DMY) {
        ({ 2: dateComponents.year, 1: dateComponents.month, 0: dateComponents.date } = matchFinished);
      }
    }
    DateHelper.cache.dates[value] = dateComponents;
    return dateComponents;
  }

  public static dateToValue(dateCustom: DateCustom): string {
    const components = dateCustom.getComponents();
    const _value = DateHelper.cache.values.get(components);
    if (_value !== undefined) {
      return _value;
    }
    if (!components || !dateCustom.isValid) {
      return '';
    }
    const string = DateHelper.dateToFragments(dateCustom, { withSeparator: true })
      .map(({ value }) => value)
      .join('');
    DateHelper.cache.values.set(components, string);
    return string;
  }

  /**
   * Перевод даты в числовое представление (**НЕ** аналог `timestamp`)
   * Предназначено для быстрого сравнивания дат `<=>`
   */
  public static dateToNumber(dateCustom: DateCustom): number {
    const components = dateCustom.getComponents();
    let number = DateHelper.cache.numbers.get(components);
    if (number !== undefined) {
      return number;
    }
    number = Number(
      DateHelper.dateToFragments(dateCustom, { order: DateComponentsOrder.YMD })
        .map(({ value }) => value)
        .join(''),
    );
    DateHelper.cache.numbers.set(components, number);
    return number;
  }

  public static max(datesCustom: DateCustom[]): DateCustom {
    return datesCustom.sort((a, b) => b.getNumber() - a.getNumber())[0]
  }

  public static getRegExpForParse(order: DateComponentsOrder): RegExp {
    const res = `(?:\\.|\\/|\\-|\\s)`;
    if (order === DateComponentsOrder.MDY) {
      return new RegExp(`(\\d{1,${LENGTH_MONTH}})?${res}?(\\d{1,${LENGTH_DATE}})?${res}?(\\d{1,${LENGTH_YEAR}})?`)
    } else if (order === DateComponentsOrder.DMY) {
      return new RegExp(`(\\d{1,${LENGTH_DATE}})?${res}?(\\d{1,${LENGTH_MONTH}})?${res}?(\\d{1,${LENGTH_YEAR}})?`)
    }
    return new RegExp(`(\\d{1,${LENGTH_YEAR}})?${res}?(\\d{1,${LENGTH_MONTH}})?${res}?(\\d{1,${LENGTH_DATE}})?`)
  }
}
