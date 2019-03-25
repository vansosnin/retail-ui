import { LocaleHelper } from '../../LocaleProvider/LocaleHelper';
import en_EN from './locales/en';
import ru_RU from './locales/ru';
import { DateSelectLocale } from './types';

export * from './types';

export const DateSelectLocaleHelper = new LocaleHelper<DateSelectLocale>({
  ru_RU,
  en_EN,
});
