import CalendarIcon from '@skbkontur/react-icons/Calendar';
import classNames from 'classnames';
import * as React from 'react';
import { DateCustom } from '../../lib/date/DateCustom';
import DateCustomGetter from '../../lib/date/DateCustomGetter';
import DateCustomTransformer from '../../lib/date/DateCustomTransformer';
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
  dateCustom: DateCustom | null;
  typesOrder: DateCustomComponentType[];
  isOnInputMode: boolean;
  isInFocused: boolean;
  notify: boolean;
  isDragged: boolean;
  isAutoMoved: boolean;
}

export interface DateInputProps {
  dateCustom?: DateCustom;
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
  /**
   * @param fakeEvent - объект, частично имитирующий объект `Event`.
   * @param value - значение выбранной даты в виде строки.
   * @param dateCustom - экземпляр класса `DateCustom`, для работы датой. Доступен метод `dateCustom.validate()`
   */
  onChange?: (fakeEvent: { target: { value: string } }, value: string, dateCustom: DateCustom) => void;
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
  private isMouseDown: boolean = false;

  constructor(props: DateInputProps) {
    super(props);

    this.state = {
      notify: false,
      selected: null,
      dateCustom: null,
      typesOrder: [],
      isOnInputMode: false,
      isInFocused: false,
      isDragged: false,
      isAutoMoved: false,
    };
  }

  public updateLocaleContext(): void {
    this.updateDateCustom();
  }

  public componentDidUpdate(prevProps: DateInputProps, prevState: DateInputState) {
    if (
      prevProps.value !== this.props.value ||
      prevProps.minDate !== this.props.minDate ||
      prevProps.maxDate !== this.props.maxDate
    ) {
      this.updateDateCustom(this.props.dateCustom, {}, this.updateDateCustomFromProps);
    }

    if (this.state.isInFocused && prevState.selected !== this.state.selected) {
      this.changeSelectedDateComponent(this.state.selected);
    }

    if (this.state.notify && !prevState.notify) {
      this.notify();
    }
  }

  public componentDidMount(): void {
    this.updateDateCustom(this.props.dateCustom, {}, this.updateDateCustomFromProps);
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
        onMouseUp={this.handleMouseUp}
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
    const { selected, isOnInputMode, isInFocused, isDragged } = this.state;
    const fragments =
      this.state.dateCustom && (isInFocused || !this.state.dateCustom.isEmpty())
        ? this.state.dateCustom.toFragments({
            withSeparator: true,
            withPad: true,
          })
        : [];
    return fragments.map(
      (fragment, index) =>
        fragment.type === DateCustomComponentType.Separator ? (
          <span
            key={index}
            className={classNames(styles.delimiter, fragments[index + 1].value !== null && styles.filled)}
          >
            {fragment.value}
          </span>
        ) : (
          <FragmentDateCustom
            key={index}
            {...fragment}
            onChange={this.onChangeDateComponentFromFragment}
            selected={isDragged ? null : selected}
            inputMode={isOnInputMode}
          />
        ),
    );
  };

  private handleMouseDown = () => {
    this.isMouseDown = true;
  };

  private handleMouseUp = () => {
    this.isMouseDown = false;
    this.setState({ selected: this.getFirstDateComponentType() });
  };

  private onChangeDateComponentFromFragment = (type: DateCustomComponentType) => (
    event: React.MouseEvent<HTMLElement>,
  ) => {
    this.isMouseDown = false;
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
    const index = this.state.typesOrder.indexOf(type);
    if (index > -1) {
      this.selectNodeContents(this.divInnerNode, index * 2, index * 2 + 1);
    }
  };
  private onDraAndDropStart = () => this.setState({ isDragged: true, selected: null });

  private onDraAndDropEnd = () => this.setState({ isDragged: false });

  private updateDateCustom = (
    _dateCustom?: DateCustom,
    state: Partial<DateInputState> = {},
    callback: (...any: any[]) => void = this.emitChange,
  ): void => {
    const dateCustom = (_dateCustom || this.props.dateCustom || this.state.dateCustom || new DateCustom()).clone();
    dateCustom.setOrder(this.locale.order).setSeparator(this.locale.separator);
    const typesOrder = dateCustom.toFragments().map(({ type }) => type);
    this.setState({ ...state, typesOrder, dateCustom } as DateInputState, callback);
  };

  private updateDateCustomFromProps = (): void => {
    if (this.state.dateCustom === null) {
      return;
    }
    let isMod: boolean = false;
    const dateCustom = this.state.dateCustom.clone();
    const start = dateCustom.getRangeStart();
    const min = start && start.toString({ withPad: true, withSeparator: true });
    const end = dateCustom.getRangeEnd();
    const max = end && end.toString({ withPad: true, withSeparator: true });
    const { order, separator } = this.locale;
    if (this.props.minDate !== min) {
      isMod = true;
      dateCustom.setRangeStart(
        this.props.minDate ? new DateCustom({ order, separator }).parseValue(this.props.minDate) : null,
      );
    }
    if (this.props.maxDate !== max) {
      isMod = true;
      dateCustom.setRangeEnd(
        this.props.maxDate ? new DateCustom({ order, separator }).parseValue(this.props.maxDate) : null,
      );
    }
    if (
      !this.props.value ||
      this.props.value !== dateCustom.toString({ withPad: true, withSeparator: !dateCustom.isEmpty() })
    ) {
      isMod = true;
      dateCustom.parseValue(this.props.value);
    }
    if (isMod) {
      this.setState({ dateCustom }, this.emitChange);
    }
  };

  private getIconSize = () => {
    // FIXME: вынести значения в пиксилях
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
        selected:
          prevState.selected === null && !this.isMouseDown ? this.getFirstDateComponentType() : prevState.selected,
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
      if (this.state.dateCustom !== null) {
        this.updateDateCustom(this.state.dateCustom.restore());
      }
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
    if (this.state.dateCustom === null) {
      return;
    }
    const value = this.state.dateCustom.get(this.state.selected);
    if (value !== null && value !== '') {
      if (this.state.isAutoMoved) {
        this.setState({ isAutoMoved: false });
      } else {
        this.moveSelection(1);
      }
    }
  };

  private handlePaste = (e?: React.ClipboardEvent<HTMLElement>, pasted?: string): void => {
    pasted = pasted || (e && e.clipboardData.getData('text').trim());
    if (pasted && this.state.dateCustom !== null) {
      this.updateDateCustom(
        this.state.dateCustom
          .parseValue(pasted)
          .restore()
          .cutOffExcess(),
      );
    }
  };

  private emitChange = (): void => {
    if (this.state.dateCustom === null) {
      return;
    }
    const value = this.state.dateCustom.toString({ withPad: true, withSeparator: true });
    if (this.props.value === value) {
      return;
    }
    if (this.props.onChange) {
      this.props.onChange({ target: { value } }, value, this.state.dateCustom.clone());
    }
  };

  private clearSelected(): void {
    if (this.state.dateCustom === null) {
      return;
    }
    const selected = this.state.selected === null ? this.getFirstDateComponentType() : this.state.selected;
    this.updateDateCustom(this.state.dateCustom.set(selected, null), { isOnInputMode: false, selected });
    if (selected === DateCustomComponentType.All) {
      this.selectDateComponent(this.getFirstDateComponentType());
    }
  }

  private clearOneChar(): void {
    const { selected, dateCustom, isOnInputMode } = this.state;
    if (dateCustom === null) {
      return;
    }
    const prevType = selected === null ? this.getLastDateComponentType() : selected;
    const nextType =
      prevType === DateCustomComponentType.All
        ? dateCustom
            .toFragments({ withSeparator: false })
            .reduce((_type, { value, type }) => (value !== null ? type : _type), this.getLastDateComponentType())
        : prevType;
    let prev = dateCustom.get(nextType);
    if (prev === null) {
      this.moveSelection(-1);
      return;
    }
    prev = String(isOnInputMode ? prev : DateCustomTransformer.padDateComponent(nextType, prev));
    const next = prev.replace(/.$/, '') || null;
    this.updateDateCustom(dateCustom.set(nextType, next), {
      isOnInputMode: next !== null,
      selected: nextType,
    });
  }

  private updateDateComponentBy(step: number) {
    const { dateCustom } = this.state;
    if (dateCustom === null) {
      return;
    }
    let { selected } = this.state;
    selected = selected === null ? this.getFirstDateComponentType() : selected;
    const clone = dateCustom.clone();
    const isValidRange = dateCustom.validate({ checks: [DateCustomValidateCheck.Range] });
    if (!isValidRange) {
      const start = dateCustom.getRangeStart();
      const end = dateCustom.getRangeEnd();
      if (start && DateCustomGetter.max([dateCustom, start]) === start) {
        dateCustom.setComponents(start.getComponentsRaw());
      } else if (end && DateCustomGetter.min([dateCustom, end]) === end) {
        dateCustom.setComponents(end.getComponentsRaw());
      }
    } else if (
      dateCustom
        .clone()
        .shift(selected, step, { isRange: false, isLoop: true })
        .validate({ checks: [DateCustomValidateCheck.Range] })
    ) {
      dateCustom.shift(selected, step, { isRange: false, isLoop: true });
    }
    this.updateDateCustom(dateCustom, {
      isOnInputMode: false,
      selected: selected === DateCustomComponentType.All ? this.getFirstDateComponentType() : selected,
      notify: clone.get(selected) === dateCustom.get(selected),
    });
  }

  private moveSelection(step: number, isAutoMoved: boolean = false): void {
    const { dateCustom, typesOrder, selected } = this.state;
    if (dateCustom === null) {
      return;
    }
    const index = selected === null ? 0 : typesOrder.indexOf(selected);
    if (
      (typesOrder[index] === this.getLastDateComponentType() && step > 0) ||
      (typesOrder[index] === this.getFirstDateComponentType() && step < 0)
    ) {
      return;
    }
    let nextIndex = index + step;
    if (selected === DateCustomComponentType.All) {
      nextIndex = step < 0 ? 0 : typesOrder.length - 1;
    }
    if (selected === DateCustomComponentType.Year && dateCustom.getYear() !== null) {
      dateCustom.restore(selected);
    }
    dateCustom.cutOffExcess();
    this.updateDateCustom(dateCustom);
    if (nextIndex >= 0 && nextIndex < typesOrder.length) {
      this.setState({
        selected: typesOrder[nextIndex],
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
    if (this.state.dateCustom === null) {
      return;
    }
    const dateCustom = this.state.dateCustom.clone();
    let prev = dateCustom.get(type);
    if (type === null) {
      type = this.getFirstDateComponentType();
      prev = null;
      dateCustom.set(type, null);
    }
    if (type === DateCustomComponentType.All) {
      type = this.getFirstDateComponentType();
      prev = null;
      dateCustom.set(DateCustomComponentType.All, null);
    }
    this.setState({ selected: type, dateCustom }, () => {
      inputNumber(type, prev, event.key, this.state.isOnInputMode, this.inputNumberCallBack);
    });
  }

  private inputNumberCallBack = (next: DateCustomComponent, inputMode: boolean): void => {
    let { selected: type } = this.state;
    if (this.state.dateCustom === null) {
      return;
    }
    const dateCustom = this.state.dateCustom.clone();
    if (type === null || type === DateCustomComponentType.All) {
      type = this.getFirstDateComponentType();
      inputMode = false;
      this.selectDateComponent(type);
    }
    dateCustom.set(type, next);
    if (!inputMode) {
      if (type !== DateCustomComponentType.Year) {
        dateCustom.cutOffExcess();
      }
      if (dateCustom.validate({ checks: [DateCustomValidateCheck.Limits], type })) {
        this.moveSelection(1, true);
      }
    }
    this.updateDateCustom(dateCustom, { isOnInputMode: inputMode });
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

  private getFirstDateComponentType = (): DateCustomComponentType => this.state.typesOrder[0];
  private getLastDateComponentType = (): DateCustomComponentType =>
    this.state.typesOrder[this.state.typesOrder.length - 1];

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
