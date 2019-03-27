import { DateComponentsType } from '../../../lib/date/types';
import { Shape } from '../../../typings/utility-types';

import { DateInputState, DateParts } from '../DateInput';

export const setSelection = (index: number | null) => (state: Readonly<DateInputState>): Shape<DateInputState> => {
  const commonChanges = {
    editingCharIndex: 0,

    selectedDateComponent: index != null ? Math.max(DateParts.Date, Math.min(DateParts.All, index)) : null,
  };
  switch (state.selectedDateComponent || 0) {
    case DateComponentsType.Date:
      return {
        ...commonChanges,
        date: state.date ? state.date.padStart(2, '0') : null,
      } as Shape<DateInputState>;
    case DateComponentsType.Month:
      return {
        ...commonChanges,
        month: state.month ? state.month.padStart(2, '0') : null,
      } as Shape<DateInputState>;
    case DateComponentsType.Year:
      return {
        ...commonChanges,
        year: state.year ? restoreYear(state.year) : null,
      } as Shape<DateInputState>;
    case DateComponentsType.All:
    case null:
    default:
      return commonChanges as Shape<DateInputState>;
  }
};

const restoreYear = (year: string) => {
  let y = Number(year);
  if (y < 100) {
    if (y > 50) {
      y += 1900;
    } else {
      y += 2000;
    }
  }
  return y.toString(10).padStart(4, '0');
};

export const moveSelectionBy = (step: number) => (state: DateInputState): Shape<DateInputState> => {
  const selected = Math.max(DateParts.Date, Math.min(DateParts.Year, (state.selectedDateComponent || DateParts.Date) + step));
  return setSelection(selected)(state);
};
