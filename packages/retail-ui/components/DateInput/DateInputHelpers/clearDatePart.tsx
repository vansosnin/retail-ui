import { DateComponentsType } from '../../../lib/date/types';
import { Shape } from '../../../typings/utility-types';
import { DateInputState } from '../DateInput';

export const clearDatePart = (state: DateInputState): Shape<DateInputState> => {
  switch (state.selectedDateComponent) {
    case DateComponentsType.Date:
      return {
        date: null,
        editingCharIndex: 0,
      } as Shape<DateInputState>;
    case DateComponentsType.Month:
      return {
        month: null,
        editingCharIndex: 0,

        // Handling multiple Backspace presses
        selectedDateComponent: state.month ? DateComponentsType.Month : DateComponentsType.Date,
      } as Shape<DateInputState>;
    case DateComponentsType.Year:
      return {
        year: null,
        editingCharIndex: 0,

        // Handling multiple Backspace presses
        selectedDateComponent: state.year ? DateComponentsType.Year : DateComponentsType.Month,
      } as Shape<DateInputState>;
    case DateComponentsType.All:
    default:
      return {
        date: null,
        month: null,
        year: null,
        editingCharIndex: 0,

        selectedDateComponent: DateComponentsType.Date,
      } as Shape<DateInputState>;
  }
};
