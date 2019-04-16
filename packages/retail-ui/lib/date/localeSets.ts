import { LangCodes } from '../../components/LocaleProvider';
import { DateCustomFirstDayWeek, DateCustomOrder, DateCustomSeparator } from './types';

const DateCustomSet_DMY_Dot_Monday = {
  order: DateCustomOrder.DMY,
  separator: DateCustomSeparator.Dot,
  firstDayWeek: DateCustomFirstDayWeek.Monday,
};
const DateCustomSet_MDY_Slash_Sunday = {
  order: DateCustomOrder.MDY,
  separator: DateCustomSeparator.Slash,
  firstDayWeek: DateCustomFirstDayWeek.Sunday,
};
export const dateCustomLocale: {
  [key in LangCodes]: { order: DateCustomOrder; separator: DateCustomSeparator; firstDayWeek: DateCustomFirstDayWeek }
} = {
  [LangCodes.ru_RU]: DateCustomSet_DMY_Dot_Monday,
  [LangCodes.en_EN]: DateCustomSet_MDY_Slash_Sunday,
};
