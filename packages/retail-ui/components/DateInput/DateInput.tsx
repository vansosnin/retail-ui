import CalendarIcon from '@skbkontur/react-icons/Calendar';
import classNames from 'classnames';
import * as React from 'react';
import { defaultDateComponentsOrder, defaultDateComponentsSeparator } from '../../lib/date/constants';
import { DateCustom } from '../../lib/date/DateCustom';
import DateCustomTransformer from '../../lib/date/DateCustomTransformer';
import {
  DateCustomComponents,
  DateCustomOrder,
  DateCustomSeparator,
  DateComponentType,
  DateCustomFragment,
} from '../../lib/date/types';
import Upgrades from '../../lib/Upgrades';

import { Nullable } from '../../typings/utility-types';

import { CalendarDateShape } from '../Calendar/CalendarDateShape';
import { parseDateString } from '../DatePicker/DatePickerHelpers';
import { tryGetValidDateShape } from '../DatePicker/DateShape';
import { DatePickerLocaleHelper } from '../DatePicker/locale';
import { isEdge, isIE } from '../ensureOldIEClassName';
import Input from '../Input';
import InputLikeText from '../internal/InputLikeText';
import { LangCodes } from '../LocaleProvider';
import { locale } from '../LocaleProvider/decorators';
import styles from './DateInput.less';
import { setSelection, tryParseDateString } from './DateInputHelpers';

import { formatDate, parseValue } from './DateInputHelpers/dateFormat';
import { fillEmptyParts } from './DateInputHelpers/fillEmptyParts';
import { maskChar } from './DateInputHelpers/maskChar';
import { Actions, extractAction } from './DateInputKeyboardActions';
import { DatePart } from './DatePart';
import { MaskedValue } from './MaskedValue';
import { removeAllSelections, selectNodeContents } from './SelectionHelpers';

export const DateInputConfig = {
  polyfillInput: !isIE && !isEdge,
};

export const DateParts = {
  Date: 0,
  Month: 1,
  Year: 2,
  All: 3,
};

const DatePartRanges: { [key: number]: [number, number] } = {
  [DateParts.Date]: [0, 2],
  [DateParts.Month]: [3, 5],
  [DateParts.Year]: [6, 10],
  [DateParts.All]: [0, 10],
};

export interface DateInputState {
  editingCharIndex: number;
  date: string | null;
  month: string | null;
  year: string | null;
  minDate: Nullable<CalendarDateShape>;
  maxDate: Nullable<CalendarDateShape>;
  notify: boolean;
  dateWasChanged: boolean;

  selectedDateComponent: DateComponentType | null;
  dateComponents: DateCustomComponents;
  inputMode: boolean;
  inputStarted: boolean;
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
  dateComponentsOrder?: DateCustomOrder;
  dateComponentsSeparator?: DateCustomSeparator;
}

export type DateInputSetStateCallBack = (
  prevState: Readonly<DateInputState>,
  props?: DateInputProps,
) => DateInputState | Pick<DateInputState, keyof DateInputState> | null;

@locale('DatePicker', DatePickerLocaleHelper)
class DateInput extends React.Component<DateInputProps, DateInputState> {
  public static defaultProps = {
    size: 'small',
    width: 125,
    dateComponentsOrder: defaultDateComponentsOrder,
    dateComponentsSeparator: defaultDateComponentsSeparator,
  };

  private langCode!: LangCodes;
  private input: Input | null = null;
  private inputlikeText: InputLikeText | null = null;
  private divInnerNode: HTMLElement | null = null;
  private isFocused: boolean = false;

  private readonly dateCustom: DateCustom;
  private readonly dateCustomTypeOrder: DateComponentType[];

  constructor(props: DateInputProps) {
    super(props);
    this.dateCustom = new DateCustom(props.dateComponentsOrder, props.dateComponentsSeparator)
      .parseValue(props.value)
      .setRangeStart(
        props.minDate
          ? new DateCustom(props.dateComponentsOrder, props.dateComponentsSeparator).parseValue(props.minDate)
          : null,
      )
      .setRangeEnd(
        props.maxDate
          ? new DateCustom(props.dateComponentsOrder, props.dateComponentsSeparator).parseValue(props.maxDate)
          : null,
      );
    this.dateCustomTypeOrder = this.dateCustom.toFragments().map(({ type }) => type);
    window.DCDI = this.dateCustom;

    this.state = {
      editingCharIndex: 0,
      ...parseValue(props.value),
      minDate: tryGetCalendarDateShape(props.minDate),
      maxDate: tryGetCalendarDateShape(props.maxDate),
      notify: false,
      dateWasChanged: false,

      selectedDateComponent: null,
      dateComponents: this.dateCustom.getComponents(),
      inputMode: false,
      inputStarted: false,
    };
  }

  public componentWillReceiveProps(nextProps: DateInputProps) {
    if (this.props !== nextProps) {
      this.dateCustom
        .parseValue(nextProps.value || this.props.value)
        .setOrder(nextProps.dateComponentsOrder || this.props.dateComponentsOrder)
        .setSeparator(nextProps.dateComponentsSeparator || this.props.dateComponentsSeparator);

      this.updateDateComponents();
      this.deriveStateFromValue(nextProps.value);
    }
    if (this.props.minDate !== nextProps.minDate) {
      this.deriveMinDate(nextProps.minDate);
    }
    if (this.props.maxDate !== nextProps.maxDate) {
      this.deriveMaxDate(nextProps.maxDate);
    }
  }

  public componentDidUpdate(prevProps: DateInputProps, prevState: DateInputState) {
    if (
      prevState.dateComponents.date !== this.state.dateComponents.date ||
      prevState.dateComponents.month !== this.state.dateComponents.month ||
      prevState.dateComponents.year !== this.state.dateComponents.year
    ) {
      this.setState({ dateWasChanged: true });

      this.emitChange();
    }

    if (prevState.selectedDateComponent !== this.state.selectedDateComponent) {
      this.dateCustom.restore();
      this.updateDateComponents({ dateWasChanged: false });
    }

    if (this.state.selectedDateComponent === DateComponentType.All) {
      this.selectAll();
    } else {
      this.selectDatePartInInput();
    }

    if (this.state.notify && !prevState.notify) {
      this.notify();
    }
  }

  /**
   * @public
   */
  public blur() {
    if (this.inputlikeText) {
      this.inputlikeText.blur();
    }
    if (this.input) {
      this.input.blur();
    }
    this.isFocused = false;
  }

  /**
   * @public
   */
  public focus() {
    if (!this.props.disabled) {
      if (this.inputlikeText) {
        this.inputlikeText.focus();
      }
      if (this.input) {
        this.input.focus();
      }
      this.isFocused = true;
    }
  }

  /**
   * @public
   */
  public blink() {
    if (!this.props.disabled) {
      if (this.inputlikeText) {
        this.inputlikeText.blink();
      }
      if (this.input) {
        this.input.blink();
      }
    }
  }

  public render() {
    return DateInputConfig.polyfillInput
      ? /**
         * Internet Explorer looses focus on element, if its containing node
         * would be selected with selectNodeContents
         *
         * Rendering input with mask
         */
        this.renderInputLikeText()
      : this.renderInput();
  }

  private renderInput() {
    const isMaskHidden = this.checkIfMaskHidden();

    return (
      <Input
        width={this.props.width}
        ref={el => (this.input = el)}
        size={this.props.size}
        disabled={this.props.disabled}
        error={this.props.error}
        warning={this.props.warning}
        onBlur={this.handleBlur}
        onFocus={this.handleFocus}
        onKeyDown={this.handleKeyDown}
        onClick={this.handleInputClick}
        onDoubleClick={this.handleDoubleClick}
        onPaste={this.handlePaste}
        value={isMaskHidden ? '' : this.getFormattedValue()}
        rightIcon={this.renderIcon()}
      />
    );
  }

  private renderInputLikeText() {
    console.log('langCode', this.langCode);
    const { selectedDateComponent, inputMode, dateComponents } = this.state;
    const isMaskHidden = this.checkIfMaskHidden();
    const isValid = this.dateCustom.validate();
    return (
      <InputLikeText
        width={this.props.width}
        ref={el => (this.inputlikeText = el)}
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
        {!isMaskHidden && (
          <div
            ref={el => (this.divInnerNode = el)}
            onDoubleClick={() => this.selectDateComponent(DateComponentType.All)}
            className={styles.root}
          >
            {this.dateCustom
              .toFragments({
                withSeparator: true,
                withPad: true,
                withValidation: true,
              })
              .map(({ type, value, length, valueWithPad, isValid: isValidFragment }, index) => {
                value = !(inputMode && selectedDateComponent === type) && valueWithPad ? valueWithPad : value;
                return type === DateComponentType.Separator ? (
                  <span key={type + index.toString()} className={styles.delimiter}>
                    {value}
                  </span>
                ) : (
                  <DatePart
                    isValid={isValid}
                    isValidFragment={isValidFragment}
                    key={type}
                    selected={selectedDateComponent === type}
                    onMouseDown={this.createSelectionHandler(type)}
                  >
                    <MaskedValue value={value} length={length} />
                  </DatePart>
                );
              })}
          </div>
        )}
      </InputLikeText>
    );
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

  private handleMouseDown = (event: React.MouseEvent<HTMLInputElement>) => {
    if (this.props.disabled) {
      return;
    }
    event.preventDefault();
    this.selectDateComponent(null);

    // Firefix prevents focus if mousedown prevented
    if (!this.isFocused) {
      this.focus();
    }
  };

  private handleInputClick = (event: React.MouseEvent<HTMLInputElement>) => {
    const { start, end } = getInputSelection(event.target);
    const blockToSelect =
      start !== end ? DateParts.All : start < 3 ? DateParts.Date : start < 6 ? DateParts.Month : DateParts.Year;
    this.selectDateComponent(blockToSelect);
  };

  private handleDoubleClick = () => {
    this.selectDateComponent(DateComponentType.All);
  };

  private handleFocus = (event: React.FocusEvent<HTMLElement>) => {
    this.isFocused = true;

    this.selectDateComponent(null);
    if (this.props.onFocus) {
      this.props.onFocus(event);
    }
  };

  private handleBlur = (event: React.FocusEvent<HTMLElement>) => {
    this.isFocused = false;

    // event have to be persisted
    // as props.onBlur would be called in async way
    event.persist();

    // both setStates would be batched
    // because this handler was called by
    // react synthetic event
    this.setState(setSelection(null));
    this.setState(
      state => {
        const hasDateEntry = state.date || state.month || state.year;
        return hasDateEntry ? fillEmptyParts(state) : {};
      },
      () => {
        removeAllSelections();
        if (this.props.onBlur) {
          this.props.onBlur(event);
        }
      },
    );
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

    if (action !== Actions.Ignore) {
      event.preventDefault();
    }

    if (action === Actions.MoveSelectionLeft) {
      this.moveSelection(-1);
    }

    if (action === Actions.MoveSelectionRight) {
      this.moveSelection(1);
    }

    if (action === Actions.Increment) {
      this.updateDatePartBy(1);
    }

    if (action === Actions.Decrement) {
      this.updateDatePartBy(-1);
    }

    if (action === Actions.Digit) {
      this.inputValue(event);
    }

    if (action === Actions.ClearSelection) {
      this.clearDatePart();
    }

    if (action === Actions.FullSelection) {
      this.selectDateComponent(DateComponentType.All);
    }

    if (action === Actions.Separator) {
      this.handleSeparatorKey();
    }

    if (action === Actions.WrongInput) {
      this.blink();
    }
  };

  private handlePaste = (e: React.ClipboardEvent<HTMLElement>) => {
    e.preventDefault();
    const parsed = tryParseDateString(e.clipboardData.getData('text'));
    if (parsed) {
      this.setState({ ...parsed, selectedDateComponent: DateComponentType.All });
    }
  };

  private handleSeparatorKey() {
    if (this.state.dateWasChanged) {
      this.moveSelection(1);
    }
  }

  private getFormattedValue() {
    const { date, month, year } = this.state;
    return dateToMask(date, month, year);
  }

  private selectDatePartInInput() {
    if (DateInputConfig.polyfillInput || !this.isFocused) {
      return;
    }

    const { selectedDateComponent } = this.state;
    if (selectedDateComponent == null) {
      removeAllSelections();
      return;
    }

    const [start, end] = DatePartRanges[selectedDateComponent];
    if (this.input) {
      this.input.setSelectionRange(start, end);
    }
  }

  private checkIfMaskHidden() {
    return (
      ![this.state.date, this.state.month, this.state.year].some(Boolean) && this.state.selectedDateComponent == null
    );
  }

  private deriveStateFromValue(value: Nullable<string>) {
    this.setState(parseValue(value));
  }

  private deriveMinDate(minDate: Nullable<string>) {
    this.setState({ minDate: tryGetCalendarDateShape(minDate) });
  }

  private deriveMaxDate(maxDate: Nullable<string>) {
    this.setState({ maxDate: tryGetCalendarDateShape(maxDate) });
  }

  private emitChange() {
    const { date, month, year } = this.state;
    const value = formatDate(date, month, year);
    if (this.props.value === value) {
      return;
    }
    if (this.props.onChange) {
      this.props.onChange({ target: { value } }, value);
    }
  }

  private createSelectionHandler(index: DateComponentType) {
    return (event: React.SyntheticEvent<HTMLElement>) => {
      if (this.props.disabled) {
        return;
      }

      event.preventDefault();
      event.stopPropagation();

      if (this.inputlikeText) {
        this.inputlikeText.focus();
      }

      this.selectDateComponent(index);
    };
  }

  private clearDatePart() {
    console.log('clearDatePart');
    this.dateCustom.set(this.state.selectedDateComponent, null);
    this.setState({ inputMode: true });
    this.updateDateComponents();
    // this.setState(clearDatePart);
  }

  private updateDatePartBy(step: number) {
    this.setState({ inputMode: false });
    this.dateCustom.shift(this.state.selectedDateComponent, step);
    this.updateDateComponents();
    // this.setState(updateDatePartBy(step));
  }

  private inputValue(event: React.KeyboardEvent<HTMLElement>) {
    event.persist();
    const type = this.state.selectedDateComponent === null ? DateComponentType.Date : this.state.selectedDateComponent;
    const prevValue = this.dateCustom.get(type);
    const nextValue = Number(`${prevValue || ''}${event.key}`.slice(-4));
    // this.setState({
    //   inputMode: true,
    //   dateComponents: {
    //     ...this.state.dateComponents,
    //     year: nextValue,
    //   },
    // });
    this.dateCustom.set(type, nextValue);
    if (
      this.state.selectedDateComponent === DateComponentType.Month &&
      (this.state.dateComponents.month === null || this.state.dateComponents.month === 0) &&
      event.key > '3'
    ) {
      this.moveSelection(1);
      // this.dateCustom.restore();
    }
    this.updateDateComponents();
    console.log('inputValue', prevValue, nextValue, this.dateCustom.validate(type, nextValue));
    // const update = (value: string, inputStarted: boolean = true) => {
    //   const prevValue = !inputStarted ? this.dateCustom.get(this.state.selectedDateComponent) : '';
    //   const notify = this.dateCustom.set(
    //     this.state.selectedDateComponent,
    //     Number(`${prevValue || ''}${event.key}`.slice(-4)),
    //   );
    //   this.updateDateComponents({ notify: !notify });
    // };
    //
    // if (!this.state.inputMode) {
    //   this.setState({ inputMode: true }, () => update(event.key));
    // } else {
    //   update(event.key, false);
    // }
  }

  private moveSelection(step: number) {
    this.setState({ inputMode: false });
    const { selectedDateComponent } = this.state;
    const index = selectedDateComponent === null ? 0 : this.dateCustomTypeOrder.indexOf(selectedDateComponent);
    const nextIndex = index + step;
    if (nextIndex >= 0 && nextIndex < this.dateCustomTypeOrder.length) {
      this.setState({ selectedDateComponent: this.dateCustomTypeOrder[nextIndex] });
    }
    // this.setState(moveSelectionBy(step));
  }

  private selectDateComponent(type: DateComponentType | null) {
    const selectedDateComponent =
      type === DateComponentType.All
        ? DateComponentType.All
        : type === null
          ? this.dateCustomTypeOrder[0]
          : this.dateCustomTypeOrder.indexOf(type);
    this.setState({ selectedDateComponent });
    // this.setState(setSelection(index), cb);
  }

  private selectAll() {
    if (this.isFocused) {
      if (this.input) {
        this.input.setSelectionRange(0, 10);
      }
      if (this.divInnerNode) {
        selectNodeContents(this.divInnerNode);
      }
    }
  }

  private notify() {
    this.blink();
    this.setState({ notify: false });
  }

  private updateDateComponents = (state: Partial<DateInputState> = {}) => {
    this.setState({
      dateComponents: this.dateCustom.getComponents(),
      ...state,
    } as DateInputState);
  };

  private renderIcon = () => {
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
  };
}

function dateToMask(date: string | null, month: string | null, year: string | null) {
  const date_ = date ? date.padEnd(2, maskChar) : maskChar.repeat(2);
  const month_ = month ? month.padEnd(2, maskChar) : maskChar.repeat(2);
  const year_ = year ? year.padEnd(4, maskChar) : maskChar.repeat(4);
  return `${date_}.${month_}.${year_}`;
}

function getInputSelection(input: EventTarget) {
  if (!(input instanceof HTMLInputElement)) {
    throw new Error('input is not HTMLInputElement');
  }
  return {
    start: input.selectionStart!,
    end: input.selectionEnd!,
    direction: input.selectionDirection!,
  };
}

const tryGetCalendarDateShape = (dateString: Nullable<string>) => {
  return dateString ? tryGetValidDateShape(parseDateString(dateString)) : null;
};

export default DateInput;
