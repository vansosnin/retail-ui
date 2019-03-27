
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
  value: DateComponent | string;
  length: number;
}

export interface DateComponents {
  date: DateComponent;
  month: DateComponent;
  year: DateComponent;
}

export interface DateComponentsWrite {
  date: DateComponent | string;
  month: DateComponent | string;
  year: DateComponent | string;
}

export interface DateComponentsNumber {
  date: number;
  month: number;
  year: number;
}

export interface DateComponentsWithPad {
  date: string;
  month: string;
  year: string;
}

export enum DateCustomActionType {
  Set,
  Shift,
  Clear,
}

export type DateComponent = number | null;

export interface DateToFragmentsSettings {
  order?: DateComponentsOrder;
  components?: DateComponentsWrite;
  separator?: DateComponentsSeparator;
  withSeparator?: boolean;
  isPad?: boolean;
}
