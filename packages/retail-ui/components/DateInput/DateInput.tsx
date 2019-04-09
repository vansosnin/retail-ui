import CalendarIcon from '@skbkontur/react-icons/Calendar';
import classNames from 'classnames';
import * as React from 'react';
import { DateCustom } from '../../lib/date/DateCustom';
import {
  DateCustomComponentType,
  DateCustomComponent,
  DateCustomValidateCheck,
} from '../../lib/date/types';
import Upgrades from '../../lib/Upgrades';

import { Nullable } from '../../typings/utility-types';
import { DatePickerLocale, DatePickerLocaleHelper } from '../DatePicker/locale';
import { isEdge, isIE } from '../ensureOldIEClassName';
import InputLikeText from '../internal/InputLikeText';
import { locale } from '../LocaleProvider/decorators';
import styles from './DateInput.less';
import { FragmentDateCustom } from './FragmentDateCustom';
import { inputNumber } from './helpers/inputNumber';
import { Actions, extractAction } from './helpers/DateInputKeyboardActions';
import { removeAllSelections, selectNodeContents } from './helpers/SelectionHelpers';

export interface DateInputState {
  notify: boolean;
  selected: DateCustomComponentType | null;
  dateValue: string;
  inputMode: boolean;
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
  private isFocused: boolean = false;

  private readonly dateCustom: DateCustom;
  private dateCustomTypeOrder: DateCustomComponentType[];

  constructor(props: DateInputProps) {
    super(props);
    this.dateCustom = new DateCustom();
    this.dateCustomTypeOrder = this.dateCustom.toFragments().map(({ type }) => type);

    this.state = {
      notify: false,
      selected: null,
      dateValue: '',
      inputMode: false,
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

    if (this.state.selected === DateCustomComponentType.All) {
      this.selectAll();
    } else if (prevState.selected === DateCustomComponentType.All) {
      removeAllSelections();
    }

    if (this.state.notify && !prevState.notify) {
      this.notify();
    }
  }

  public componentDidMount(): void {
    this.updateDateCustom(this.props);
    this.dateCustomTypeOrder = this.dateCustom.toFragments().map(({ type }) => type);
    this.updateDateComponents();
  }

  public blur() {
    if (this.inputLikeText) {
      this.inputLikeText.blur();
    }
    this.isFocused = false;
  }

  public focus() {
    if (!this.props.disabled) {
      if (this.inputLikeText) {
        this.inputLikeText.focus();
      }
      this.isFocused = true;
    }
  }

  public blink() {
    if (!this.props.disabled) {
      if (this.inputLikeText) {
        this.inputLikeText.blink();
      }
    }
  }

  public render() {
    const { selected, inputMode, dateValue } = this.state;
    const isValid = this.dateCustom.validate();
    const fragments =
      !this.isFocused && dateValue === ''
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
            {fragments.map((fragment, index) => (
              <FragmentDateCustom
                key={index}
                {...fragment}
                onMouseDown={this.onMouseDownComponent}
                isValidFully={isValid}
                selected={selected}
                inputMode={inputMode}
              />
            ))}
          </div>
        }
      </InputLikeText>
    );
  }

  private onMouseDownComponent = (type: DateCustomComponentType) => () => this.selectDateComponent(type);

  private updateDateCustom(props: DateInputProps) {
    this.dateCustom
      .setOrder(this.locale.order)
      .setSeparator(this.locale.separator)
      .setRangeStart(
        props.minDate
          ? new DateCustom(this.locale.order, this.locale.separator).parseValue(
              props.minDate,
            )
          : null,
      )
      .setRangeEnd(
        props.maxDate
          ? new DateCustom(this.locale.order, this.locale.separator).parseValue(
              props.maxDate,
            )
          : null,
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

  private handleMouseDown = (event: React.MouseEvent<HTMLInputElement>) => {
    if (this.props.disabled) {
      return;
    }
    event.preventDefault();

    // Firefix prevents focus if mousedown prevented
    if (!this.isFocused) {
      this.focus();
    }
  };

  private handleFocus = (event: React.FocusEvent<HTMLElement>) => {
    this.isFocused = true;

    this.selectDateComponent(this.dateCustomTypeOrder[0]);
    if (this.props.onFocus) {
      this.props.onFocus(event);
    }
  };

  private handleBlur = (event: React.FocusEvent<HTMLElement>) => {
    if (this.isFrozen) {
      return;
    }

    this.isFocused = false;

    // event have to be persisted
    // as props.onBlur would be called in async way
    event.persist();

    this.setState({ selected: null, inputMode: false }, () => {
      removeAllSelections();
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
      this.updateDateComponentBy(1);
    }

    if (action === Actions.Decrement) {
      this.updateDateComponentBy(-1);
    }

    if (action === Actions.Digit) {
      this.inputValue(event);
    }

    if (action === Actions.ClearSelection) {
      this.clearDateComponent();
    }

    if (action === Actions.FullSelection) {
      event.preventDefault();
      this.selectDateComponent(DateCustomComponentType.All);
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
    const pasted = e.clipboardData.getData('text');
    if (pasted) {
      this.dateCustom.parseValue(pasted);
      this.updateDateComponents();
    }
  };

  private handleSeparatorKey() {
    if (this.state.inputMode && this.dateCustom.get(this.state.selected) !== null) {
      this.moveSelection(1);
    }
  }

  private emitChange() {
    const value = this.dateCustom.toString({ withPad: true, withSeparator: true });
    if (this.props.value === value) {
      return;
    }
    if (this.props.onChange && this.dateCustom.validate({ levels: [DateCustomValidateCheck.Range] })) {
      this.props.onChange({ target: { value } }, value);
    }
  }

  private clearDateComponent() {
    this.dateCustom.set(this.state.selected, null);
    this.setState({
      inputMode: true,
    });
    this.updateDateComponents();
  }

  private updateDateComponentBy(step: number) {
    const { selected } = this.state;
    this.dateCustom.shift(selected, step);
    this.updateDateComponents({
      inputMode: false,
      selected: selected === DateCustomComponentType.All ? DateCustomComponentType.Date : selected,
    });
  }

  private inputValue(event: React.KeyboardEvent<HTMLElement>) {
    event.persist();
    const { selected: type } = this.state;
    const prev = this.dateCustom.get(type);

    const inputNumberCallBack = (next: DateCustomComponent, inputMode: boolean) => {
      this.dateCustom.set(type, next);
      if (!inputMode) {
        if (
          this.dateCustom.validate({
            levels: [DateCustomValidateCheck.Native, DateCustomValidateCheck.Range],
          })
        ) {
          this.moveSelection(1);
        }
      }
      this.updateDateComponents({ inputMode });
    };
    inputNumber(type, prev, event.key, this.state.inputMode, inputNumberCallBack);
  }

  private moveSelection(step: number) {
    const { selected } = this.state;
    const index = selected === null ? 0 : this.dateCustomTypeOrder.indexOf(selected);
    let nextIndex = index + step;
    removeAllSelections();
    if (selected === DateCustomComponentType.All) {
      nextIndex = step > 0 ? 0 : this.dateCustomTypeOrder.length - 1;
    }
    if (nextIndex >= 0 && nextIndex < this.dateCustomTypeOrder.length) {
      this.dateCustom.restore();
      this.setState({
        selected: this.dateCustomTypeOrder[nextIndex],
        inputMode: false,
      });
    }
  }

  private selectDateComponent = (type: DateCustomComponentType | null) => {
    if (this.isFrozen) {
      return;
    }
    const selectedDateComponent = type === null ? this.dateCustomTypeOrder[0] : type;
    this.setState({ selected: selectedDateComponent });
  };

  private selectAll() {
    if (this.isFocused) {
      if (this.divInnerNode) {
        if (isIE || isEdge) {
          this.isFrozen = true;
          setTimeout(() => (this.isFrozen = false), 0);
          selectNodeContents(this.divInnerNode);
          if (this.inputLikeText) {
            this.inputLikeText.focus();
          }
        } else {
          selectNodeContents(this.divInnerNode);
        }
      }
    }
  }

  private onDoubleClick = () => {
    this.selectDateComponent(DateCustomComponentType.All);
  };

  private notify() {
    this.blink();
    this.setState({ notify: false });
  }

  private updateDateComponents = (state: Partial<DateInputState> = {}) => {
    this.setState({
      dateValue: this.dateCustom.toString({ withSeparator: false, withPad: false }),
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
