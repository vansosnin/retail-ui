import { DateComponentsOrder, DateComponentsSeparator } from './types';

export const defaultDateComponentsOrder = DateComponentsOrder.DMY;
export const defaultDateComponentsSeparator = DateComponentsSeparator.Dot;
export const MIN_YEAR = 1;
export const MAX_YEAR = 9999;
export const MIN_MONTH = 1;
export const MAX_MONTH = 12;
export const MIN_DATE = 1;
export const MAX_DATE = 31;
export const LENGTH_YEAR = 4;
export const LENGTH_MONTH = 2;
export const LENGTH_DATE = 2;
export const CHAR_PAD = '0';
export const emptyDateComponents = {
  year: null,
  month: null,
  date: null,
};
export const emptyDateComponentsNumber = {
  year: 0,
  month: 0,
  date: 0,
};
