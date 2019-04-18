import {
  DateCustomDayWeek,
  DateCustomFirstDayWeek,
  DateCustomOrder,
  DateCustomSeparator
} from '../../../lib/date/types';

export interface DatePickerLocale extends DatePickerLocaleSet {
  today: string;
}

export interface DatePickerLocaleSet {
  order: DateCustomOrder;
  separator: DateCustomSeparator;
  firstDayWeek: DateCustomFirstDayWeek;
  notWorkingDays: DateCustomDayWeek[];
}
