import { Nullable } from '../../typings/utility-types';
import { CHAR_MASK, CHAR_PAD, defaultDateComponentsOrder, LENGTH_DATE, LENGTH_MONTH, LENGTH_YEAR } from './constants';
import { DateCustom } from './DateCustom';
import { DateComponents, DateComponentsOrder, DateComponentsType, DateCustomFragment } from './types';

export default class DateCustomTransformer {
  public static cache: {
    dates: { [key: string]: DateComponents };
    values: Map<DateComponents, string>;
    numbers: Map<DateComponents, number>;
  } = {
    dates: {},
    values: new Map(),
    numbers: new Map(),
  };

  public static padStart = (value: Nullable<number | string>, length: number): string =>
    String(value || '').padStart(length, value ? CHAR_PAD : CHAR_MASK);

  public static padYear = (year: Nullable<number | string>): string => DateCustomTransformer.padStart(year, LENGTH_YEAR);
  public static padMonth = (month: Nullable<number | string>): string => DateCustomTransformer.padStart(month, LENGTH_MONTH);
  public static padDate = (date: Nullable<number | string>): string => DateCustomTransformer.padStart(date, LENGTH_DATE);

  public static max = (datesCustom: DateCustom[]): DateCustom =>
    datesCustom.sort((a, b) => b.getNumber() - a.getNumber())[0];

  public static dateToFragments = (
    dateCustom: DateCustom,
    {
      order = dateCustom.getOrder(),
      withSeparator = false,
      isPad = true,
    }: { order?: DateComponentsOrder; withSeparator?: boolean; isPad?: boolean } = {},
  ): DateCustomFragment[] => {
    const components = dateCustom.getComponents();
    const year: DateCustomFragment = {
      type: DateComponentsType.Year,
      value: isPad ? DateCustomTransformer.padYear(components.year) : components.year,
      length: LENGTH_YEAR,
    };
    const month: DateCustomFragment = {
      type: DateComponentsType.Month,
      value: isPad ? DateCustomTransformer.padMonth(components.month) : components.month,
      length: LENGTH_MONTH,
    };
    const date: DateCustomFragment = {
      type: DateComponentsType.Date,
      value: isPad ? DateCustomTransformer.padDate(components.date) : components.date,
      length: LENGTH_DATE,
    };

    const fragments: DateCustomFragment[] = [];
    if (order === DateComponentsOrder.YMD) {
      fragments.push(year, month, date);
    } else if (order === DateComponentsOrder.MDY) {
      fragments.push(month, date, year);
    } else if (order === DateComponentsOrder.DMY) {
      fragments.push(date, month, year);
    }

    if (withSeparator) {
      const separator: DateCustomFragment = {
        type: DateComponentsType.Separator,
        value: dateCustom.getSeparator(),
        length: 1,
      };
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
    if (DateCustomTransformer.cache.dates[value]) {
      return { ...DateCustomTransformer.cache.dates[value] };
    }

    const match = DateCustomTransformer.getRegExpForParse(order).exec(value);

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
    DateCustomTransformer.cache.dates[value] = dateComponents;
    return dateComponents;
  }

  public static dateToValue(dateCustom: DateCustom): string {
    const components = dateCustom.getComponents();
    const _value = DateCustomTransformer.cache.values.get(components);
    if (_value !== undefined) {
      return _value;
    }
    if (!components || !dateCustom.isValid) {
      return '';
    }
    const string = DateCustomTransformer.dateToFragments(dateCustom, { withSeparator: true })
      .map(({ value }) => value)
      .join('');
    DateCustomTransformer.cache.values.set(components, string);
    return string;
  }

  /**
   * Перевод даты в числовое представление (**НЕ** аналог `timestamp`)
   * Предназначено для быстрого сравнивания дат `<=>`
   */
  public static dateToNumber(dateCustom: DateCustom): number {
    const components = dateCustom.getComponents();
    let number = DateCustomTransformer.cache.numbers.get(components);
    if (number !== undefined) {
      return number;
    }
    number = Number(
      DateCustomTransformer.dateToFragments(dateCustom, { order: DateComponentsOrder.YMD })
        .map(({ value }) => value)
        .join(''),
    );
    DateCustomTransformer.cache.numbers.set(components, number);
    return number;
  }

  public static getRegExpForParse(order: DateComponentsOrder): RegExp {
    const res = `(?:\\.|\\/|\\-|\\s)`;
    if (order === DateComponentsOrder.MDY) {
      return new RegExp(`(\\d{1,${LENGTH_MONTH}})?${res}?(\\d{1,${LENGTH_DATE}})?${res}?(\\d{1,${LENGTH_YEAR}})?`);
    } else if (order === DateComponentsOrder.DMY) {
      return new RegExp(`(\\d{1,${LENGTH_DATE}})?${res}?(\\d{1,${LENGTH_MONTH}})?${res}?(\\d{1,${LENGTH_YEAR}})?`);
    }
    return new RegExp(`(\\d{1,${LENGTH_YEAR}})?${res}?(\\d{1,${LENGTH_MONTH}})?${res}?(\\d{1,${LENGTH_DATE}})?`);
  }
}
