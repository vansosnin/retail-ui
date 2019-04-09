import { DateCustomFirstDayWeek, DateCustomOrder, DateCustomSeparator } from '../../../lib/date/types';

export interface DatePickerLocale {
  today: string;
  order: DateCustomOrder;
  separator: DateCustomSeparator;
  firstDayWeek: DateCustomFirstDayWeek;
}
