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
  DateCustomComponentsNumber,
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

  public getComponentsLikeNumber(): DateCustomComponentsNumber {
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
    this.components.year = year;
    return this;
  }

  public setMonth(month: DateCustomComponentRaw): DateCustom {
    this.components.month = month;
    return this;
  }

  public setDate(date: DateCustomComponentRaw): DateCustom {
    this.components.date = date;
    return this;
  }

  public shiftYear(step: number, { isLoop, isRange }: DateCustomChangeValueDateComponentSettings = {}): DateCustom {
    const min = this.getMinValue(DateComponentType.Year, isRange);
    const max = this.getMaxValue(DateComponentType.Year, isRange);
    const { year } = this.getComponentsLikeNumber();
    this.components.year = DateCustomCalculator.calcShiftValueDateComponent(step, year, min, max, isLoop);
    return this;
  }

  public shiftMonth(step: number, { isLoop, isRange }: DateCustomChangeValueDateComponentSettings = {}): DateCustom {
    const min = this.getMinValue(DateComponentType.Month, isRange);
    const max = this.getMaxValue(DateComponentType.Month, isRange);
    const { month } = this.getComponentsLikeNumber();
    this.components.month = DateCustomCalculator.calcShiftValueDateComponent(step, month, min, max, isLoop);
    return this;
  }

  public shiftDate(step: number, { isLoop, isRange }: DateCustomChangeValueDateComponentSettings = {}): DateCustom {
    const min = this.getMinValue(DateComponentType.Date, isRange);
    const max = this.getMaxValue(DateComponentType.Date, isRange);
    const { date } = this.getComponentsLikeNumber();
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

  public get(type: DateComponentType | null): DateCustomComponentRaw {
    return (type !== null && DateCustomGetter.getValueDateComponent(type, this.getComponentsRaw())) || null;
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
    if (type !== undefined) {
      const clone = this.clone();
      if (nextValue !== undefined) {
        clone.set(type, nextValue);
      }
      self = clone;
    }
    if (!DateCustomValidator.checkForNull(self.getComponentsRaw(), type)) {
      return false;
    }
    if (!DateCustomValidator.checkLimits(self.getComponentsLikeNumber(), type)) {
      return false;
    }
    if (type !== undefined && !DateCustomValidator.compareWithNativeDate(self.getComponentsLikeNumber())) {
      return false;
    }
    return type !== undefined
      ? DateCustomValidator.checkRangePiecemeal(
          type,
          self.getComponentsLikeNumber(),
          self.start && self.start.getComponentsLikeNumber(),
          self.end && self.end.getComponentsLikeNumber(),
        )
      : DateCustomValidator.checkRangeFully(
          self.toNumber(),
          self.start && self.start.toNumber(),
          self.end && self.end.toNumber(),
        );
  }

  public toFragments(
    settings: DateCustomToFragmentsSettings = {},
    components: DateCustomComponentsRaw = this.getComponentsRaw(),
  ): DateCustomFragment[] {
    return DateCustomTransformer.dateToFragments(components, {
      order: this.order,
      separator: this.separator,
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

  public toString(withPad: boolean = false): string {
    return this.toFragments({ withSeparator: true, withPad })
      .map(({ valueWithPad, value }) => valueWithPad || value)
      .join('');
  }

  public clone(): DateCustom {
    return new DateCustom(this.order, this.separator)
      .setComponents({ ...this.components })
      .setRangeStart(this.start && this.start.clone())
      .setRangeEnd(this.end && this.end.clone());
  }

  public restore(isSoft: boolean = true): DateCustom {
    const { year, month, date } = this.getComponentsRaw();
    if (!isSoft || DateCustomValidator.testParseToNumber(year)) {
      this.shiftYear(0, { isLoop: false, isRange: true });
    }
    if (!isSoft || DateCustomValidator.testParseToNumber(month)) {
      this.shiftMonth(0, { isLoop: false, isRange: false });
    }
    if (!isSoft || DateCustomValidator.testParseToNumber(date)) {
      this.shiftDate(0, { isLoop: false, isRange: false });
    }
    return this;
  }

  private getMinValue(type: DateComponentType, isRange?: boolean): number {
    if (isRange === true && this.start !== null) {
      return Number(
        DateCustomCalculator.calcRangeStartDateComponent(type, this.getComponentsLikeNumber(), this.start.getComponentsLikeNumber()),
      );
    }
    return DateCustomGetter.getDefaultMin(type);
  }

  private getMaxValue(type: DateComponentType, isRange?: boolean): number {
    if (isRange === true && this.end !== null) {
      return Number(
        DateCustomCalculator.calcRangeEndDateComponent(type, this.getComponentsLikeNumber(), this.end.getComponentsLikeNumber()),
      );
    }
    return DateCustomGetter.getDefaultMax(type, this.getComponentsLikeNumber());
  }
}
