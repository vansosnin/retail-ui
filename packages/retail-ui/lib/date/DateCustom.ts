import { Nullable } from '../../typings/utility-types';
import {
  defaultDateComponentsOrder,
  defaultDateComponentsSeparator,
  MAX_DATE,
  MAX_MONTH,
  MAX_YEAR,
  MIN_DATE,
  MIN_MONTH,
  MIN_YEAR,
} from './constants';
import { DateHelper } from './DateHelper';
import {
  DateComponents,
  DateComponentsOrder,
  DateComponentsSeparator,
  DateComponentsType,
  DateComponentsWithPad,
} from './types';

export class DateCustom {
  private order: DateComponentsOrder;
  private separator: DateComponentsSeparator;
  private components: DateComponents = {
    year: null,
    month: null,
    date: null,
  };

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
    return DateHelper.dateToValue(this);
  }

  public getComponentsWithPad(): DateComponentsWithPad {
    return {
      year: this.padYear(),
      month: this.padMonth(),
      date: this.padDate(),
    };
  }

  public padYear = (): string => DateHelper.padYear(this.components.year);
  public padMonth = (): string => DateHelper.padMonth(this.components.month);
  public padDate = (): string => DateHelper.padDate(this.components.date);

  public parseValue(value: string = ''): DateCustom {
    this.setComponents(DateHelper.parseValueToDate(value));
    return this;
  }

  public setYear(year: Nullable<number | string>): DateCustom {
    this.components.year = year ? Number(year) : null;
    return this;
  }

  public setDate(date: Nullable<number | string>): DateCustom {
    this.components.date = date ? Number(date) : null;
    return this;
  }

  public setMonth(month: Nullable<number | string>): DateCustom {
    this.components.month = month ? Number(month) : null;
    return this;
  }

  public setOrder(order: DateComponentsOrder): DateCustom {
    this.order = order;
    return this;
  }

  public setSeparator(separator: DateComponentsSeparator): DateCustom {
    this.separator = separator;
    return this;
  }

  public setComponents(components: DateComponents): DateCustom {
    this.components = components;
    return this;
  }

  public shiftYear(step: number, isDiff?: boolean): DateCustom {
    this.setYear(this.shiftValueDateComponent(DateComponentsType.Year, step, MIN_YEAR, MAX_YEAR, isDiff));
    return this;
  }

  public shiftMonth(step: number, isDiff?: boolean): DateCustom {
    this.setMonth(this.shiftValueDateComponent(DateComponentsType.Month, step, MIN_MONTH, MAX_MONTH, isDiff));
    return this;
  }

  public shiftDate(step: number, isDiff?: boolean): DateCustom {
    this.setDate(this.shiftValueDateComponent(DateComponentsType.Date, step, MIN_DATE, MAX_DATE, isDiff));
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
    return DateHelper.dateToNumber(this);
  }

  private shiftValueDateComponent(
    type: DateComponentsType,
    step: number,
    min: number,
    max: number,
    isDiff: boolean = true,
  ): Nullable<number> {
    const value = this.getValueByDateComponentType(type);
    if (!value) {
      return value;
    }
    const date = value + step;
    const diff = isDiff ? (date < min ? min - date + 1 : date - max - 1) : 0;
    return date < min ? max - diff : date > max ? min + diff : date;
  }

  private getValueByDateComponentType(type: DateComponentsType): Nullable<number> {
    if (type === DateComponentsType.Year) {
      return this.components.year;
    } else if (type === DateComponentsType.Month) {
      return this.components.month;
    } else if (type === DateComponentsType.Date) {
      return this.components.date;
    }
  }

  private setByComponentType(type: DateComponentsType, value: Nullable<number>): DateCustom {
    if (type === DateComponentsType.Year) {
      this.components.year = value;
    } else if (type === DateComponentsType.Month) {
      this.components.month = value;
    } else if (type === DateComponentsType.Date) {
      this.components.date = value;
    }
    return this;
  }
}
