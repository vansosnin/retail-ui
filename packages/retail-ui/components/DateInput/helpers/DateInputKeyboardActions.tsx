// @ts-ignore noUnusedVar
import * as React from 'react';
import { DateCustomSeparator } from '../../../lib/date/types';
import { KeyboardActionExctracterBuilder, isModified } from '../../internal/extractKeyboardAction';

export const Actions = {
  Unknown: 0,
  Ignore: 1,
  MoveSelectionLeft: 11,
  MoveSelectionRight: 12,
  Decrement: 13,
  Increment: 14,
  FullSelection: 23,
  ClearSelection: 31,
  Digit: 101,
  Separator: 103,
  WrongInput: 201,
};

const extractAction = new KeyboardActionExctracterBuilder()
  .add(Actions.FullSelection, e => (e.ctrlKey || e.metaKey) && e.key === 'a')
  .add(Actions.Ignore, e => isModified(e) || e.key === 'Tab')
  .add(Actions.MoveSelectionLeft, e => e.key === 'ArrowLeft')
  .add(Actions.MoveSelectionRight, e => e.key === 'ArrowRight')
  .add(Actions.Separator, e => Object.values(DateCustomSeparator).includes(e.key))
  .add(Actions.Increment, e => e.key === 'ArrowUp')
  .add(Actions.Decrement, e => e.key === 'ArrowDown')
  .add(Actions.ClearSelection, e => e.key === 'Backspace' || e.key === 'Delete')
  .add(Actions.Digit, e => /^\d$/.test(e.key))
  .add(Actions.WrongInput, e => e.key === ' ' || /^[A-Za-zА-Яа-я]$/.test(e.key))
  .build(Actions.Unknown);

export { extractAction };
