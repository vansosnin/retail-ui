
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
  value: DateComponentWrite;
  length: number;
  isValid?: boolean;
}

export interface DateComponents {
  date: DateComponent;
  month: DateComponent;
  year: DateComponent;
}

export interface DateComponentsWrite {
  date: DateComponentWrite;
  month: DateComponentWrite;
  year: DateComponentWrite;
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

export enum DateComponentActionType {
  Set,
  Shift,
  Clear,
}

export type DateComponent = number | null;
export type DateComponentWrite = number | string | null;

export interface DateToFragmentsSettings {
  order?: DateComponentsOrder;
  components?: DateComponentsWrite;
  separator?: DateComponentsSeparator;
  withSeparator?: boolean;
  withPad?: boolean;
  withValidation?: boolean;
}

export interface ChangeValueDateComponentSettings {
  isLoop?: boolean;
  isRange?: boolean;
}
