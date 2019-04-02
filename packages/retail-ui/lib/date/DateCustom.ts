import {
  defaultDateComponentsOrder,
  defaultDateComponentsSeparator,
  emptyDateComponents,
  LENGTH_DATE,
} from './constants';
import DateCustomCalculator from './DateCustomCalculator';
import DateCustomGetter from './DateCustomGetter';
import DateCustomSetter from './DateCustomSetter';
import DateCustomTransformer from './DateCustomTransformer';
import DateCustomValidator from './DateCustomValidator';
import {
  DateComponentType,
  DateCustomChangeValueDateComponentSettings,
  DateCustomComponent,
  DateCustomComponentRaw,
  DateCustomComponents,
  DateCustomComponentsRaw,
  DateCustomFragment,
  DateCustomOrder,
  DateCustomSeparator,
  DateCustomToFragmentsSettings,
} from './types';

export class DateCustom {
  private order: DateCustomOrder;
  private separator: DateCustomSeparator;
  private components: DateCustomComponentsRaw = { ...emptyDateComponents };

  private start: DateCustom | null = null;
  private end: DateCustom | null = null;

  public constructor(
    order: DateCustomOrder = defaultDateComponentsOrder,
    separator: DateCustomSeparator = defaultDateComponentsSeparator,
  ) {
    this.order = order;
    this.separator = separator;
  }

  public getComponentsRaw(): DateCustomComponentsRaw {
    return this.components;
  }

  public getComponents(): DateCustomComponents {
    return DateCustomTransformer.dateComponentsToNumber(this);
  }

  public getSeparator(): DateCustomSeparator {
    return this.separator;
  }

  public getOrder(): DateCustomOrder {
    return this.order;
  }

  public getYear(): DateCustomComponentRaw {
    return this.components.year /* === null ? null : DateCustomCalculator.restoreYear(this, this.components.year)*/;
  }

  public getMonth(): DateCustomComponentRaw {
    return this.components.month /* === null ? null : DateCustomCalculator.restoreMonth(this, this.components.month)*/;
  }

  public getDate(): DateCustomComponentRaw {
    return this.components.date /* === null ? null : DateCustomCalculator.restoreDate(this, this.components.date)*/;
  }

  public getRangeStart(): DateCustom | null {
    return this.start;
  }

  public getRangeEnd(): DateCustom | null {
    return this.end;
  }

  public setOrder(order: DateCustomOrder = defaultDateComponentsOrder): DateCustom {
    this.order = order;
    return this;
  }

  public setSeparator(separator: DateCustomSeparator = defaultDateComponentsSeparator): DateCustom {
    this.separator = separator;
    return this;
  }

  public setComponents(components: DateCustomComponentsRaw | null): DateCustom {
    this.components = components || { ...emptyDateComponents };
    return this;
  }

  public setYear(year: DateCustomComponentRaw): DateCustom {
    if (year === this.components.year) {
      return this;
    }
    // if ((year !== null && String(year).length === LENGTH_YEAR)/* || (String(year).length === 1 && Number(year) > 3)*/) {
    //   year = DateCustomCalculator.restoreYear(this, year);
    // }
    this.components.year = year;
    return this;
  }

  public setMonth(month: DateCustomComponentRaw): DateCustom {
    if (month === this.components.month) {
      return this;
    }
    // if ((month !== null && String(month).length === LENGTH_MONTH)/* || (String(month).length === 1 && Number(month) > 3)*/) {
    //   month = DateCustomCalculator.restoreYear(this, month);
    // }
    this.components.month = month;
    return this;
  }

  public setDate(date: DateCustomComponentRaw): DateCustom {
    if (date === this.components.date) {
      return this;
    }
    this.components.date =
      date !== null && String(date).length === LENGTH_DATE ? DateCustomCalculator.restoreDate(this, date) : date;
    return this;
  }

  public shiftYear(step: number, { isLoop }: DateCustomChangeValueDateComponentSettings = {}): DateCustom {
    this.components.year = DateCustomCalculator.calcShiftYear(this, step, this.components.year, { isLoop });
    return this;
  }

  public shiftMonth(step: number, { isLoop }: DateCustomChangeValueDateComponentSettings = {}): DateCustom {
    this.components.month = DateCustomCalculator.calcShiftMonth(this, step, this.components.month, { isLoop });
    return this;
  }

  public shiftDate(step: number, { isLoop }: DateCustomChangeValueDateComponentSettings = {}): DateCustom {
    this.components.date = DateCustomCalculator.calcShiftDate(this, step, this.components.date, { isLoop });
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

  public get(type: DateComponentType | null): DateCustomComponentRaw | DateCustomComponentsRaw {
    return (type !== null && DateCustomGetter.getValueDateComponent(this, type)) || null;
  }

  public set(type: DateComponentType | null, value: DateCustomComponentRaw): DateCustom {
    return (type !== null && DateCustomSetter.setValueDateComponent(this, type, value)) || this;
  }

  public shift(type: DateComponentType | null, step: number): DateCustom {
    return (type !== null && DateCustomSetter.shiftValueDateComponent(this, type, step)) || this;
  }

  public parseValue(value: string | null = ''): DateCustom {
    this.setComponents(DateCustomTransformer.parseValueToDate(value, this.order));
    return this;
  }

  public validate(type?: DateComponentType, nextValue?: DateCustomComponent): boolean {
    let self: DateCustom = this;
    if (type !== undefined && nextValue !== undefined) {
      const clone = this.clone();
      clone.set(type, nextValue);
      self = clone;
    }
    if (!DateCustomValidator.checkForNull(self)) {
      return false;
    }
    if (!DateCustomValidator.checkLimits(self)) {
      return false;
    }
    if (!DateCustomValidator.compareWithNativeDate(self)) {
      return false;
    }
    return type !== undefined
      ? DateCustomValidator.checkRangePiecemeal(type, self)
      : DateCustomValidator.checkRangeFully(self);
  }

  public toNumber(): number {
    return DateCustomTransformer.dateToNumber(this);
  }

  public toFragments(settings?: DateCustomToFragmentsSettings): DateCustomFragment[] {
    return DateCustomTransformer.dateToFragments(this, settings);
  }

  public toString(): string {
    return DateCustomTransformer.dateToString(this);
  }

  public clone(): DateCustom {
    return new DateCustom(this.order, this.separator)
      .setComponents({ ...this.components })
      .setRangeStart(this.start && this.start.clone())
      .setRangeEnd(this.end && this.end.clone());
  }

  public restore(): DateCustom {
    const { year, month, date } = this.components;
    this.setComponents({
      year: DateCustomCalculator.restoreYear(this, year),
      month: DateCustomCalculator.restoreMonth(this, month),
      date: DateCustomCalculator.restoreDate(this, date),
    });
    return this;
  }
}
