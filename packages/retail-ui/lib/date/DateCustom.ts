import { defaultDateComponentsOrder, defaultDateComponentsSeparator, emptyDateComponents } from './constants';
import DateCustomSetter from './DateCustomSetter';
import DateCustomTransformer from './DateCustomTransformer';
import DateCustomValidator from './DateCustomValidator';
import {
  DateComponent,
  DateComponents,
  DateCustomActionType,
  DateComponentsOrder,
  DateComponentsSeparator,
  DateComponentsType,
  DateCustomFragment,
  DateToFragmentsSettings,
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

  private start: DateCustom | null = null;
  private end: DateCustom | null = null;

  public constructor(
    order: DateComponentsOrder = defaultDateComponentsOrder,
    separator: DateComponentsSeparator = defaultDateComponentsSeparator,
  ) {
    this.order = order;
    this.separator = separator;
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

  public getYear(): DateComponent {
    return this.components.year;
  }

  public getMonth(): DateComponent {
    return this.components.month;
  }

  public getDate(): DateComponent {
    return this.components.date;
  }

  public toString(): string {
    return DateCustomTransformer.dateToValue(this);
  }

  public parseValue(value: string | null = ''): DateCustom {
    this.setComponents(DateCustomTransformer.parseValueToDate(value, this.order));
    return this;
  }

  public setOrder(order: DateComponentsOrder | null): DateCustom {
    if (order) {
      this.order = order;
    }
    return this;
  }

  public setSeparator(separator: DateComponentsSeparator | null): DateCustom {
    if (separator) {
      this.separator = separator;
    }
    return this;
  }

  public setComponents(components: DateComponents): DateCustom {
    this.components = components;
    return this;
  }

  public setYear(year: number | string | null, { isDiff, isLoop }: SettingsShiftValueDateComponents = {}): DateCustom {
    year = year ? Number(year) : null;
    const { year: prevValue } = this.components;
    const nextYear = DateCustomSetter.calcYear(DateCustomActionType.Set, year, prevValue, isDiff, isLoop);
    if (this.validate(DateComponentsType.Date, nextYear)) {
      this.components.year = nextYear;
    }
    return this.shiftDate(0, { isDiff, isLoop: false });
  }

  public setMonth(
    month: number | string | null,
    { isDiff, isLoop }: SettingsShiftValueDateComponents = {},
  ): DateCustom {
    month = month ? Number(month) : null;
    const { month: prevValue } = this.components;
    const nextMonth = DateCustomSetter.calcMonth(DateCustomActionType.Set, month, prevValue, isDiff, isLoop);
    if (this.validate(DateComponentsType.Date, nextMonth)) {
      this.components.month = nextMonth;
    }
    return this.shiftDate(0, { isDiff, isLoop: false });
  }

  public setDate(date: number | string | null, { isDiff, isLoop }: SettingsShiftValueDateComponents = {}): DateCustom {
    date = date ? Number(date) : null;
    if (date === this.components.date) {
      return this;
    }
    const { year, month, date: prevValue } = this.components;
    const nextDate = DateCustomSetter.calcDate(DateCustomActionType.Set, date, prevValue, year, month, isDiff, isLoop);
    if (this.validate(DateComponentsType.Date, nextDate)) {
      this.components.year = nextDate;
    }
    return this;
  }

  public shiftYear(step: number, { isDiff, isLoop }: SettingsShiftValueDateComponents = {}): DateCustom {
    const { year } = this.components;
    const textYear = DateCustomSetter.calcYear(DateCustomActionType.Shift, step, year, isDiff, isLoop);
    if (this.validate(DateComponentsType.Year, textYear)) {
      this.components.year = textYear;
    }

    return this.shiftDate(0, { isDiff, isLoop: false });
  }

  public shiftMonth(step: number, { isDiff, isLoop }: SettingsShiftValueDateComponents = {}): DateCustom {
    const { month } = this.components;
    const nextMonth = DateCustomSetter.calcMonth(DateCustomActionType.Shift, step, month, isDiff, isLoop);
    if (this.validate(DateComponentsType.Month, nextMonth)) {
      this.components.month = nextMonth;
    }

    return this.shiftDate(0, { isDiff, isLoop: false });
  }

  public shiftDate(step: number, { isDiff, isLoop }: SettingsShiftValueDateComponents = {}): DateCustom {
    const { year, month, date } = this.components;
    const nextDate = DateCustomSetter.calcDate(DateCustomActionType.Shift, step, date, year, month, isDiff, isLoop);
    if (this.validate(DateComponentsType.Date, nextDate)) {
      this.components.date = nextDate;
    }

    return this;
  }

  public setRangeStart(dateCustom: DateCustom | null): DateCustom {
    this.start = dateCustom;
    return this;
  }

  public setRangeEnd(dateCustom: DateCustom | null): DateCustom {
    this.end = dateCustom;
    return this;
  }

  public toNumber(): number {
    return DateCustomTransformer.dateToNumber(this);
  }

  public toFragments(settings?: DateToFragmentsSettings): DateCustomFragment[] {
    return DateCustomTransformer.dateToFragments(this, settings);
  }

  public get(type: DateComponentsType | null): DateComponent | DateComponents {
    if (type === DateComponentsType.Year) {
      return this.components.year;
    } else if (type === DateComponentsType.Month) {
      return this.components.month;
    } else if (type === DateComponentsType.Date) {
      return this.components.date;
    } else if (type === DateComponentsType.All) {
      return this.components;
    }
    return null;
  }

  public set(type: DateComponentsType | null, value: DateComponent, notTest: boolean = false): boolean {
    value = value ? Number(value) : null;
    const prevValue = this.toNumber();
    if (type === DateComponentsType.Year) {
      notTest ? (this.components.year = value) : this.setYear(value);
    } else if (type === DateComponentsType.Month) {
      notTest ? (this.components.month = value) : this.setMonth(value);
    } else if (type === DateComponentsType.Date) {
      notTest ? (this.components.date = value) : this.setDate(value);
    } else if (type === DateComponentsType.All) {
      notTest ? (this.components.date = value) : this.setComponents(emptyDateComponents);
    }
    return this.toNumber() === prevValue;
  }

  public shift(type: DateComponentsType | null, value: number): boolean {
    const prevValue = this.toNumber();
    if (type === DateComponentsType.Year) {
      this.shiftYear(value);
    } else if (type === DateComponentsType.Month) {
      this.shiftMonth(value);
    } else if (type === DateComponentsType.Date) {
      this.shiftDate(value);
    } else if (type === DateComponentsType.All) {
      this.shiftDate(value);
    }
    return this.toNumber() === prevValue;
  }

  public clone(): DateCustom {
    return new DateCustom(this.order, this.separator)
      .setComponents({ ...this.components })
      .setRangeStart(this.start && Object.assign(Object.create(this.start), this.start))
      .setRangeEnd(this.end && Object.assign(Object.create(this.end), this.end));
  }

  public validate(type?: DateComponentsType, nextValue?: DateComponent): boolean {
    let self: DateCustom = this;
    if (type !== undefined && nextValue !== undefined) {
      const clone = this.clone();
      clone.set(type, nextValue, true);
      self = clone;
    }
    const checkRange =
      type !== undefined
        ? DateCustomValidator.checkRangePiecemeal(type, self, this.start, this.end)
        : DateCustomValidator.checkRangeFully(self, this.start, this.end);
    console.log('checkRangePiecemeal', checkRange);
    return (
      DateCustomValidator.compareWithNativeDate(this) &&
      checkRange
    );
  }
}
