import { defaultDateComponentsOrder, defaultDateComponentsSeparator, emptyDateComponents } from './constants';
import DateCustomCalculator from './DateCustomCalculator';
import DateCustomGetter from './DateCustomGetter';
import DateCustomSetter from './DateCustomSetter';
import DateCustomTransformer from './DateCustomTransformer';
import DateCustomValidator from './DateCustomValidator';
import {
  DateCustomChangeValueDateComponentSettings,
  DateCustomComponentRaw,
  DateCustomComponentsNumber,
  DateCustomComponentsRaw,
  DateCustomComponentType,
  DateCustomFragment,
  DateCustomOrder,
  DateCustomSeparator,
  DateCustomToFragmentsSettings,
  DateCustomValidateCheck,
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
    return { ...this.components };
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
    return this.components.year;
  }

  public getMonth(): DateCustomComponentRaw {
    return this.components.month;
  }

  public getDate(): DateCustomComponentRaw {
    return this.components.date;
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

  public setComponents(components: DateCustomComponentsRaw | null, isNativeMonth: boolean = false): DateCustom {
    if (components && isNativeMonth) {
      const clone = this.clone()
        .setComponents(components)
        .shiftMonth(1);
      if (clone.validate({ levels: [DateCustomValidateCheck.Native] })) {
        this.components = { ...clone.getComponentsLikeNumber() };
      }
      return this;
    }
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
    const min = this.getMinValue(DateCustomComponentType.Year, isRange);
    const max = this.getMaxValue(DateCustomComponentType.Year, isRange);
    const { year } = this.getComponentsLikeNumber();
    this.components.year = DateCustomCalculator.calcShiftValueDateComponent(step, year, min, max, isLoop);
    return this;
  }

  public shiftMonth(step: number, { isLoop, isRange }: DateCustomChangeValueDateComponentSettings = {}): DateCustom {
    const min = this.getMinValue(DateCustomComponentType.Month, isRange);
    const max = this.getMaxValue(DateCustomComponentType.Month, isRange);
    const { month } = this.getComponentsLikeNumber();
    this.components.month = DateCustomCalculator.calcShiftValueDateComponent(step, month, min, max, isLoop);
    return this;
  }

  public shiftDate(step: number, { isLoop, isRange }: DateCustomChangeValueDateComponentSettings = {}): DateCustom {
    const min = this.getMinValue(DateCustomComponentType.Date, isRange);
    const max = this.getMaxValue(DateCustomComponentType.Date, isRange);
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

  public get(type: DateCustomComponentType | null): DateCustomComponentRaw {
    return type !== null ? DateCustomGetter.getValueDateComponent(type, this.getComponentsRaw()) : null;
  }

  public set(type: DateCustomComponentType | null, value: DateCustomComponentRaw): DateCustom {
    return type !== null ? DateCustomSetter.setValueDateComponent(this, type, value) : this;
  }

  public shift(
    type: DateCustomComponentType | null,
    step: number,
    settings?: DateCustomChangeValueDateComponentSettings,
  ): DateCustom {
    return type !== null ? DateCustomSetter.shiftValueDateComponent(this, type, step, settings) : this;
  }

  public parseValue(value: string | null = ''): DateCustom {
    const components = DateCustomTransformer.parseValueToDate(value, this.order) || { ...emptyDateComponents };
    this.setComponents(components);
    return this;
  }

  public validate({
    type,
    nextValue,
    levels = Object.values(DateCustomValidateCheck),
  }: {
    type?: DateCustomComponentType;
    nextValue?: DateCustomComponentRaw;
    levels?: DateCustomValidateCheck[];
  } = {}): boolean {
    let self: DateCustom = this;
    if (type !== undefined) {
      const clone = this.clone();
      if (nextValue !== undefined) {
        clone.set(type, nextValue);
      }
      self = clone;
    }
    if (
      levels.includes(DateCustomValidateCheck.NotNull) &&
      !DateCustomValidator.checkForNull(self.getComponentsRaw(), type)
    ) {
      return false;
    }
    if (
      levels.includes(DateCustomValidateCheck.Number) &&
      !Object.values(self.getComponentsRaw()).every(DateCustomValidator.testParseToNumber)
    ) {
      return false;
    }
    if (
      levels.includes(DateCustomValidateCheck.Limits) &&
      !DateCustomValidator.checkLimits(self.getComponentsLikeNumber(), type)
    ) {
      return false;
    }
    if (
      levels.includes(DateCustomValidateCheck.Native) &&
      !DateCustomValidator.compareWithNativeDate(self.getComponentsLikeNumber())
    ) {
      return false;
    }
    if (levels.includes(DateCustomValidateCheck.Range)) {
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
    return true;
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

  public toString(settings: DateCustomToFragmentsSettings = {}): string {
    return this.toFragments({ withPad: true, withSeparator: true, ...settings })
      .filter(({ value }) => value !== null)
      .map(
        ({ type, valueWithPad, value }) =>
          settings.withPad && type !== DateCustomComponentType.Separator ? valueWithPad : value,
      )
      .join('');
  }

  public toNativeFormat(): DateCustomComponentsNumber | null {
    const components = this.getComponentsLikeNumber();
    if (DateCustomValidator.compareWithNativeDate(components)) {
      return { ...components, month: components.month - 1 };
    }
    return null;
  }

  public clone(): DateCustom {
    return new DateCustom(this.order, this.separator)
      .setComponents({ ...this.components })
      .setRangeStart(this.start && this.start.clone())
      .setRangeEnd(this.end && this.end.clone());
  }

  public restore(type: DateCustomComponentType | null = null): DateCustom {
    const prev = this.getComponentsRaw();
    const today = DateCustomGetter.getTodayComponents();

    if (prev.year === null && prev.month === null && prev.date === null) {
      return this;
    }

    const restoreYear =
      prev.year !== null && DateCustomValidator.testParseToNumber(prev.year)
        ? prev.year > 50 && prev.year < 100
          ? Number(prev.year) + 1900
          : prev.year > 0 && prev.year < 51
            ? Number(prev.year) + 2000
            : prev.year
        : today.year;
    if (type === null && restoreYear !== prev.year || type === DateCustomComponentType.Year) {
      this.setYear(restoreYear);
    }
    if (type === null && prev.month === null || type === DateCustomComponentType.Month) {
      this.setMonth(today.month);
    }
    if (type === null && prev.date === null || type === DateCustomComponentType.Date) {
      this.setDate(today.date);
    }
    return this;
  }

  public cutOffExcess(isRange: boolean = false): DateCustom {
    const { year, month, date } = this.components;
    if (DateCustomValidator.testParseToNumber(year)) {
      this.shiftYear(0, { isLoop: false, isRange });
    }
    if (DateCustomValidator.testParseToNumber(month)) {
      this.shiftMonth(0, { isLoop: false, isRange });
    }
    if (DateCustomValidator.testParseToNumber(date)) {
      this.shiftDate(0, { isLoop: false, isRange });
    }
    return this;
  }

  private getMinValue(type: DateCustomComponentType, isRange?: boolean): number {
    if (isRange === true && this.start !== null) {
      return Number(
        DateCustomCalculator.calcRangeStartDateComponent(
          type,
          this.getComponentsLikeNumber(),
          this.start.getComponentsLikeNumber(),
        ),
      );
    }
    return DateCustomGetter.getDefaultMin(type);
  }

  private getMaxValue(type: DateCustomComponentType, isRange?: boolean): number {
    if (isRange === true && this.end !== null) {
      return Number(
        DateCustomCalculator.calcRangeEndDateComponent(
          type,
          this.getComponentsLikeNumber(),
          this.end.getComponentsLikeNumber(),
        ),
      );
    }
    return DateCustomGetter.getDefaultMax(type, this.getComponentsLikeNumber());
  }
}
