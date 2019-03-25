import { DateShape } from '../../components/DatePicker/DateShape';

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

export interface DateFragment {
  type: DateComponentsType;
  value: string;
}

export type DateComponents = DateShape;

export interface DateComponentsWithPad {
  date: string;
  month: string;
  year: string;
}
