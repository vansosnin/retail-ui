import * as React from 'react';
import { DateCustomComponentType } from '../../lib/date/types';
import { DateInputProps, DateInputState } from './DateInput';
import { removeAllSelections } from './helpers/SelectionHelpers';
import debounce from 'lodash.debounce';

export const DateInputFallback = <T extends { new (...args: any[]): any }>(constructor: T) => {
  return class DateInput extends constructor {
    // Костыль для возможности выделить сегменты
    // В IE и Edge, при вызове range.selectNodeContents(node)
    // снимается фокус у текущего элемента, из-за чего вызывается handleBlur
    // в handleBlur вызывается window.getSelection().removeAllRanges() и выделение пропадает.
    // Этот флаг "замораживаниет" колбэки onBlur и onFocus, для возможности вернуть выделение сегмента.
    public isFrozen: boolean = false;

    public selection = debounce(() => {
      const node = this.inputLikeText && this.inputLikeText.getNode();
      if (this.inputLikeText && node && node.contains(document.activeElement)) {
        this.isFrozen = true;
        this.changeSelectedDateComponent(this!.state.selected);
        if (this.inputLikeText) {
          this.inputLikeText.focus();
        }
      }
    }, 0);

    public componentDidUpdate(prevProps: DateInputProps, prevState: DateInputState) {
      if (prevState.dateValue !== this!.state.dateValue) {
        this.emitChange();
      }

      if (this!.state.isInFocused !== this!.state.selected) {
        this.selection();
      }

      if (this!.state.notify && !prevState.notify) {
        this.notify();
      }
    }

    public componentDidMount(): void {
      this.updateDateCustom(this.props);
      // @ts-ignore
      this.dateComponentsTypesOrder = this!.dateCustom.toFragments().map(({ type }) => type);
      this!.updateDateComponents();
    }

    public handleMouseDown = (event: React.MouseEvent<HTMLElement>) => {
      if (this.state.isInFocused && !this.isFrozen) {
        event.preventDefault();
        event.stopPropagation();
      }
    };

    public handleFocus = (event: React.FocusEvent<HTMLElement>): void => {
      if (this.isFrozen) {
        this.isFrozen = false;
        return;
      }
      this.setState((prevState: DateInputState) => {
        return {
          isInFocused: true,
          selected: prevState.selected === null ? this.getFirstDateComponentType() : prevState.selected,
        };
      });

      if (this!.props.onFocus) {
        this!.props.onFocus(event);
      }
    };

    public handleBlur = (event: React.FocusEvent<HTMLElement>): void => {
      if (this.isFrozen) {
        return;
      }

      event.persist();

      this.setState({ isInFocused: false, selected: null, isOnInputMode: false }, () => {
        removeAllSelections();
        this.dateCustom.restore();
        this.updateDateComponents();
        if (this!.props.onBlur) {
          this!.props.onBlur(event);
        }
      });
    };

    public selectDateComponent = (selected: DateCustomComponentType | null): void => {
      if (this.isFrozen) {
        return;
      }
      this.setState({ selected });
    };
  };
};
