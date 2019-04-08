
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

export enum DateComponentType {
  Date = 0,
  Month = 1,
  Year = 2,
  All = 3,
  Separator = 4,
}

export type DateCustomComponent = number | null;
export type DateCustomComponentRaw = number | string | null;

export interface DateCustomFragment {
  type: DateComponentType;
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
}

export interface DateCustomChangeValueDateComponentSettings {
  isLoop?: boolean;
  isRange?: boolean;
}
