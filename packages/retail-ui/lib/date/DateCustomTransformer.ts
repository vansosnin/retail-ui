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
  DateCustomComponents,
  DateComponentsNumber,
  DateCustomOrder,
  DateComponentType,
  DateCustomComponentRaw,
  DateCustomFragment,
  DateCustomToFragmentsSettings,
} from './types';

export default class DateCustomTransformer {
  public static padStart = (value: DateCustomComponentRaw, length: number): string =>
    String(value || '').padStart(length, CHAR_PAD);

  public static padYear = (year: DateCustomComponentRaw): string => DateCustomTransformer.padStart(year, LENGTH_YEAR);
  public static padMonth = (month: DateCustomComponentRaw): string => DateCustomTransformer.padStart(month, LENGTH_MONTH);
  public static padDate = (date: DateCustomComponentRaw): string => DateCustomTransformer.padStart(date, LENGTH_DATE);

  public static dateToFragments = (
    dateCustom: DateCustom,
    settings: DateCustomToFragmentsSettings = {},
  ): DateCustomFragment[] => {
    const {
      order = dateCustom.getOrder(),
      separator = dateCustom.getSeparator(),
      withSeparator = false,
      withPad = true,
      withValidation = false,
    } = settings;
    const year: DateCustomFragment = {
      type: DateComponentType.Year,
      value: dateCustom.getYear(),
      length: LENGTH_YEAR,
    };
    const month: DateCustomFragment = {
      type: DateComponentType.Month,
      value: dateCustom.getMonth(),
      length: LENGTH_MONTH,
    };
    const date: DateCustomFragment = {
      type: DateComponentType.Date,
      value: dateCustom.getDate(),
      length: LENGTH_DATE,
    };

    if (withPad) {
      year.valueWithPad = DateCustomTransformer.padYear(year.value);
      month.valueWithPad = DateCustomTransformer.padMonth(month.value);
      date.valueWithPad = DateCustomTransformer.padDate(date.value);
    }

    if (withValidation) {
      year.isValid = DateCustomValidator.checkRangePiecemeal(DateComponentType.Year, dateCustom);
      month.isValid = DateCustomValidator.checkRangePiecemeal(DateComponentType.Month, dateCustom);
      date.isValid = DateCustomValidator.checkRangePiecemeal(DateComponentType.Date, dateCustom);
    }

    const fragments: DateCustomFragment[] = [];
    if (order === DateCustomOrder.YMD) {
      fragments.push(year, month, date);
    } else if (order === DateCustomOrder.MDY) {
      fragments.push(month, date, year);
    } else if (order === DateCustomOrder.DMY) {
      fragments.push(date, month, year);
    }

    if (withSeparator) {
      const separatorFragment: DateCustomFragment = {
        type: DateComponentType.Separator,
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
    order: DateCustomOrder = defaultDateComponentsOrder,
  ): DateCustomComponents {
    const dateComponents: DateCustomComponents = { ...emptyDateComponents };
    if (!value) {
      return dateComponents;
    }

    const match = DateCustomTransformer.getRegExpForParse(order).exec(value);

    if (match) {
      const matchFinished = match.slice(1).map(item => (item ? Number(item) : null));
      if (order === DateCustomOrder.YMD) {
        ({ 0: dateComponents.year, 1: dateComponents.month, 2: dateComponents.date } = matchFinished);
      } else if (order === DateCustomOrder.MDY) {
        ({ 2: dateComponents.year, 0: dateComponents.month, 1: dateComponents.date } = matchFinished);
      } else if (order === DateCustomOrder.DMY) {
        ({ 2: dateComponents.year, 1: dateComponents.month, 0: dateComponents.date } = matchFinished);
      }
    }
    return dateComponents;
  }

  public static dateToString(dateCustom: DateCustom): string {
    if (!DateCustomValidator.checkForNull(dateCustom)) {
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
      DateCustomTransformer.dateToFragments(dateCustom, { order: DateCustomOrder.YMD, withValidation: false })
        .map(({ valueWithPad }) => valueWithPad)
        .join(''),
    );
  }

  public static dateComponentsToNumber(dateCustom: DateCustom | null): DateComponentsNumber {
    if (dateCustom === null) {
      return { year: 0, month: 0, date: 0 };
    }
    const { year, month, date } = dateCustom.getComponentsRaw();
    return { year: Number(year), month: Number(month), date: Number(date) };
  }

  public static getRegExpForParse(order: DateCustomOrder): RegExp {
    return order === DateCustomOrder.MDY
      ? RE_ORDER_MDY
      : order === DateCustomOrder.DMY
        ? RE_ORDER_DMY
        : RE_ORDER_YMD;
  }
}
