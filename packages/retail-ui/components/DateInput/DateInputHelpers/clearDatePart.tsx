import { DateComponentType } from '../../../lib/date/types';
import { Shape } from '../../../typings/utility-types';
import { DateInputState } from '../DateInput';

export const clearDatePart = (state: DateInputState): Shape<DateInputState> => {
  switch (state.selectedDateComponent) {
    case DateComponentType.Date:
      return {
        date: null,
        editingCharIndex: 0,
      } as Shape<DateInputState>;
    case DateComponentType.Month:
      return {
        month: null,
        editingCharIndex: 0,

        // Handling multiple Backspace presses
        selectedDateComponent: state.month ? DateComponentType.Month : DateComponentType.Date,
      } as Shape<DateInputState>;
    case DateComponentType.Year:
      return {
        year: null,
        editingCharIndex: 0,

        // Handling multiple Backspace presses
        selectedDateComponent: state.year ? DateComponentType.Year : DateComponentType.Month,
      } as Shape<DateInputState>;
    case DateComponentType.All:
    default:
      return {
        date: null,
        month: null,
        year: null,
        editingCharIndex: 0,

        selectedDateComponent: DateComponentType.Date,
      } as Shape<DateInputState>;
  }
};
