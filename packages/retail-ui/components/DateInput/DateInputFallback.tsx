import * as React from 'react';
import { DateCustomComponentType } from '../../lib/date/types';
import { DateInputProps, DateInputState } from './DateInput';
import { removeAllSelections } from './helpers/SelectionHelpers';
import debounce from 'lodash.debounce';

export const DateInputFallback = <T extends { new (...args: any[]): any }>(constructor: T) => {
  return class DateInput extends constructor {
    // Костыль для возможности выделить компоненты даты
    // В IE и Edge, при вызове range.selectNodeContents(node)
    // снимается фокус у текущего элемента, т.е. вызывается handleBlur
    // в handleBlur вызывается window.getSelection().removeAllRanges() и выделение пропадает.
    // Этот флаг "замораживаниет" колбэки onBlur и onFocus, для возможности вернуть выделение сегмента.
    public isFrozen: boolean = false;

    public selection = debounce(() => {
      const node = this.inputLikeText && this.inputLikeText.getNode();
      if (this.inputLikeText && node && node.contains(document.activeElement)) {
        this.isFrozen = true;
        this.changeSelectedDateComponent(this.state.selected);
        if (this.inputLikeText) {
          this.inputLikeText.focus();
        }
      }
    }, 10);

    public componentDidUpdate(prevProps: DateInputProps, prevState: DateInputState) {
      if (
        prevProps.value !== this.props.value ||
        prevProps.minDate !== this.props.minDate ||
        prevProps.maxDate !== this.props.maxDate
      ) {
        this.updateDateCustom(this.props.dateCustom, {}, this.updateDateCustomFromProps);
      }

      if (prevState.dateCustom !== this.state.dateCustom) {
        this.emitChange();
      }

      if (this.state.isInFocused && prevState.selected !== this.state.selected) {
        this.selection();
      }

      if (this.state.notify && !prevState.notify) {
        this.notify();
      }
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
        event.preventDefault();
        return;
      }
      this.setState((prevState: DateInputState) => {
        return {
          isInFocused: true,
          selected: prevState.selected === null ? this.getFirstDateComponentType() : prevState.selected,
        };
      });

      if (this.props.onFocus) {
        this.props.onFocus(event);
      }
    };

    public handleBlur = (event: React.FocusEvent<HTMLElement>): void => {
      if (this.isFrozen) {
        event.preventDefault();
        return;
      }

      event.persist();

      this.setState({ isInFocused: false, selected: null, isOnInputMode: false }, () => {
        removeAllSelections();
        if (this.state.dateCustom !== null) {
          this.updateDateCustom(this.state.dateCustom.restore());
        }
        if (this.props.onBlur) {
          this.props.onBlur(event);
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
