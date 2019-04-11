import CalendarIcon from '@skbkontur/react-icons/Calendar';
import classNames from 'classnames';
import debounce from 'lodash.debounce';
import * as React from 'react';
import { DateCustom } from '../../lib/date/DateCustom';
import DateCustomGetter from '../../lib/date/DateCustomGetter';
import { DateCustomComponent, DateCustomComponentType, DateCustomValidateCheck } from '../../lib/date/types';
import dragEndDrop from '../../lib/events/dragEndDrop';
import Upgrades from '../../lib/Upgrades';
import { isFirefox } from '../../lib/utils';

import { Nullable } from '../../typings/utility-types';
import { DatePickerLocale, DatePickerLocaleHelper } from '../DatePicker/locale';
import { isEdge, isIE } from '../ensureOldIEClassName';
import InputLikeText from '../internal/InputLikeText';
import { locale } from '../LocaleProvider/decorators';
import styles from './DateInput.less';
import { FragmentDateCustom } from './FragmentDateCustom';
import { Actions, extractAction } from './helpers/DateInputKeyboardActions';
import { inputNumber } from './helpers/inputNumber';
import { removeAllSelections, selectNode, selectNodeContents } from './helpers/SelectionHelpers';

export interface DateInputState {
  selected: DateCustomComponentType | null;
  dateValue: string;
  isOnInputMode: boolean;
  isInFocused: boolean;
  notify: boolean;
  isDragged: boolean;
}

export interface DateInputProps {
  value?: string;
  error?: boolean;
  warning?: boolean;
  disabled?: boolean;
  minDate?: Nullable<string>;
  maxDate?: Nullable<string>;
  width?: string | number;
  withIcon?: boolean;
  size?: 'small' | 'large' | 'medium';
  onBlur?: (x0: React.FocusEvent<HTMLElement>) => void;
  onFocus?: (x0: React.FocusEvent<HTMLElement>) => void;
  onChange?: (x0: { target: { value: string } }, x1: string) => void;
  onKeyDown?: (x0: React.KeyboardEvent<HTMLElement>) => void;
}

@locale('DatePicker', DatePickerLocaleHelper)
export default class DateInput extends React.PureComponent<DateInputProps, DateInputState> {
  public static defaultProps = {
    size: 'small',
    width: 125,
  };

  // Костыль для возможности выделить дату целиком
  // В IE и Edge, при вызове range.selectNodeContents(node)
  // снимается фокус у текущего элемента, из-за чего вызывается handleBlur
  // в handleBlur вызывается window.getSelection().removeAllRanges() и выделение пропадает.
  private isFrozen: boolean = false;

  private locale!: DatePickerLocale;
  private inputLikeText: InputLikeText | null = null;
  private divInnerNode: HTMLElement | null = null;

  private readonly dateCustom: DateCustom;
  private dateComponentsTypesOrder: DateCustomComponentType[];

  private autoFocusDebounce = debounce(() => {
    if (this.inputLikeText && !this.isFrozen && this.state.isInFocused) {
      this.inputLikeText.focus();
    }
  }, 0);

  constructor(props: DateInputProps) {
    super(props);
    this.dateCustom = new DateCustom();
    this.dateComponentsTypesOrder = this.dateCustom.toFragments().map(({ type }) => type);

    this.state = {
      notify: false,
      selected: null,
      dateValue: '',
      isOnInputMode: false,
      isInFocused: false,
      isDragged: false,
    };
  }

  public componentWillReceiveProps(nextProps: DateInputProps) {
    if (this.props !== nextProps) {
      this.updateDateCustom(nextProps);
      this.updateDateComponents();
    }
  }

  public componentDidUpdate(prevProps: DateInputProps, prevState: DateInputState) {
    if (prevState.dateValue !== this.state.dateValue) {
      this.emitChange();
    }
    if (this.state.isInFocused) {
      this.changeSelectedDateComponent(this.state.selected);
    }
    if (this.state.notify && !prevState.notify) {
      this.notify();
    }
  }

  public componentDidMount(): void {
    this.updateDateCustom(this.props);
    this.dateComponentsTypesOrder = this.dateCustom.toFragments().map(({ type }) => type);
    this.updateDateComponents();
    if (this.divInnerNode) {
      dragEndDrop(this.divInnerNode);
      this.divInnerNode.addEventListener('dragndropstart', this.onDraAndDropStart);
      this.divInnerNode.addEventListener('dragndropend', this.onDraAndDropEnd);
    }
  }

  public componentWillUnmount(): void {
    if (this.divInnerNode) {
      this.divInnerNode.removeEventListener('dragndropstart', this.onDraAndDropStart);
      this.divInnerNode.removeEventListener('dragndropend', this.onDraAndDropEnd);
    }
  }

  public render() {
    const { selected, isOnInputMode, dateValue, isInFocused, isDragged } = this.state;
    const fragments =
      !isInFocused && dateValue === ''
        ? []
        : this.dateCustom.toFragments({
            withSeparator: true,
            withPad: true,
          });

    return (
      <InputLikeText
        width={this.props.width}
        ref={el => {
          this.inputLikeText = el;
        }}
        size={this.props.size}
        disabled={this.props.disabled}
        error={this.props.error || !this.dateCustom.validate()}
        warning={this.props.warning}
        onBlurCapture={this.handleBlur}
        onFocus={this.handleFocus}
        onKeyDown={this.handleKeyDown}
        onPaste={this.handlePaste}
        rightIcon={this.renderIcon()}
      >
        {
          <div ref={el => (this.divInnerNode = el)} onDoubleClick={this.onDoubleClick} className={styles.root}>
            {fragments.map((fragment, index) => (
              <FragmentDateCustom
                key={index}
                {...fragment}
                onMouseUp={this.onMouseUpComponent}
                selected={isDragged ? null : selected}
                inputMode={isOnInputMode}
              />
            ))}
          </div>
        }
      </InputLikeText>
    );
  }

  public blur() {
    if (this.inputLikeText) {
      this.inputLikeText.blur();
    }
    this.setState({ isInFocused: false });
  }

  public focus() {
    if (!this.props.disabled) {
      if (this.inputLikeText) {
        this.inputLikeText.focus();
      }
      this.setState({ isInFocused: true });
    }
  }

  public blink() {
    if (!this.props.disabled) {
      if (this.inputLikeText) {
        this.inputLikeText.blink();
      }
    }
  }

  private onMouseUpComponent = (type: DateCustomComponentType) => (event: React.MouseEvent<HTMLElement>) => {
    this.selectDateComponent(type);
    const index = this.dateComponentsTypesOrder.indexOf(type);
    if (index > -1) {
      this.selectNodeContents(this.divInnerNode, index * 2, index * 2 + 1);
    } else {
      this.selectNodeContents(this.divInnerNode);
    }
    event.preventDefault();
    event.stopPropagation();
  };

  private changeSelectedDateComponent = (type?: DateCustomComponentType | null): void => {
    type = type || this.state.selected;
    if (type === null) {
      return;
    }
    if (type === DateCustomComponentType.All) {
      this.selectNodeContents(this.divInnerNode);
      return;
    }
    const index = this.dateComponentsTypesOrder.indexOf(type);
    if (index > -1) {
      this.selectNodeContents(this.divInnerNode, index * 2, index * 2 + 1);
    }
  };
  private onDraAndDropStart = () => this.setState({ isDragged: true, selected: null });

  private onDraAndDropEnd = () => this.setState({ isDragged: false });

  private updateDateCustom(props: DateInputProps) {
    this.dateCustom
      .setOrder(this.locale.order)
      .setSeparator(this.locale.separator)
      .setRangeStart(
        props.minDate ? new DateCustom(this.locale.order, this.locale.separator).parseValue(props.minDate) : null,
      )
      .setRangeEnd(
        props.maxDate ? new DateCustom(this.locale.order, this.locale.separator).parseValue(props.maxDate) : null,
      )
      .parseValue(props.value);
  }

  private getIconSize = () => {
    if (this.props.size === 'large') {
      return '16px';
    }
    if (this.props.size === 'medium' && Upgrades.isSizeMedium16pxEnabled()) {
      return '16px';
    }
    return '14px';
  };

  private handleFocus = (event: React.FocusEvent<HTMLElement>) => {
    this.setState(prevState => {
      return {
        isInFocused: true,
        selected: prevState.selected === null ? this.getFirstDateComponentType() : prevState.selected,
      };
    });

    if (this.props.onFocus && !this.isFrozen) {
      this.props.onFocus(event);
    }
  };

  private handleBlur = (event: React.FocusEvent<HTMLElement>) => {
    if (this.isFrozen) {
      this.autoFocusDebounce();
      event.preventDefault();
      event.nativeEvent.stopImmediatePropagation();
      return;
    }
    this.autoFocusDebounce.cancel();

    this.setState({ isInFocused: false });

    // event have to be persisted
    // as props.onBlur would be called in async way
    event.persist();

    this.setState({ selected: null, isOnInputMode: false }, () => {
      removeAllSelections();
      if (this.props.onBlur && !this.isFrozen) {
        this.props.onBlur(event);
      }
    });
  };

  private handleKeyDown = (event: React.KeyboardEvent<HTMLElement>) => {
    if (this.props.disabled) {
      return;
    }

    if (this.props.onKeyDown) {
      this.props.onKeyDown(event);
      if (event.defaultPrevented) {
        return;
      }
    }

    const action = extractAction(event);

    if (action === Actions.MoveSelectionLeft) {
      this.moveSelection(-1);
    }

    if (action === Actions.MoveSelectionRight || action === Actions.Separator) {
      this.moveSelection(1);
    }

    if (action === Actions.MoveSelectionFirst) {
      this.selectDateComponent(this.getFirstDateComponentType());
    }

    if (action === Actions.MoveSelectionLast) {
      this.selectDateComponent(this.getLastDateComponentType());
    }

    if (action === Actions.Increment) {
      this.updateDateComponentBy(1);
    }

    if (action === Actions.Decrement) {
      this.updateDateComponentBy(-1);
    }

    if (action === Actions.Digit) {
      this.inputValue(event);
    }

    if (action === Actions.ClearSelection) {
      this.clearSelected();
    }

    if (action === Actions.ClearOneChar) {
      if (this.state.selected === DateCustomComponentType.All) {
        this.clearSelected();
      } else {
        this.clearOneChar();
      }
    }

    if (action === Actions.FullSelection) {
      event.preventDefault();
      this.selectDateComponent(DateCustomComponentType.All);
    }

    if (action === Actions.PasteValue) {
      this.selectAll();
    }

    if (action === Actions.CopyValue) {
      if (this.divInnerNode) {
        selectNode(this.divInnerNode);
      }
    }

    if (action === Actions.WrongInput) {
      this.blink();
    }

    if (this.state.isInFocused) {
      this.changeSelectedDateComponent(this.state.selected);
    }

    if (action !== Actions.Ignore && action !== Actions.PasteValue && action !== Actions.CopyValue) {
      event.preventDefault();
    }
  };

  private handlePaste = (e: React.ClipboardEvent<HTMLElement>) => {
    e.preventDefault();
    const pasted = e.clipboardData.getData('text').trim();
    if (pasted) {
      this.dateCustom.parseValue(pasted);
      this.updateDateComponents();
    }
  };

  private emitChange() {
    const value = this.dateCustom.toString({ withPad: true, withSeparator: true });
    if (this.props.value === value) {
      return;
    }
    if (this.props.onChange) {
      this.props.onChange({ target: { value } }, value);
    }
  }

  private clearSelected(): void {
    if (this.dateCustom.get(this.state.selected) === null) {
      this.moveSelection(-1);
      return;
    }
    this.dateCustom.set(this.state.selected, null);
    this.updateDateComponents({ isOnInputMode: false });
    if (this.state.selected === DateCustomComponentType.All) {
      this.selectDateComponent(this.getFirstDateComponentType());
    }
  }

  private clearOneChar(): void {
    const prevType = this.state.selected;
    const nextType =
      prevType === DateCustomComponentType.All
        ? this.dateCustom
            .toFragments({ withSeparator: false })
            .reduce((_type, { value, type }) => (value !== null ? type : _type), this.getLastDateComponentType())
        : prevType;
    let prev = this.dateCustom.get(nextType);
    if (prev === null) {
      this.moveSelection(-1);
      return;
    }
    prev = String(prev);
    const next = prev.replace(/.$/, '') || null;
    this.dateCustom.set(nextType, next);
    this.updateDateComponents({ isOnInputMode: next !== null, selected: nextType });
  }

  private updateDateComponentBy(step: number) {
    removeAllSelections();
    const { selected } = this.state;
    const clone = this.dateCustom.clone();
    const isValidRange = this.dateCustom.validate({ levels: [DateCustomValidateCheck.Range] });
    if (!isValidRange) {
      const start = this.dateCustom.getRangeStart();
      const end = this.dateCustom.getRangeEnd();
      if (start && DateCustomGetter.max([this.dateCustom, start]) === start) {
        this.dateCustom.setComponents(start.getComponentsRaw());
      } else if (end && DateCustomGetter.min([this.dateCustom, end]) === end) {
        this.dateCustom.setComponents(end.getComponentsRaw());
      }
    } else if (this.dateCustom.clone().shift(selected, step, { isRange: false, isLoop: true }).validate()) {
      this.dateCustom.shift(selected, step, { isRange: true, isLoop: true });
    }
    this.updateDateComponents({
      isOnInputMode: false,
      selected: selected === DateCustomComponentType.All ? this.getFirstDateComponentType() : selected,
      notify: clone.get(selected) === this.dateCustom.get(selected),
    });
  }

  private moveSelection(step: number): void {
    removeAllSelections();
    const { selected } = this.state;
    const index = selected === null ? 0 : this.dateComponentsTypesOrder.indexOf(selected);
    let nextIndex = index + step;
    if (selected === DateCustomComponentType.All) {
      nextIndex = step > 0 ? 0 : this.dateComponentsTypesOrder.length - 1;
    }
    if (nextIndex >= 0 && nextIndex < this.dateComponentsTypesOrder.length) {
      this.dateCustom.restore();
      this.setState({
        selected: this.dateComponentsTypesOrder[nextIndex],
        isOnInputMode: false,
      });
    }
  }

  private selectAll(): void {
    this.selectNodeContents(this.divInnerNode);
  }

  private inputValue(event: React.KeyboardEvent<HTMLElement>): void {
    event.persist();
    let { selected: type } = this.state;
    let prev = this.dateCustom.get(type);
    if (type === DateCustomComponentType.All) {
      type = this.getFirstDateComponentType();
      prev = this.dateCustom.get(type);
      this.dateCustom.set(DateCustomComponentType.All, null);
    }
    inputNumber(type, prev, event.key, this.state.isOnInputMode, this.inputNumberCallBack);
  }

  private selectNodeContents = (node: HTMLElement | null, start?: number, end?: number): void => {
    if (this.state.isInFocused && node) {
      if (isIE || isEdge) {
        this.isFrozen = true;
        setTimeout(() => (this.isFrozen = false), 0);
        selectNodeContents(node, start, end);
        if (this.inputLikeText) {
          this.inputLikeText.focus();
        }
      } else {
        if (isFirefox) {
          setTimeout(() => selectNodeContents(node, start, end));
        } else {
          selectNodeContents(node, start, end);
        }
      }
    }
  };

  private inputNumberCallBack = (next: DateCustomComponent, inputMode: boolean): void => {
    let { selected: type } = this.state;
    if (type === DateCustomComponentType.All) {
      type = this.getFirstDateComponentType();
      this.selectDateComponent(type);
    }
    this.dateCustom.set(type, next);
    if (!inputMode) {
      this.moveSelection(1);
    }
    this.updateDateComponents({ isOnInputMode: inputMode });
  };

  private notify(): void {
    this.blink();
    this.setState({ notify: false });
  }

  private selectDateComponent = (type: DateCustomComponentType | null): void => {
    if (this.isFrozen) {
      return;
    }
    // const selectedDateComponent = type === null ? this.getFirstDateComponentType() : type;
    this.setState({ selected: type }, () => {
      // this.changeSelectedDateComponent(selectedDateComponent)
    });
  };

  private onDoubleClick = (): void => {
    this.selectDateComponent(DateCustomComponentType.All);
  };

  private getFirstDateComponentType = (): DateCustomComponentType => this.dateComponentsTypesOrder[0];
  private getLastDateComponentType = (): DateCustomComponentType =>
    this.dateComponentsTypesOrder[this.dateComponentsTypesOrder.length - 1];

  private updateDateComponents = (state: Partial<DateInputState> = {}): void => {
    this.setState({
      dateValue: this.dateCustom.toString({ withSeparator: false, withPad: false }),
      ...state,
    } as DateInputState);
  };

  private renderIcon = (): (() => JSX.Element | null) => {
    const iconStyles = classNames({
      [styles.icon]: true,
      [styles.disabled]: this.props.disabled,
    });

    if (this.props.withIcon) {
      return () => (
        <span className={iconStyles}>
          <CalendarIcon size={this.getIconSize()} />
        </span>
      );
    }
    return () => null;
  };
}
