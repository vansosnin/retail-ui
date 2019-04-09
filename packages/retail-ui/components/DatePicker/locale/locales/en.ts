import { dateCustomLocale } from '../../../../lib/date/constants';
import { LangCodes } from '../../../LocaleProvider';
import { DatePickerLocale } from '../types';

const componentsLocales: DatePickerLocale = {
  today: 'Today',
  ...dateCustomLocale[LangCodes.en_EN],
};

export default componentsLocales;
