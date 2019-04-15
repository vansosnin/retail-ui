
export enum DateCustomOrder {
  DMY = 'DMY',
  YMD = 'YMD',
  MDY = 'MDY',
}

export enum DateCustomSeparator {
  Slash = '/',
  Dot = '.',
  Dash = '-',
  Space = ' ',
}

export enum DateCustomComponentType {
  Date = 0,
  Month = 1,
  Year = 2,
  All = 3,
  Separator = 4,
}

export type DateCustomComponent = number | null;
export type DateCustomComponentRaw = number | string | null;

export interface DateCustomFragment {
  type: DateCustomComponentType;
  value: DateCustomComponentRaw | DateCustomSeparator;
  length: number;
  valueWithPad?: string;
  isValid?: boolean;
}

export interface DateCustomComponents {
  year: DateCustomComponent;
  month: DateCustomComponent;
  date: DateCustomComponent;
}

export interface DateCustomComponentsRaw {
  year: DateCustomComponentRaw;
  month: DateCustomComponentRaw;
  date: DateCustomComponentRaw;
}

export interface DateCustomComponentsNumber {
  year: number;
  month: number;
  date: number;
}

export interface DateCustomToFragmentsSettings {
  order?: DateCustomOrder;
  separator?: DateCustomSeparator;
  withSeparator?: boolean;
  withPad?: boolean;
  pad?: string;
}

export interface DateCustomChangeValueDateComponentSettings {
  isLoop?: boolean;
  isRange?: boolean;
}

export enum DateCustomValidateCheck {
  NotNull,
  Number,
  Limits,
  Native,
  Range,
}

export enum DateCustomFirstDayWeek {
  Monday = 0,
  Sunday = 1,
  Saturday = 2,
}
