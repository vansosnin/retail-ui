import { LENGTH_DATE, LENGTH_MONTH, LENGTH_YEAR } from '../../../lib/date/constants';
import { DateCustomComponentType, DateCustomComponent, DateCustomComponentRaw } from '../../../lib/date/types';

export const inputNumber = (
  type: DateCustomComponentType | null,
  prev: DateCustomComponentRaw,
  key: string,
  inputMode: boolean,
  cb: (next: DateCustomComponent, inputMode: boolean) => void,
) => {
  let nextInputMode = false;
  let next: any;
  let first: number = 10;
  let length: number = LENGTH_YEAR;
  if (type === DateCustomComponentType.Month) {
    first = 1;
    length = LENGTH_MONTH;
  }
  if (type === DateCustomComponentType.Date) {
    first = 3;
    length = LENGTH_DATE;
  }
  if (!inputMode) {
    next = key;
    nextInputMode = Number(key) <= first;
  } else {
    next = `${prev === null ? '' : prev}${key}`.slice(-length);
    nextInputMode = next.length < length;
  }
  cb(next, nextInputMode);
};
