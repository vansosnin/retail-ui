import { CHAR_PAD, defaultDateComponentsOrder, LENGTH_DATE, LENGTH_MONTH, LENGTH_YEAR } from './constants';
import { DateCustom } from './DateCustom';
import {
  DateComponents, DateComponentsNumber,
  DateComponentsOrder,
  DateComponentsType,
  DateCustomFragment,
  DateToFragmentsSettings,
} from './types';

export default class DateCustomTransformer {
  public static padStart = (value: number | string | null, length: number): string =>
    String(value || '').padStart(length, CHAR_PAD);

  public static padYear = (year: number | string | null): string => DateCustomTransformer.padStart(year, LENGTH_YEAR);
  public static padMonth = (month: number | string | null): string =>
    DateCustomTransformer.padStart(month, LENGTH_MONTH);
  public static padDate = (date: number | string | null): string => DateCustomTransformer.padStart(date, LENGTH_DATE);

  public static dateToFragments = (
    dateCustom: DateCustom,
    settings: DateToFragmentsSettings = {},
  ): DateCustomFragment[] => {
    const {
      order = dateCustom.getOrder(),
      components = dateCustom.getComponents(),
      separator = dateCustom.getSeparator(),
      withSeparator = false,
      isPad = true,
    } = settings;
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
      const separatorFragment: DateCustomFragment = {
        type: DateComponentsType.Separator,
        value: separator,
        length: 1,
      };
      fragments.splice(1, 0, separatorFragment);
      fragments.splice(3, 0, separatorFragment);
    }

    return fragments;
  };

  public static parseValueToDate(
    value: string | null,
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
    return dateComponents;
  }

  public static dateToValue(dateCustom: DateCustom): string {
    const components = dateCustom.getComponents();
    if (!components || !dateCustom.validate()) {
      return '';
    }
    return DateCustomTransformer.dateToFragments(dateCustom, { withSeparator: true })
      .map(({ value }) => value)
      .join('');
  }

  /**
   * Перевод даты в числовое представление (**НЕ** аналог `timestamp`)
   * Предназначено для быстрого сравнивания дат `<=>`
   */
  public static dateToNumber(dateCustom: DateCustom): number {
    return Number(
      DateCustomTransformer.dateToFragments(dateCustom, { order: DateComponentsOrder.YMD })
        .map(({ value }) => value)
        .join(''),
    );
  }

  public static dateComponentsToNumber(dateCustom: DateCustom): DateComponentsNumber {
    const { year, month, date } = dateCustom.getComponents();
    return { year: Number(year), month: Number(month), date: Number(date )};
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
