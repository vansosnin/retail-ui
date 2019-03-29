import {
  CHAR_PAD,
  defaultDateComponentsOrder,
  emptyDateComponents,
  LENGTH_DATE,
  LENGTH_MONTH,
  LENGTH_YEAR,
  RE_ORDER_DMY,
  RE_ORDER_MDY,
  RE_ORDER_YMD,
} from './constants';
import { DateCustom } from './DateCustom';
import DateCustomValidator from './DateCustomValidator';
import {
  DateComponents,
  DateComponentsNumber,
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
      withPad = true,
      withValidation = false,
    } = settings;
    const year: DateCustomFragment = {
      type: DateComponentsType.Year,
      value: components.year,
      length: LENGTH_YEAR,
    };
    const month: DateCustomFragment = {
      type: DateComponentsType.Month,
      value: components.month,
      length: LENGTH_MONTH,
    };
    const date: DateCustomFragment = {
      type: DateComponentsType.Date,
      value: components.date,
      length: LENGTH_DATE,
    };

    if (withPad) {
      year.value = DateCustomTransformer.padYear(components.year);
      month.value = DateCustomTransformer.padMonth(components.month);
      date.value = DateCustomTransformer.padDate(components.date);
    }

    if (withValidation) {
      year.isValid = DateCustomValidator.checkRangePiecemeal(DateComponentsType.Year, dateCustom);
      month.isValid = DateCustomValidator.checkRangePiecemeal(DateComponentsType.Month, dateCustom);
      date.isValid = DateCustomValidator.checkRangePiecemeal(DateComponentsType.Date, dateCustom);
    }

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
    const dateComponents: DateComponents = { ...emptyDateComponents };
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
      DateCustomTransformer.dateToFragments(dateCustom, { order: DateComponentsOrder.YMD, withValidation: false })
        .map(({ value }) => value)
        .join(''),
    );
  }

  public static dateComponentsToNumber(dateCustom: DateCustom | null): DateComponentsNumber {
    if (dateCustom === null) {
      return { year: 0, month: 0, date: 0 };
    }
    const { year, month, date } = dateCustom.getComponents();
    return { year: Number(year), month: Number(month), date: Number(date) };
  }

  public static getRegExpForParse(order: DateComponentsOrder): RegExp {
    return order === DateComponentsOrder.MDY
      ? RE_ORDER_MDY
      : order === DateComponentsOrder.DMY
        ? RE_ORDER_DMY
        : RE_ORDER_YMD;
  }
}
