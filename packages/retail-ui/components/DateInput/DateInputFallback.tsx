import * as React from 'react';
import { DateCustomComponentType } from '../../lib/date/types';
import { isEdge, isIE } from '../ensureOldIEClassName';
import { DateInputProps, DateInputState } from './DateInput';
import { removeAllSelections } from './helpers/SelectionHelpers';

export const DateInputFallback = (constructor: any) => {
  return class DateInput1 extends constructor {
    // Костыль для возможности выделить сегменты
    // В IE и Edge, при вызове range.selectNodeContents(node)
    // снимается фокус у текущего элемента, из-за чего вызывается handleBlur
    // в handleBlur вызывается window.getSelection().removeAllRanges() и выделение пропадает.
    // Этот флаг "замораживаниет" колбэки onBlur и onFocus, для возможности вернуть выделение сегмента.
    public isFrozen: boolean = false;
    constructor(){
      super();
    }
    public componentDidUpdate(prevProps: DateInputProps, prevState: DateInputState) {
      if (prevState.dateValue !== this.state.dateValue) {
        this.emitChange();
      }

      if (this.state.isInFocused !== this.state.selected) {
        // if (isEdge) {
        //   setTimeout(() => this.state.isInFocused && this.changeSelectedDateComponent(this.state.selected), 0);
        // } else {
        // }
        if (isIE || isEdge) {
          setTimeout(() => {
            console.log('componentDidUpdate 2', this.inputLikeText.getNode().contains(document.activeElement));
            const node = this.inputLikeText && this.inputLikeText.getNode();
            if (this.inputLikeText && node && node.contains(document.activeElement)) {
              this.isFrozen = true;
              this.changeSelectedDateComponent(this.state.selected);
              if (this.inputLikeText) {
                this.inputLikeText.focus();
              }
            }
          }, isIE ? 100 : 0);
        } else {
          this.changeSelectedDateComponent(this.state.selected);
        }
      }

      if (this.state.notify && !prevState.notify) {
        this.notify();
      }
    }

    // @ts-ignore
    private handleFocus = (event: React.FocusEvent<HTMLElement>): void => {
      console.log('handleFocus this.isFrozen =', this.isFrozen);
      if (this.isFrozen) {
        // event.preventDefault();
        // event.nativeEvent.stopImmediatePropagation();
        // this.autoFocusDebounce.cancel();
        // this.isFrozen = false;
        this.isFrozen = false;
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

    // @ts-ignore
    private handleBlur = (event: React.FocusEvent<HTMLElement>): void => {
      console.log('handleBlur this.isFrozen =', this.isFrozen);
      if (this.isFrozen) {
        // this.autoFocusDebounce();
        // event.preventDefault();
        // event.nativeEvent.stopImmediatePropagation();
        // setTimeout(() => (this.isFrozen = false), 0);
        return;
      }
      // this.autoFocusDebounce.cancel();

      event.persist();

      this.setState({ isInFocused: false, selected: null, isOnInputMode: false }, () => {
        removeAllSelections();
        this.selectNodeContents(this.divInnerNode, 0, 0);
        if (this.props.onBlur) {
          this.props.onBlur(event);
        }
      });
    };

    // @ts-ignore
    private focused() {
      // if (isEdge) {
      //   setTimeout(() => this.state.isInFocused && this.changeSelectedDateComponent(this.state.selected), 0);
      // } else {
      // }
      if (isIE || isEdge) {
        setTimeout(() => {
          const node = this.inputLikeText && this.inputLikeText.getNode();
          if (
            this.inputLikeText && node && node.contains(document.activeElement)
          ) {
            this.isFrozen = true;
            this.changeSelectedDateComponent(this.state.selected);
            if (this.inputLikeText) {
              this.inputLikeText.focus();
            }
          }
        }, 0);
      } else {
        this.changeSelectedDateComponent(this.state.selected);
      }
    }

    // @ts-ignore
    private selectDateComponent = (selected: DateCustomComponentType | null): void => {
      if (this.isFrozen) {
        return;
      }
      this.setState({ selected });
    };
  };
};
