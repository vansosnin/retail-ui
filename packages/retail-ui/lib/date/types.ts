import { DateShape } from '../../components/DatePicker/DateShape';
import { Nullable } from '../../typings/utility-types';

export enum DateComponentsOrder {
  DMY = 'DMY',
  YMD = 'YMD',
  MDY = 'MDY',
}

export enum DateComponentsSeparator {
  Slash = '/',
  Dot = '.',
  Dash = '-',
  Space = ' ',
}

export enum DateComponentsType {
  Date = 0,
  Month = 1,
  Year = 2,
  All = 3,
  Separator = 4,
}

export interface DateCustomFragment {
  type: DateComponentsType;
  value: Nullable<number | string>;
  length: number;
}

export type DateComponents = DateShape;

export interface DateComponentsWithPad {
  date: string;
  month: string;
  year: string;
}

export enum DateComponentsActionType {
  Set,
  Shift,
  Clear,
}
