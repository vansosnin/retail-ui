import { Nullable } from '../../typings/utility-types';
import {
  defaultDateComponentsOrder,
  defaultDateComponentsSeparator,
  emptyDateComponents,
} from './constants';
import DateCustomSetter from './DateCustomSetter';
import DateCustomTransformer from './DateCustomTransformer';
import {
  DateComponents,
  DateComponentsActionType,
  DateComponentsOrder,
  DateComponentsSeparator, DateComponentsType,
  DateComponentsWithPad,
} from './types';

interface SettingsShiftValueDateComponents {
  // Учитывать разницу при преуменьшении/превышении итогового значения от допустимого минимального/максимального
  isDiff?: boolean;
  isLoop?: boolean;
}

export class DateCustom {
  private order: DateComponentsOrder;
  private separator: DateComponentsSeparator;
  private components: DateComponents = emptyDateComponents;

  public constructor(
    order: DateComponentsOrder = defaultDateComponentsOrder,
    separator: DateComponentsSeparator = defaultDateComponentsSeparator,
  ) {
    this.order = order;
    this.separator = separator;
  }

  public get isValid(): boolean {
    const { year, month, date }: DateComponents = this.components;
    if (typeof year !== 'number' || typeof month !== 'number' || typeof date !== 'number') {
      return false;
    }
    const nativeDate: Date = new Date(Date.UTC(year, month - 1, date));

    return (
      nativeDate.getUTCFullYear() === year && nativeDate.getUTCMonth() + 1 === month && nativeDate.getUTCDate() === date
    );
  }

  public getComponents(): DateComponents {
    return this.components;
  }

  public getSeparator(): DateComponentsSeparator {
    return this.separator;
  }

  public getOrder(): DateComponentsOrder {
    return this.order;
  }

  public getValue(): string {
    return DateCustomTransformer.dateToValue(this);
  }

  public getComponentsWithPad(): DateComponentsWithPad {
    return {
      year: this.padYear(),
      month: this.padMonth(),
      date: this.padDate(),
    };
  }

  public padYear = (): string => DateCustomTransformer.padYear(this.components.year);
  public padMonth = (): string => DateCustomTransformer.padMonth(this.components.month);
  public padDate = (): string => DateCustomTransformer.padDate(this.components.date);

  public parseValue(value: string = ''): DateCustom {
    this.setComponents(DateCustomTransformer.parseValueToDate(value, this.order));
    return this;
  }

  public setOrder(order: Nullable<DateComponentsOrder>): DateCustom {
    if (order) {
      this.order = order;
    }
    return this;
  }

  public setSeparator(separator: Nullable<DateComponentsSeparator>): DateCustom {
    if (separator) {
      this.separator = separator;
    }
    return this;
  }

  public setComponents(components: DateComponents): DateCustom {
    this.components = components;
    return this;
  }

  public clearComponents(components: DateComponents): DateCustom {
    this.components = emptyDateComponents;
    return this;
  }

  public setYear(
    year: Nullable<number | string>,
    { isDiff, isLoop }: SettingsShiftValueDateComponents = {},
  ): DateCustom {
    year = year ? Number(year) : null;
    const { year: prevValue } = this.components;
    this.components.year = DateCustomSetter.calcYear(DateComponentsActionType.Set, year, prevValue, isDiff, isLoop);
    return this.shiftDate(0, { isDiff, isLoop: false });
  }

  public setMonth(
    month: Nullable<number | string>,
    { isDiff, isLoop }: SettingsShiftValueDateComponents = {},
  ): DateCustom {
    month = month ? Number(month) : null;
    const { month: prevValue } = this.components;
    this.components.month = DateCustomSetter.calcMonth(DateComponentsActionType.Set, month, prevValue, isDiff, isLoop);
    return this.shiftDate(0, { isDiff, isLoop: false });
  }

  public setDate(
    date: Nullable<number | string>,
    { isDiff, isLoop }: SettingsShiftValueDateComponents = {},
  ): DateCustom {
    date = date ? Number(date) : null;
    const { year, month, date: prevValue } = this.components;
    this.components.date = DateCustomSetter.calcDate(
      DateComponentsActionType.Set,
      date,
      prevValue,
      year,
      month,
      isDiff,
      isLoop,
    );

    return this;
  }

  public shiftYear(step: number, { isDiff, isLoop }: SettingsShiftValueDateComponents = {}): DateCustom {
    const { year } = this.components;
    this.components.year = DateCustomSetter.calcYear(DateComponentsActionType.Shift, step, year, isDiff, isLoop);
    return this.shiftDate(0, { isDiff, isLoop: false });
  }

  public shiftMonth(step: number, { isDiff, isLoop }: SettingsShiftValueDateComponents = {}): DateCustom {
    const { month } = this.components;
    this.components.month = DateCustomSetter.calcMonth(DateComponentsActionType.Shift, step, month, isDiff, isLoop);
    return this.shiftDate(0, { isDiff, isLoop: false });
  }

  public shiftDate(step: number, { isDiff, isLoop }: SettingsShiftValueDateComponents = {}): DateCustom {
    const { year, month, date } = this.components;
    this.components.date = DateCustomSetter.calcDate(
      DateComponentsActionType.Shift,
      step,
      date,
      year,
      month,
      isDiff,
      isLoop,
    );
    return this;
  }

  public checkInRange(start: DateCustom, end: DateCustom, isStrict: boolean = false): boolean {
    const stampSelf = this.getNumber();
    const stampStart = start.getNumber();
    const stampEnd = end.getNumber();
    if (isStrict) {
      return stampSelf > stampStart && stampSelf < stampEnd;
    }
    return stampSelf >= stampStart && stampSelf <= stampEnd;
  }

  public getNumber(): number {
    return DateCustomTransformer.dateToNumber(this);
  }

  public inputNumber = (event: React.KeyboardEvent<HTMLElement>, type: DateComponentsType | null) => {
    if (type !== null) {
      this.setByComponentType(type, `${this.components.month}${event.key}`);
    }
  };

  private setByComponentType(type: DateComponentsType, value: Nullable<number | string>): DateCustom {
    value = value ? Number(value) : null;
    if (type === DateComponentsType.Year) {
      this.setYear(`${this.components.year}${value}`);
    } else if (type === DateComponentsType.Month) {
      this.setMonth(`${this.components.month}${value}`);
    } else if (type === DateComponentsType.Date) {
      this.setDate(`${this.components.date}${value}`);
    }
    return this;
  }
}
