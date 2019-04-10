import * as PropTypes from 'prop-types';
import * as React from 'react';
import { findDOMNode } from 'react-dom';
import { DateCustom } from '../../lib/date/DateCustom';
import {
  DateCustomComponentsNumber,
  DateCustomOrder,
  DateCustomSeparator,
  DateCustomValidateCheck,
} from '../../lib/date/types';
import { Nullable } from '../../typings/utility-types';
import { CalendarDateShape } from '../Calendar';
import DateInput from '../DateInput';
import DropdownContainer from '../DropdownContainer/DropdownContainer';
import filterProps from '../filterProps';
import { locale } from '../LocaleProvider/decorators';

import styles from './DatePicker.less';

import { formatDate } from './DatePickerHelpers';
import { DatePickerLocale, DatePickerLocaleHelper } from './locale';
import Picker from './Picker';

const INPUT_PASS_PROPS = {
  autoFocus: true,
  disabled: true,
  warning: true,
  error: true,
  size: true,
  onKeyDown: true,
};

export interface DatePickerProps<T> {
  autoFocus?: boolean;
  disabled?: boolean;
  enableTodayLink?: boolean;
  error?: boolean;
  minDate: T;
  maxDate: T;
  menuAlign?: 'left' | 'right';
  size?: 'small' | 'medium' | 'large';
  value?: T | null;
  warning?: boolean;
  width: number | string;
  onBlur?: () => void;
  onChange: (e: { target: { value: T } }, v: T) => void;
  onFocus?: () => void;
  onKeyDown?: (e: React.KeyboardEvent<any>) => void;
  onMouseEnter?: (e: React.MouseEvent<any>) => void;
  onMouseLeave?: (e: React.MouseEvent<any>) => void;
  onMouseOver?: (e: React.MouseEvent<any>) => void;

  /**
   * Функция для определения праздничных дней
   * @default (_day, isWeekend) => isWeekend
   * @param {T} day - строка в формате `dd.mm.yyyy`
   * @param {boolean} isWeekend - флаг выходного (суббота или воскресенье)
   * @returns {boolean} `true` для выходного или `false` для рабочего дня
   */
  isHoliday: (day: T, isWeekend: boolean) => boolean;
  dateComponentsOrder?: DateCustomOrder;
  dateComponentsSeparator?: DateCustomSeparator;
}

export interface DatePickerState {
  opened: boolean;
}

type DatePickerValue = string;

// eslint-disable-next-line flowtype/no-weak-types
@locale('DatePicker', DatePickerLocaleHelper)
class DatePicker extends React.Component<DatePickerProps<DatePickerValue>, DatePickerState> {
  public static propTypes = {
    autoFocus: PropTypes.bool,

    disabled: PropTypes.bool,

    /**
     * Включает кнопку сегодня в календаре
     */
    enableTodayLink: PropTypes.bool,

    error: PropTypes.bool,

    /**
     * Максимальная дата в календаре.
     */
    maxDate: PropTypes.string.isRequired,

    menuAlign: PropTypes.oneOf(['left', 'right'] as Array<'left' | 'right'>),

    /**
     * Минимальная дата в календаре.
     */
    minDate: PropTypes.string.isRequired,

    /**
     * Строка формата `dd.mm.yyyy`
     */
    value: PropTypes.string,

    warning: PropTypes.bool,

    width: PropTypes.oneOfType([PropTypes.number, PropTypes.string]).isRequired,

    onBlur: PropTypes.func,

    onChange: PropTypes.func.isRequired,

    onFocus: PropTypes.func,

    onKeyDown: PropTypes.func,

    onMouseEnter: PropTypes.func,

    onMouseLeave: PropTypes.func,

    onMouseOver: PropTypes.func,

    isHoliday: PropTypes.func.isRequired,
  };

  public static defaultProps = {
    width: 120,
    minDate: '01.01.1900',
    maxDate: '31.12.2099',
    isHoliday: (_day: DatePickerValue, isWeekend: boolean) => isWeekend,
  };

  public state: DatePickerState = {
    opened: false,
  };

  private input: DateInput | null = null;

  private focused: boolean = false;

  private readonly dateCustom: DateCustom = new DateCustom();
  private minDate: DateCustomComponentsNumber | undefined;
  private maxDate: DateCustomComponentsNumber | undefined;
  private locale!: DatePickerLocale;

  public componentWillReceiveProps(nextProps: DatePickerProps<DatePickerValue>) {
    const { disabled } = nextProps;
    const { opened } = this.state;
    if (disabled && opened) {
      this.close();
    }
    this.dateCustom
      .setOrder(this.locale.order)
      .setSeparator(this.locale.separator)
      .parseValue(this.props.value);
    this.minDate = this.parseValueToDate(this.props.minDate);
    this.maxDate = this.parseValueToDate(this.props.maxDate);
  }

  public validate = (value: Nullable<string>) => {
    if (!value) {
      return false;
    }
    return new DateCustom(this.locale.order, this.locale.separator).parseValue(value).validate();
    // return this.parseValueToDate(value) !== undefined;
  };

  public componentDidMount() {
    this.dateCustom
      .setOrder(this.locale.order)
      .setSeparator(this.locale.separator)
      .parseValue(this.props.value);
    this.minDate = this.parseValueToDate(this.props.minDate);
    this.maxDate = this.parseValueToDate(this.props.maxDate);
  }

  /**
   * @public
   */
  public blur() {
    if (this.input) {
      this.input.blur();
    }
    this.handleBlur();
  }

  /**
   * @public
   */
  public focus() {
    if (this.props.disabled) {
      return;
    }
    if (this.input) {
      this.input.focus();
    }
    this.handleFocus();
  }

  /**
   * Закрывает выпадашку выбора дня
   * @public
   */
  public close() {
    this.setState({ opened: false });
  }

  public render(): JSX.Element {
    let picker = null;
    const date = this.dateCustom.validate({ levels: [DateCustomValidateCheck.NotNull, DateCustomValidateCheck.Native] })
      ? this.dateCustom
          .clone()
          .shiftMonth(-1, { isLoop: false })
          .getComponentsLikeNumber()
      : null;
    // console.log('date :', date);
    if (this.state.opened) {
      picker = (
        <DropdownContainer
          // tslint:disable-next-line:jsx-no-lambda
          getParent={() => findDOMNode(this)}
          offsetY={2}
          align={this.props.menuAlign}
        >
          <Picker
            value={date}
            minDate={this.minDate}
            maxDate={this.maxDate}
            onPick={this.handlePick}
            onSelect={this.handleSelect}
            enableTodayLink={this.props.enableTodayLink}
            isHoliday={this.isHoliday}
          />
        </DropdownContainer>
      );
    }

    return (
      <label
        className={styles.root}
        style={{ width: this.props.width }}
        onMouseEnter={this.props.onMouseEnter}
        onMouseLeave={this.props.onMouseLeave}
        onMouseOver={this.props.onMouseOver}
      >
        <DateInput
          {...filterProps(this.props, INPUT_PASS_PROPS)}
          ref={this.getInputRef}
          value={this.props.value || ''}
          width="100%"
          withIcon
          minDate={this.props.minDate}
          maxDate={this.props.maxDate}
          onBlur={this.handleBlur}
          onFocus={this.handleFocus}
          onChange={this.props.onChange}
        />
        {picker}
      </label>
    );
  }

  private getInputRef = (ref: DateInput | null) => {
    this.input = ref;
  };

  private parseValueToDate(value?: string): DateCustomComponentsNumber | undefined {
    if (value === undefined) {
      return undefined;
    }
    const date = new DateCustom(this.locale.order, this.locale.separator).parseValue(value);
    if (date.validate({ levels: [DateCustomValidateCheck.NotNull, DateCustomValidateCheck.Native] })) {
      return date/*.shiftMonth(-1)*/.getComponentsLikeNumber();
    }
    return undefined;
  }

  private handleFocus = () => {
    if (this.focused) {
      return;
    }

    this.focused = true;

    this.setState({ opened: true });

    if (this.props.onFocus) {
      this.props.onFocus();
    }
  };

  private handleBlur = () => {
    if (!this.focused) {
      return;
    }

    this.focused = false;
    this.close();

    if (this.props.onBlur) {
      this.props.onBlur();
    }
  };

  private handlePick = (dateShape: CalendarDateShape) => {
    this.handleSelect(dateShape);
    this.blur();
  };

  private handleSelect = (dateShape: CalendarDateShape) => {
    this.dateCustom.setComponents(dateShape).shiftMonth(1);
    const date = this.dateCustom.toString();
    if (this.props.onChange) {
      this.props.onChange({ target: { value: date } }, date);
    }
  };

  private isHoliday = ({ date, month, year, isWeekend }: CalendarDateShape & { isWeekend: boolean }) => {
    const dateString = formatDate({ date, month, year });
    return this.props.isHoliday(dateString, isWeekend);
  };
}

export default DatePicker;
