import CalendarIcon from '@skbkontur/react-icons/Calendar';
import classNames from 'classnames';
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
import { DateInputFallback } from './DateInputFallback';
import { FragmentDateCustom } from './FragmentDateCustom';
import { Actions, extractAction } from './helpers/DateInputKeyboardActions';
import { inputNumber } from './helpers/inputNumber';
import { removeAllSelections, selectNodeContents } from './helpers/SelectionHelpers';

export interface DateInputState {
  selected: DateCustomComponentType | null;
  dateValue: string;
  isOnInputMode: boolean;
  isInFocused: boolean;
  notify: boolean;
  isDragged: boolean;
  isAutoMoved: boolean;
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
  onChange?: (x0: { target: { value: string } }, x1: string, x2: DateCustom) => void;
  onKeyDown?: (x0: React.KeyboardEvent<HTMLElement>) => void;
}

@locale('DatePicker', DatePickerLocaleHelper)
export class DateInput extends React.PureComponent<DateInputProps, DateInputState> {
  public static defaultProps = {
    size: 'small',
    width: 125,
  };

  private locale!: DatePickerLocale;
  private inputLikeText: InputLikeText | null = null;
  private divInnerNode: HTMLElement | null = null;

  private readonly dateCustom: DateCustom;
  private dateComponentsTypesOrder: DateCustomComponentType[];

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
      isAutoMoved: false,
    };
  }

  public componentDidUpdate(prevProps: DateInputProps, prevState: DateInputState) {
    if (
      prevProps.value !== this.props.value ||
      prevProps.minDate !== this.props.minDate ||
      prevProps.maxDate !== this.props.maxDate
    ) {
      this.updateDateCustom(this.props);
      this.updateDateComponents();
    }
    if (prevState.dateValue !== this.state.dateValue) {
      this.emitChange();
    }

    if (this.state.isInFocused && prevState.selected !== this.state.selected) {
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
    return (
      <InputLikeText
        width={this.props.width}
        ref={el => {
          this.inputLikeText = el;
        }}
        size={this.props.size}
        disabled={this.props.disabled}
        error={this.props.error}
        warning={this.props.warning}
        onBlur={this.handleBlur}
        onFocus={this.handleFocus}
        onKeyDown={this.handleKeyDown}
        onMouseDown={this.handleMouseDown}
        onPaste={this.handlePaste}
        rightIcon={this.renderIcon()}
      >
        {
          <div ref={el => (this.divInnerNode = el)} onDoubleClick={this.onDoubleClick} className={styles.root}>
            {this.getFragments()}
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

  private getFragments = (): JSX.Element[] => {
    const { selected, isOnInputMode, dateValue, isInFocused, isDragged } = this.state;
    const fragments =
      isInFocused || dateValue !== ''
        ? this.dateCustom.toFragments({
            withSeparator: true,
            withPad: true,
          })
        : [];
    return fragments.map((fragment, index) => (
      <FragmentDateCustom
        key={index}
        {...fragment}
        onMouseUp={this.onMouseUpComponent}
        selected={isDragged ? null : selected}
        inputMode={isOnInputMode}
      />
    ));
  };

  private handleMouseDown = () => {
    // for IE and Edge
  };

  private onMouseUpComponent = (type: DateCustomComponentType) => (event: React.MouseEvent<HTMLElement>) => {
    this.selectDateComponent(type);
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

  private handleFocus = (event: React.FocusEvent<HTMLElement>): void => {
    this.setState(prevState => {
      return {
        isInFocused: true,
        selected: prevState.selected === null ? this.getFirstDateComponentType() : prevState.selected,
      };
    });

    if (this.props.onFocus) {
      this.props.onFocus(event);
    }
  };

  private handleBlur = (event: React.FocusEvent<HTMLElement>): void => {
    event.persist();

    this.setState({ isInFocused: false, selected: null, isOnInputMode: false }, () => {
      removeAllSelections();
      this.dateCustom.restore();
      this.updateDateComponents();
      if (this.props.onBlur) {
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

    if (action === Actions.MoveSelectionRight) {
      this.moveSelection(1);
    }

    if (action === Actions.Separator) {
      this.pressDelimiter();
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
      event.nativeEvent.stopImmediatePropagation();
      this.selectDateComponent(DateCustomComponentType.All);
    }

    if (action === Actions.PasteValue) {
      if (isIE) {
        // @ts-ignore
        this.handlePaste(undefined, window.clipboardData.getData('text'));
      }
    }

    if (action === Actions.WrongInput) {
      this.blink();
    }

    if (this.state.isInFocused && action !== Actions.Ignore) {
      this.selection();
    }

    if (action !== Actions.Ignore && action !== Actions.PasteValue && action !== Actions.CopyValue) {
      event.preventDefault();
    }
  };

  private selection() {
    this.changeSelectedDateComponent(this.state.selected);
  }

  private pressDelimiter = () => {
    const value = this.dateCustom.get(this.state.selected);
    if (value !== null && value !== '') {
      if (this.state.isAutoMoved) {
        this.setState({ isAutoMoved: false });
      } else {
        this.moveSelection(1);
      }
    }
  };

  private handlePaste = (e?: React.ClipboardEvent<HTMLElement>, pasted?: string) => {
    pasted = pasted || (e && e.clipboardData.getData('text').trim());
    if (pasted) {
      this.dateCustom.parseValue(pasted).restore();
      this.updateDateComponents();
    }
  };

  private emitChange() {
    const value = this.dateCustom.toString({ withPad: true, withSeparator: true });
    if (this.props.value === value) {
      return;
    }
    if (this.props.onChange) {
      this.props.onChange({ target: { value } }, value, this.dateCustom);
    }
  }

  private clearSelected(): void {
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
    let { selected } = this.state;
    selected = selected === null ? this.getFirstDateComponentType() : selected;
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
    } else if (
      this.dateCustom
        .clone()
        .shift(selected, step, { isRange: false, isLoop: true })
        .validate()
    ) {
      this.dateCustom.shift(selected, step, { isRange: true, isLoop: true });
    }
    this.updateDateComponents({
      isOnInputMode: false,
      selected: selected === DateCustomComponentType.All ? this.getFirstDateComponentType() : selected,
      notify: clone.get(selected) === this.dateCustom.get(selected),
    });
  }

  private moveSelection(step: number, isAutoMoved: boolean = false): void {
    const { selected } = this.state;
    const index = selected === null ? 0 : this.dateComponentsTypesOrder.indexOf(selected);
    let nextIndex = index + step;
    if (selected === DateCustomComponentType.All) {
      nextIndex = step < 0 ? 0 : this.dateComponentsTypesOrder.length - 1;
    }
    if (selected === DateCustomComponentType.Year) {
      this.dateCustom.restore(selected);
    }
    if (nextIndex >= 0 && nextIndex < this.dateComponentsTypesOrder.length) {
      this.setState({
        selected: this.dateComponentsTypesOrder[nextIndex],
        isOnInputMode: false,
        isAutoMoved,
      });
    }
  }

  private notify(): void {
    this.blink();
    this.setState({ notify: false });
  }

  private inputValue(event: React.KeyboardEvent<HTMLElement>): void {
    event.persist();
    let { selected: type } = this.state;
    let prev = this.dateCustom.get(type);
    if (type === null) {
      type = this.getFirstDateComponentType();
      prev = null;
      this.dateCustom.set(type, null);
    }
    if (type === DateCustomComponentType.All) {
      type = this.getFirstDateComponentType();
      prev = null;
      this.dateCustom.set(DateCustomComponentType.All, null);
    }
    this.setState({ selected: type }, () => {
      inputNumber(type, prev, event.key, this.state.isOnInputMode, this.inputNumberCallBack);
    });
  }

  private inputNumberCallBack = (next: DateCustomComponent, inputMode: boolean): void => {
    let { selected: type } = this.state;
    if (type === null || type === DateCustomComponentType.All) {
      type = this.getFirstDateComponentType();
      inputMode = false;
      this.selectDateComponent(type);
    }
    this.dateCustom.set(type, next);
    if (!inputMode) {
      this.dateCustom.cutOffExcess();
      this.moveSelection(1, true);
    }
    this.updateDateComponents({ isOnInputMode: inputMode });
  };

  private selectNodeContents = (node: HTMLElement | null, start?: number, end?: number): void => {
    if (this.state.isInFocused && node) {
      if (isFirefox) {
        selectNodeContents(node, start, end);
        setTimeout(() => this.state.isInFocused && selectNodeContents(node, start, end), 0);
      } else {
        selectNodeContents(node, start, end);
      }
    }
  };

  private selectDateComponent = (selected: DateCustomComponentType | null): void => {
    this.setState({ selected, isOnInputMode: false });
  };

  private onDoubleClick = (): void => {
    this.selectDateComponent(DateCustomComponentType.All);
  };

  private getFirstDateComponentType = (): DateCustomComponentType => this.dateComponentsTypesOrder[0];
  private getLastDateComponentType = (): DateCustomComponentType =>
    this.dateComponentsTypesOrder[this.dateComponentsTypesOrder.length - 1];

  private updateDateComponents = (state: Partial<DateInputState> = {}): void => {
    this.setState({
      ...state,
      dateValue: this.dateCustom.toString({ withSeparator: false, withPad: false }),
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

export default (isIE || isEdge ? DateInputFallback(DateInput) : DateInput);
