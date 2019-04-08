import * as React from 'react';

import styles from './DateInput.less';
import { maskChar } from './DateInputHelpers/maskChar';

interface MaskedValueProps {
  value: number | string | null;
  length: number;
}

export const MaskedValue = ({ value, length }: MaskedValueProps) => {
  if (value === null || value === '') {
    return <Mask length={length} />;
  }
  const left = value.toString();
  const right = <Mask length={Math.max(length - left.length, 0)} />;
  return (
    <span>
      {left}
      {right}
    </span>
  );
};

const Mask = ({ length }: { length: number }) =>
  length ? <span className={styles.mask}>{maskChar.repeat(length)}</span> : <span />;
