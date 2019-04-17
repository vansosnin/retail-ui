import * as React from 'react';
import { CHAR_MASK } from '../../lib/date/constants';
import DateCustomValidator from '../../lib/date/DateCustomValidator';
import { DateCustomComponentType, DateCustomFragment } from '../../lib/date/types';
import styles from './DateInput.less';
import { removeAllSelections } from './helpers/SelectionHelpers';

interface FragmentDateCustomProps extends DateCustomFragment {
  selected: DateCustomComponentType | null;
  inputMode: boolean;
  onMouseUp: (type: DateCustomComponentType) => (event: React.MouseEvent<HTMLElement>) => void;
}

export const FragmentDateCustom: React.SFC<FragmentDateCustomProps> = ({
  type,
  value,
  length,
  valueWithPad,
  inputMode,
  selected,
  onMouseUp,
}) => {
  if (type === DateCustomComponentType.Separator) {
    return <span className={styles.delimiter}>{value}</span>;
  } else {
    value = value === null || (selected === type && inputMode) ? value : valueWithPad || value;
    if (DateCustomValidator.testParseToNumber(value)) {
      length = Math.max(length - value!.toString().length, 0);
    }
    return (
      <span onMouseUp={onMouseUp(type)} onMouseDown={removeAllSelections}>
          {value}
        <span className={styles.mask}>{CHAR_MASK.repeat(length)}</span>
      </span>
    );
  }
};
