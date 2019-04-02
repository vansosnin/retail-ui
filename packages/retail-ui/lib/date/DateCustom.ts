import { defaultDateComponentsOrder, defaultDateComponentsSeparator, emptyDateComponents } from './constants';
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

  public getComponents(): DateCustomComponents<number> {
    return DateCustomTransformer.dateComponentsStringToNumber(this.getComponentsRaw());
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
    this.components.month =
      month !== null && month > DateCustomGetter.getDefaultMax(DateComponentType.Month)
        ? DateCustomCalculator.restoreMonth(this, month)
        : month;
    return this;
  }

  public setDate(date: DateCustomComponentRaw): DateCustom {
    if (date === this.components.date) {
      return this;
    }
    this.components.date =
      date !== null && date > DateCustomGetter.getDefaultMax(DateComponentType.Date)
        ? DateCustomCalculator.restoreDate(this, date)
        : date;
    return this;
  }

  public shiftYear(step: number, { isLoop, isRange = true }: DateCustomChangeValueDateComponentSettings = {}): DateCustom {
    const min = this.getMinValue(DateComponentType.Year, isRange);
    const max = this.getMaxValue(DateComponentType.Year, isRange);
    const { year } = this.getComponents();
    this.components.year = DateCustomCalculator.calcShiftValueDateComponent(step, year, min, max, isLoop);
    return this;
  }

  public shiftMonth(step: number, { isLoop, isRange }: DateCustomChangeValueDateComponentSettings = {}): DateCustom {
    const min = this.getMinValue(DateComponentType.Month, isRange);
    const max = this.getMaxValue(DateComponentType.Month, isRange);
    const { month } = this.getComponents();
    this.components.month = DateCustomCalculator.calcShiftValueDateComponent(step, month, min, max, isLoop);
    return this;
  }

  public shiftDate(step: number, { isLoop, isRange }: DateCustomChangeValueDateComponentSettings = {}): DateCustom {
    const min = this.getMinValue(DateComponentType.Date, isRange);
    const max = this.getMaxValue(DateComponentType.Date, isRange);
    const { date } = this.getComponents();
    this.components.date = DateCustomCalculator.calcShiftValueDateComponent(step, date, min, max, isLoop);
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
    if (!DateCustomValidator.checkForNull(self.getComponentsRaw(), type)) {
      return false;
    }
    if (!DateCustomValidator.checkLimits(self.getComponents(), type)) {
      return false;
    }
    if (type !== undefined && !DateCustomValidator.compareWithNativeDate(self.getComponents())) {
      return false;
    }
    return type !== undefined
      ? DateCustomValidator.checkRangePiecemeal(
          type,
          self.getComponents(),
          self.start && self.start.getComponents(),
          self.end && self.end.getComponents(),
        )
      : DateCustomValidator.checkRangeFully(
          self.toNumber(),
          self.start && self.start.toNumber(),
          self.end && self.end.toNumber(),
        );
  }

  public toFragments(settings?: DateCustomToFragmentsSettings): DateCustomFragment[] {
    return DateCustomTransformer.dateToFragments(this.getComponents(), {
      order: this.getOrder(),
      separator: this.getSeparator(),
      ...settings,
    });
  }

  /**
   * Перевод даты в числовое представление (**НЕ** аналог `timestamp`)
   * Предназначено для быстрого сравнивания дат `<=>`
   */
  public toNumber(): number {
    return Number(
      this.toFragments({ order: DateCustomOrder.YMD, withPad: true })
        .map(({ valueWithPad }) => valueWithPad)
        .join(''),
    );
  }

  public toString(): string {
    return this.toFragments({ withSeparator: true })
      .map(({ value }) => value)
      .join('');
  }

  public clone(): DateCustom {
    return new DateCustom(this.order, this.separator)
      .setComponents({ ...this.components })
      .setRangeStart(this.start && this.start.clone())
      .setRangeEnd(this.end && this.end.clone());
  }

  // TODO вместо этого нужен метод для "обрезания" значений по диапазону
  public restore(): DateCustom {
    const { year, month, date } = this.components;
    this.setComponents({
      year: DateCustomCalculator.restoreYear(this, year),
      month: DateCustomCalculator.restoreMonth(this, month),
      date: DateCustomCalculator.restoreDate(this, date),
    });
    return this;
  }

  private getMinValue(type: DateComponentType, isRange?: boolean): number {
    if (isRange === true && this.start !== null) {
      return Number(
        DateCustomCalculator.calcRangeStartDateComponent(type, this.getComponents(), this.start.getComponents()),
      );
    }
    return DateCustomGetter.getDefaultMin(type);
  }

  private getMaxValue(type: DateComponentType, isRange?: boolean): number {
    if (isRange === true && this.end !== null) {
      return Number(
        DateCustomCalculator.calcRangeEndDateComponent(type, this.getComponents(), this.end.getComponents()),
      );
    }
    return DateCustomGetter.getDefaultMax(type);
  }
}
