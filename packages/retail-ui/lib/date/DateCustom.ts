import { defaultDateComponentsOrder, defaultDateComponentsSeparator, emptyDateComponents } from './constants';
import DateCustomGetter from './DateCustomGetter';
import DateCustomSetter from './DateCustomSetter';
import DateCustomTransformer from './DateCustomTransformer';
import DateCustomValidator from './DateCustomValidator';
import {
  ChangeValueDateComponentSettings,
  DateComponent,
  DateComponents,
  DateComponentsOrder,
  DateComponentsSeparator,
  DateComponentsType,
  DateComponentWrite,
  DateComponentActionType,
  DateCustomFragment,
  DateToFragmentsSettings,
} from './types';

export class DateCustom {
  private order: DateComponentsOrder;
  private separator: DateComponentsSeparator;
  private components: DateComponents = { ...emptyDateComponents };

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

  public getRangeStart(): DateCustom | null {
    return this.start;
  }

  public getRangeEnd(): DateCustom | null {
    return this.end;
  }

  public setOrder(order: DateComponentsOrder): DateCustom {
    this.order = order;
    return this;
  }

  public setSeparator(separator: DateComponentsSeparator): DateCustom {
    this.separator = separator;
    return this;
  }

  public setComponents(components: DateComponents | null): DateCustom {
    this.components = components || {...emptyDateComponents};
    return this;
  }

  public setYear(year: DateComponentWrite, { isLoop }: ChangeValueDateComponentSettings = {}): DateCustom {
    year = year ? Number(year) : null;
    if (year === this.components.year) {
      return this;
    }
    this.components.year = DateCustomGetter.calcYear(this, DateComponentActionType.Set, year, { isLoop });
    return this;
  }

  public setMonth(month: DateComponentWrite, { isLoop }: ChangeValueDateComponentSettings = {}): DateCustom {
    month = month ? Number(month) : null;
    if (month === this.components.month) {
      return this;
    }
    this.components.month = DateCustomGetter.calcMonth(this, DateComponentActionType.Set, month, { isLoop });
    return this;
  }

  public setDate(date: DateComponentWrite, { isLoop }: ChangeValueDateComponentSettings = {}): DateCustom {
    date = date ? Number(date) : null;
    if (date === this.components.date) {
      return this;
    }
    this.components.date = DateCustomGetter.calcDate(this, DateComponentActionType.Set, date, { isLoop });
    return this;
  }

  public shiftYear(step: number, { isLoop }: ChangeValueDateComponentSettings = {}): DateCustom {
    this.components.year = DateCustomGetter.calcYear(this, DateComponentActionType.Shift, step, { isLoop });
    return this;
  }

  public shiftMonth(step: number, { isLoop }: ChangeValueDateComponentSettings = {}): DateCustom {
    this.components.month = DateCustomGetter.calcMonth(this, DateComponentActionType.Shift, step, { isLoop });

    return this;
  }

  public shiftDate(step: number, { isLoop }: ChangeValueDateComponentSettings = {}): DateCustom {
    this.components.date = DateCustomGetter.calcDate(this, DateComponentActionType.Shift, step, { isLoop });
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

  public get(type: DateComponentsType | null): DateComponent | DateComponents {
    return (type !== null && DateCustomGetter.getValueDateComponent(this, type)) || null;
  }

  public set(
    type: DateComponentsType | null,
    value: DateComponent,
    settingsChange: ChangeValueDateComponentSettings = {},
  ): DateCustom {
    return (type !== null && DateCustomSetter.setValueDateComponent(this, type, value, settingsChange)) || this;
  }

  public shift(type: DateComponentsType | null, step: number): DateCustom {
    return (type !== null && DateCustomSetter.shiftValueDateComponent(this, type, step)) || this;
  }

  public parseValue(value: string | null = ''): DateCustom {
    this.setComponents(DateCustomTransformer.parseValueToDate(value, this.order));
    return this;
  }

  public validate(type?: DateComponentsType, nextValue?: DateComponent): boolean {
    let self: DateCustom = this;
    if (type !== undefined && nextValue !== undefined) {
      const clone = this.clone();
      clone.set(type, nextValue);
      self = clone;
    }
    const checkRange =
      type !== undefined
        ? DateCustomValidator.checkRangePiecemeal(type, self)
        : DateCustomValidator.checkRangeFully(self);
    return DateCustomValidator.compareWithNativeDate(this) && checkRange;
  }

  public toNumber(): number {
    return DateCustomTransformer.dateToNumber(this);
  }

  public toFragments(settings?: DateToFragmentsSettings): DateCustomFragment[] {
    return DateCustomTransformer.dateToFragments(this, settings);
  }

  public toString(): string {
    return DateCustomTransformer.dateToValue(this);
  }

  public clone(): DateCustom {
    return new DateCustom(this.order, this.separator)
      .setComponents({ ...this.components })
      .setRangeStart(this.start && this.start.clone())
      .setRangeEnd(this.end && this.end.clone());
  }
}
