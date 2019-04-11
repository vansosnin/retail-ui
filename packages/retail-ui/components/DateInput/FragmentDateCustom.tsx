import classNames from 'classnames';
import * as React from 'react';
import { CHAR_MASK } from '../../lib/date/constants';
import DateCustomValidator from '../../lib/date/DateCustomValidator';
import { DateCustomComponentType, DateCustomFragment } from '../../lib/date/types';
import styles from './DateInput.less';
import { removeAllSelections } from './helpers/SelectionHelpers';

interface FragmentDateCustomProps extends DateCustomFragment {
  isValidFully: boolean;
  selected: DateCustomComponentType | null;
  inputMode: boolean;
  onMouseUp: (type: DateCustomComponentType) => (event: React.MouseEvent<HTMLElement>) => void;
}

export const FragmentDateCustom: React.SFC<FragmentDateCustomProps> = ({
  type,
  value,
  length,
  valueWithPad,
  isValidFully,
  inputMode,
  selected,
  onMouseUp,
}) => {
  if (type === DateCustomComponentType.Separator) {
    return <span className={styles.delimiter}>{value}</span>;
  } else {
    value = value === null || (selected === type && inputMode) ? value : valueWithPad || value;
    const classComponent = classNames(styles.component, {
      [styles.invalid]: !isValidFully,
    });
    if (DateCustomValidator.testParseToNumber(value)) {
      length = Math.max(length - value!.toString().length, 0);
    }
    return (
      <span className={classComponent} onMouseUp={onMouseUp(type)} onMouseDown={removeAllSelections}>
        <span>
          {value}
          <span className={styles.mask}>{CHAR_MASK.repeat(length)}</span>
        </span>
      </span>
    );
  }
};
