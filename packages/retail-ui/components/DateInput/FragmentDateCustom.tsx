import classNames from 'classnames';
import * as React from 'react';
import { CHAR_MASK } from '../../lib/date/constants';
import DateCustomValidator from '../../lib/date/DateCustomValidator';
import { DateCustomComponentType, DateCustomFragment } from '../../lib/date/types';
import styles from './DateInput.less';

interface FragmentDateCustomProps extends DateCustomFragment {
  isValidFully: boolean;
  selected: DateCustomComponentType | null;
  inputMode: boolean;
  onMouseDown: (type: DateCustomComponentType) => () => void;
}

export const FragmentDateCustom: React.SFC<FragmentDateCustomProps> = ({
  type,
  value,
  length,
  valueWithPad,
  isValidFully,
  inputMode,
  selected,
  onMouseDown,
}) => {
  if (type === DateCustomComponentType.Separator) {
    return <span className={styles.delimiter}>{value}</span>;
  } else {
    value = value === null || (selected === type && inputMode) ? value : valueWithPad || value;
    const classComponent = classNames(styles.component, {
      [styles.selected]: selected === type,
      [styles.invalid]: !isValidFully,
    });
    if (DateCustomValidator.testParseToNumber(value)) {
      length = Math.max(length - value!.toString().length, 0);
    }
    return (
      <span className={classComponent} onMouseDown={onMouseDown(type)}>
        <span>
          {value}
          <span className={styles.mask}>{CHAR_MASK.repeat(length)}</span>
        </span>
      </span>
    );
  }
};
