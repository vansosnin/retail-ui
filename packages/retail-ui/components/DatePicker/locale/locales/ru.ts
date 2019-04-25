import { internalDateLocale } from '../../../../lib/date/localeSets';
import { LangCodes } from '../../../LocaleProvider';
import { DatePickerLocale } from '../types';

const componentsLocales: DatePickerLocale = {
  today: 'Сегодня',
  ...internalDateLocale[LangCodes.ru_RU],
};

export default componentsLocales;
