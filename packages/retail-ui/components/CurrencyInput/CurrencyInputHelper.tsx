import { Selection } from './SelectionHelper';
import CurrencyHelper from './CurrencyHelper';
import CursorHelper from './CursorHelper';
import { Nullable } from '../../typings/utility-types';

export default class CurrencyInputHelper {
  public static moveCursor(value: string, selection: Selection, step: number): number {
    return selection.start === selection.end
      ? CursorHelper.calculatePosition(CurrencyHelper.getInfo(value).cursorMap, selection.start, step)
      : step < 0
        ? selection.start
        : selection.end;
  }

  public static extendSelection(value: string, selection: Selection, step: number) {
    const info = CurrencyHelper.getInfo(value);
    return CursorHelper.extendSelection(info.cursorMap, selection, step);
  }

  public static normalizeSelection(value: string, selection: Selection): Selection {
    const info = CurrencyHelper.getInfo(value);
    return CursorHelper.normalizeSelection(info.cursorMap, selection);
  }

  public static safeInsert(
    value: string,
    start: number,
    end: number,
    input: string,
    fractionDigits: Nullable<number>,
    unsigned: Nullable<boolean>,
    integerPartLength: Nullable<number>,
  ) {
    const extracted = CurrencyInputHelper.getMaximumValidSubstring(
      value,
      start,
      end,
      input || '',
      fractionDigits,
      unsigned,
    );
    if (extracted != null) {
      const insert = CurrencyInputHelper.insert(value, start, end, extracted);
      if (!CurrencyInputHelper.isAllowedLengthIntegerPart(CurrencyHelper.parse(insert.value), integerPartLength)) {
        return null;
      }
      return insert;
    }
    return null;
  }

  public static getMaximumValidSubstring(
    value: string,
    start: number,
    end: number,
    input: string,
    fractionDigits: Nullable<number>,
    unsigned: Nullable<boolean>,
  ) {
    const extracted = CurrencyHelper.extractValid(input, fractionDigits, unsigned);

    if (input && !extracted) {
      return null;
    }

    const prefix = value.substring(0, start);
    const suffix = value.substring(end);

    for (let i = extracted.length; i >= 0; --i) {
      const result = extracted.substr(0, i);
      const combined = prefix + result + suffix;
      if (CurrencyHelper.isValidString(combined, fractionDigits, unsigned)) {
        return result;
      }
    }
    return null;
  }

  public static insert(value: string, start: number, end: number, input: string) {
    const prefix = value.substring(0, start);
    const suffix = value.substring(end);

    const info = CurrencyHelper.getInfo(value);
    const raw = CursorHelper.toRawPosition(info.cursorMap, start);
    const info2 = CurrencyHelper.getInfo(prefix + input + suffix);
    const formattedPosition = CursorHelper.toFormattedPosition(info2.cursorMap, raw + input.length);

    return { value: info2.formatted, position: formattedPosition };
  }

  public static isAllowedLengthIntegerPart(value: Nullable<number>, maxLength: Nullable<number>): boolean {
    if (typeof value !== 'number' || typeof maxLength !== 'number') {
      return true;
    }
    const integerPart = Math.floor(Math.abs(value));
    if (integerPart === 0 && maxLength === 0) {
      return true;
    }
    return integerPart.toString().length <= maxLength;
  }
}
