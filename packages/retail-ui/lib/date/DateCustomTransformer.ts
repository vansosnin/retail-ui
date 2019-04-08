import {
  CHAR_PAD,
  defaultDateComponentsOrder,
  defaultDateComponentsSeparator,
  emptyDateComponents,
  LENGTH_DATE,
  LENGTH_MONTH,
  LENGTH_SEPARATOR,
  LENGTH_YEAR,
  RE_ORDER_DMY,
  RE_ORDER_MDY,
  RE_ORDER_YMD,
} from './constants';
import DateCustomValidator from './DateCustomValidator';
import {
  DateComponentType,
  DateCustomComponentRaw,
  DateCustomComponents,
  DateCustomComponentsNumber,
  DateCustomComponentsRaw,
  DateCustomFragment,
  DateCustomOrder,
  DateCustomToFragmentsSettings,
} from './types';

export default class DateCustomTransformer {
  public static padStart = (value: DateCustomComponentRaw, length: number): string =>
    String(value || '').padStart(length, CHAR_PAD);

  public static padYear = (year: DateCustomComponentRaw): string => DateCustomTransformer.padStart(year, LENGTH_YEAR);
  public static padMonth = (month: DateCustomComponentRaw): string =>
    DateCustomTransformer.padStart(month, LENGTH_MONTH);
  public static padDate = (date: DateCustomComponentRaw): string => DateCustomTransformer.padStart(date, LENGTH_DATE);

  public static dateToFragments(
    components: DateCustomComponentsRaw,
    settings: DateCustomToFragmentsSettings = {},
  ): DateCustomFragment[] {
    const {
      order = defaultDateComponentsOrder,
      separator = defaultDateComponentsSeparator,
      withSeparator = false,
      withPad = false,
    } = settings;
    const year: DateCustomFragment = {
      type: DateComponentType.Year,
      value: components.year,
      length: LENGTH_YEAR,
    };
    const month: DateCustomFragment = {
      type: DateComponentType.Month,
      value: components.month,
      length: LENGTH_MONTH,
    };
    const date: DateCustomFragment = {
      type: DateComponentType.Date,
      value: components.date,
      length: LENGTH_DATE,
    };

    const fragments: DateCustomFragment[] = [];
    if (order === DateCustomOrder.YMD) {
      fragments.push(year, month, date);
    } else if (order === DateCustomOrder.MDY) {
      fragments.push(month, date, year);
    } else if (order === DateCustomOrder.DMY) {
      fragments.push(date, month, year);
    }

    if (withPad) {
      year.valueWithPad = DateCustomTransformer.padYear(year.value);
      month.valueWithPad = DateCustomTransformer.padMonth(month.value);
      date.valueWithPad = DateCustomTransformer.padDate(date.value);
    }

    // if (withValid) {
    //   const componentsNumber = DateCustomTransformer.dateComponentsStringToNumber(components);
      year.isValid = DateCustomValidator.testParseToNumber(year.value);
      month.isValid = DateCustomValidator.testParseToNumber(month.value);
      date.isValid = DateCustomValidator.testParseToNumber(date.value);
    // }

    if (withSeparator) {
      const separatorFragment: DateCustomFragment = {
        type: DateComponentType.Separator,
        value: separator,
        length: LENGTH_SEPARATOR,
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

    const re =
      order === DateCustomOrder.MDY ? RE_ORDER_MDY : order === DateCustomOrder.DMY ? RE_ORDER_DMY : RE_ORDER_YMD;
    const match = re.exec(value);

    if (match) {
      const matchFinished = match.slice(1).map(item => (item !== null && Number(item)) || null);
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

  public static dateComponentsStringToNumber(
    componentsRaw: DateCustomComponentsRaw | null,
  ): DateCustomComponentsNumber {
    if (componentsRaw === null) {
      return { year: 0, month: 0, date: 0 };
    }
    const { year, month, date } = componentsRaw;
    return { year: Number(year), month: Number(month), date: Number(date) };
  }
}
