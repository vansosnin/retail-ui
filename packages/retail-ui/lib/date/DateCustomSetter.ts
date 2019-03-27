import { Nullable } from '../../typings/utility-types';
import { MAX_DATE, MAX_MONTH, MAX_YEAR, MIN_DATE, MIN_MONTH, MIN_YEAR } from './constants';
import { DateComponentsActionType, DateComponentsType } from './types';

export default class DateCustomSetter {
  public static leapYear = (year: number): boolean => (year % 4 === 0 && year % 100 !== 0) || year % 400 === 0;

  public static getMaxDaysInMonth(month: number, yearForFebruary?: number): number {
    if (month === 2) {
      return yearForFebruary && DateCustomSetter.leapYear(yearForFebruary) ? 29 : 28;
    }
    if (month <= 7) {
      return month % 2 === 0 ? 30 : 31;
    }
    return month % 2 === 0 ? 31 : 30;
  }

  public static calcYear(
    actionType: DateComponentsActionType,
    value: Nullable<number>,
    prevValue: Nullable<number>,
    isDiff?: boolean,
    isLoop?: boolean,
  ): Nullable<number> {
    return DateCustomSetter.getNewValueDateComponent(
      DateComponentsType.Date,
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
    actionType: DateComponentsActionType,
    value: Nullable<number>,
    prevValue: Nullable<number>,
    isDiff?: boolean,
    isLoop?: boolean,
  ): Nullable<number> {
    return DateCustomSetter.getNewValueDateComponent(
      DateComponentsType.Date,
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
    actionType: DateComponentsActionType,
    value: Nullable<number>,
    prevValue: Nullable<number>,
    year: Nullable<number>,
    month: Nullable<number>,
    isDiff?: boolean,
    isLoop?: boolean,
  ): Nullable<number> {
    const maxDate = year && month ? DateCustomSetter.getMaxDaysInMonth(month, year) : MAX_DATE;
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
    actionType: DateComponentsActionType,
    value: Nullable<number>,
    prevValue: Nullable<number>,
    min: number,
    max: number,
    isDiff?: boolean,
    isLoop?: boolean,
  ): Nullable<number> {
    if (typeof value !== 'number') {
      return null;
    }
    switch (actionType) {
      case DateComponentsActionType.Set:
        return DateCustomSetter.calcNewValueDateComponent(value, min, max, false, false);

      case DateComponentsActionType.Shift:
        if (!prevValue) {
          return prevValue;
        }
        return DateCustomSetter.calcNewValueDateComponent(prevValue + value, min, max, isDiff, isLoop);
    }
  }

  public static calcNewValueDateComponent = (
    value: number,
    min: number,
    max: number,
    isDiff: boolean = false,
    isLoop: boolean = true,
  ): Nullable<number> => {
    if (!isLoop) {
      return value < min ? min : value > max ? max : value;
    }
    const diff = !isDiff ? 0 : (value < min ? min - value : value - max) - 1;
    return value < min ? max - diff : value > max ? min + diff : value;
  };
}
