import { DatePickerLocaleSet } from '../../components/DatePicker/locale';
import { LangCodes } from '../../components/LocaleProvider';
import { DateCustomDayWeek, DateCustomFirstDayWeek, DateCustomOrder, DateCustomSeparator } from './types';

const DateCustomSet_DMY_Dot_Monday_6_7: DatePickerLocaleSet = {
  order: DateCustomOrder.DMY,
  separator: DateCustomSeparator.Dot,
  firstDayWeek: DateCustomFirstDayWeek.Monday,
  notWorkingDays: [DateCustomDayWeek.Saturday, DateCustomDayWeek.Sunday],
};

const DateCustomSet_MDY_Slash_Sunday_6_7: DatePickerLocaleSet = {
  order: DateCustomOrder.MDY,
  separator: DateCustomSeparator.Slash,
  firstDayWeek: DateCustomFirstDayWeek.Sunday,
  notWorkingDays: [DateCustomDayWeek.Saturday, DateCustomDayWeek.Sunday],
};

export const dateCustomLocale: {
  [key in LangCodes]: DatePickerLocaleSet
} = {
  [LangCodes.ru_RU]: DateCustomSet_DMY_Dot_Monday_6_7,
  [LangCodes.en_EN]: DateCustomSet_MDY_Slash_Sunday_6_7,
};
