import { dateCustomLocale } from '../../../../lib/date/localeSets';
import { LangCodes } from '../../../LocaleProvider';
import { DatePickerLocale } from '../types';

const componentsLocales: DatePickerLocale = {
  today: 'Сегодня',
  ...dateCustomLocale[LangCodes.ru_RU],
};

export default componentsLocales;
