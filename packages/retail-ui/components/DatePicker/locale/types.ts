import {
  InternalDateDayWeek,
  InternalDateFirstDayWeek,
  InternalDateOrder,
  InternalDateSeparator
} from '../../../lib/date/types';

export interface DatePickerLocale extends DatePickerLocaleSet {
  today: string;
}

export interface DatePickerLocaleSet {
  order: InternalDateOrder;
  separator: InternalDateSeparator;
  firstDayWeek: InternalDateFirstDayWeek;
  notWorkingDays: InternalDateDayWeek[];
}
