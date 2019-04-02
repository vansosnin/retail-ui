
export interface DateCustomComponents {
  date: DateCustomComponent;
  month: DateCustomComponent;
  year: DateCustomComponent;
}

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

export interface DateCustomFragment {
  type: DateComponentType;
  value: DateCustomComponentRaw;
  length: number;
  valueWithPad?: string;
  isValid?: boolean;
}

export interface DateCustomComponentsRaw {
  date: DateCustomComponentRaw;
  month: DateCustomComponentRaw;
  year: DateCustomComponentRaw;
}

export interface DateComponentsNumber {
  date: number;
  month: number;
  year: number;
}

export type DateCustomComponent = number | null;
export type DateCustomComponentRaw = number | string | null;

export interface DateCustomToFragmentsSettings {
  order?: DateCustomOrder;
  separator?: DateCustomSeparator;
  withSeparator?: boolean;
  withPad?: boolean;
  withValidation?: boolean;
}

export interface DateCustomChangeValueDateComponentSettings {
  isLoop?: boolean;
  isRange?: boolean;
}
