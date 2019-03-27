import { DateComponentsOrder, DateComponentsSeparator } from './types';

export const defaultDateComponentsOrder = DateComponentsOrder.DMY;
export const defaultDateComponentsSeparator = DateComponentsSeparator.Dot;
export const MIN_YEAR = 1;
export const MAX_YEAR = 2100;
export const MIN_MONTH = 1;
export const MAX_MONTH = 12;
export const MIN_DATE = 1;
export const MAX_DATE = 31;
export const LENGTH_YEAR = 4;
export const LENGTH_MONTH = 2;
export const LENGTH_DATE = 2;
export const CHAR_PAD = '0';
export const CHAR_MASK = '_';
export const emptyDateComponents = {
  year: null,
  month: null,
  date: null,
};
