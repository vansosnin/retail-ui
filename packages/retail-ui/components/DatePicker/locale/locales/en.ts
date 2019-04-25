import { internalDateLocale } from '../../../../lib/date/localeSets';
import { LangCodes } from '../../../LocaleProvider';
import { DatePickerLocale } from '../types';

const componentsLocales: DatePickerLocale = {
  today: 'Today',
  ...internalDateLocale[LangCodes.en_EN],
};

export default componentsLocales;
