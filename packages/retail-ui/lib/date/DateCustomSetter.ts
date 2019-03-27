import { MAX_DATE, MAX_MONTH, MAX_YEAR, MIN_DATE, MIN_MONTH, MIN_YEAR } from './constants';
import DateCustomValidator from './DateCustomValidator';
import { DateComponent, DateCustomActionType, DateComponentsType } from './types';

export default class DateCustomSetter {
  public static calcYear(
    actionType: DateCustomActionType,
    value: number | null,
    prevValue: number | null,
    isDiff?: boolean,
    isLoop?: boolean,
  ): DateComponent {
    return DateCustomSetter.getNewValueDateComponent(
      DateComponentsType.Year,
      actionType,
      value,
      prevValue,
      MIN_YEAR,
      MAX_YEAR,
      isDiff,
      isLoop,
    );
  }

  public static calcMonth(
    actionType: DateCustomActionType,
    value: number | null,
    prevValue: number | null,
    isDiff?: boolean,
    isLoop?: boolean,
  ): DateComponent {
    return DateCustomSetter.getNewValueDateComponent(
      DateComponentsType.Month,
      actionType,
      value,
      prevValue,
      MIN_MONTH,
      MAX_MONTH,
      isDiff,
      isLoop,
    );
  }

  public static calcDate(
    actionType: DateCustomActionType,
    value: number | null,
    prevValue: number | null,
    year: number | null,
    month: number | null,
    isDiff?: boolean,
    isLoop?: boolean,
  ): DateComponent {
    const maxDate = year && month ? DateCustomValidator.getMaxDaysInMonth(month, year) : MAX_DATE;
    return DateCustomSetter.getNewValueDateComponent(
      DateComponentsType.Date,
      actionType,
      value,
      prevValue,
      MIN_DATE,
      maxDate,
      isDiff,
      isLoop,
    );
  }

  public static getNewValueDateComponent(
    componentsType: DateComponentsType,
    actionType: DateCustomActionType,
    value: number | null,
    prevValue: number | null,
    min: number,
    max: number,
    isDiff?: boolean,
    isLoop?: boolean,
  ): DateComponent {
    if (value === null) {
      return null;
    }
    if (actionType === DateCustomActionType.Shift) {
      value = prevValue === null ? value : prevValue + value;
      return DateCustomSetter.calcNewValueDateComponent(value, min, max, isDiff, isLoop);
    }
    return DateCustomSetter.calcNewValueDateComponent(value, min, max, false, false);
  }

  public static calcNewValueDateComponent = (
    value: number,
    min: number,
    max: number,
    isDiff: boolean = false,
    isLoop: boolean = true,
  ): DateComponent => {
    if (!isLoop) {
      return value < min ? min : value > max ? max : value;
    }
    const diff = !isDiff ? 0 : (value < min ? min - value : value - max) - 1;
    return value < min ? max - diff : value > max ? min + diff : value;
  };
}
