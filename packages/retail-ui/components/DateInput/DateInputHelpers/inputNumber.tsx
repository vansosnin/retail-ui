import { DateCustom } from '../../../lib/date/DateCustom';
import { DateComponentType } from '../../../lib/date/types';
import { Shape } from '../../../typings/utility-types';
import { DateInputState } from '../DateInput';
import { clearDatePart } from './clearDatePart';

export const inputNumber = (key: string, dateCustom: DateCustom, updateDateComponents: () => void) => {
  return (state: DateInputState): Shape<DateInputState> => {
    switch (state.selectedDateComponent) {
      case DateComponentType.Date:
        return updateDate(key, state, dateCustom, updateDateComponents);
      case DateComponentType.Month:
        return updateMonth(key, state, dateCustom, updateDateComponents);
      case DateComponentType.Year:
        return updateYear(key, state, dateCustom, updateDateComponents);
      case DateComponentType.All:
      default:
        const tempState = { ...state, ...clearDatePart(state) };
        return { ...tempState, ...inputNumber(key, dateCustom, updateDateComponents)(tempState) };
    }
  };
};

const updateDate = (key: string, state: DateInputState, dateCustom: DateCustom, updateDateComponents: () => void): Shape<DateInputState> => {
  const { date, editingCharIndex } = state;
  dateCustom.setDate(key);
  updateDateComponents();
  return null;
  if (editingCharIndex === 0) {
    if (key > '3') {
      return {
        date: '0' + key,
        editingCharIndex: 0,

        selectedDateComponent: DateComponentType.Month,
      } as Shape<DateInputState>;
    }
    return {
      date: key,
      editingCharIndex: 1,
    } as Shape<DateInputState>;
  }

  const d = Number(date) * 10 + Number(key);
  if (d < 1 || d > 31) {
    return { notify: true } as Shape<DateInputState>;
  }
  return {
    date: d.toString().padStart(2, '0'),
    editingCharIndex: 0,

    selectedDateComponent: DateComponentType.Month,
  } as Shape<DateInputState>;
};

const updateMonth = (key: string, state: DateInputState, dateCustom: DateCustom, updateDateComponents: () => void) => {
  const { month, editingCharIndex } = state;
  dateCustom.setMonth(key);
  updateDateComponents();
  return null;
  if (editingCharIndex === 0) {
    if (key > '1') {
      return {
        month: '0' + key,
        editingCharIndex: 0,

        selectedDateComponent: DateComponentType.Year,
      } as Shape<DateInputState>;
    }
    return {
      month: key,
      editingCharIndex: 1,
    } as Shape<DateInputState>;
  }
  const m = Number(month) * 10 + Number(key);
  if (m < 1 || m > 12) {
    return { notify: true } as Shape<DateInputState>;
  }
  return {
    month: m.toString().padStart(2, '0'),
    editingCharIndex: 0,

    selectedDateComponent: DateComponentType.Year,
  } as Shape<DateInputState>;
};

const updateYear = (key: string, state: DateInputState, dateCustom: DateCustom, updateDateComponents: () => void) => {
  const { year, editingCharIndex } = state;
  dateCustom.setYear(key);
  updateDateComponents();
  return null;
  if (editingCharIndex === 0) {
    return {
      year: key,
      editingCharIndex: 1,
    } as Shape<DateInputState>;
  }
  return {
    year: ((year || '') + key).slice(-4),
  } as Shape<DateInputState>;
};
