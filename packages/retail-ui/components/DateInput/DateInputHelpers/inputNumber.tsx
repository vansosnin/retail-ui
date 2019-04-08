import { DateComponentType, DateCustomComponent, DateCustomComponentRaw } from '../../../lib/date/types';

export const inputNumber = (
  type: DateComponentType | null,
  prev: DateCustomComponentRaw,
  key: string,
  inputMode: boolean,
  cb: (next: DateCustomComponent, inputMode: boolean) => void,
) => {
  const digit = Number(key);
  let nextInputMode = false;
  let next: any;
  let first: number = 10;
  let length: number = 4;
  if (type === DateComponentType.Month) {
    first = 1;
    length = 2;
  }
  if (type === DateComponentType.Date) {
    first = 3;
    length = 2;
  }
  if (!inputMode) {
    next = digit;
    nextInputMode = digit <= first;
  } else {
    next = String(`${prev === null ? '' : prev}${digit}`).slice(-length);
    nextInputMode = next.length < length;
  }
  cb(next, nextInputMode);
};
