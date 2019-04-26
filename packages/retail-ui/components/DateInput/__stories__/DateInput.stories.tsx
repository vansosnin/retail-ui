import { action } from '@storybook/addon-actions';
import { storiesOf } from '@storybook/react';
import React from 'react';
import { MAX_DATE, MAX_MONTH, MAX_YEAR, MIN_DATE, MIN_MONTH, MIN_YEAR } from '../../../lib/date/constants';
import { InternalDate } from '../../../lib/date/InternalDate';
import { InternalDateOrder, InternalDateSeparator, InternalDateValidateCheck } from '../../../lib/date/types';
import Button from '../../Button';
import Checkbox from '../../Checkbox';
import DatePicker from '../../DatePicker';
import Gapped from '../../Gapped';
import LocaleProvider from '../../LocaleProvider';
import Select from '../../Select';
import DateInput from '../DateInput';

class DateInputValidations extends React.Component<any, any> {
  public state = {
    value: '15.06.2005',
    internalDate: new InternalDate(),
    isValidNotNull: true,
    isValidLimits: true,
    isValidNative: true,
    isValidRange: true,
    isValid: true,
  };

  public render() {
    return (
      <Gapped gap={10} vertical>
        <h3>Все проверки</h3>
        <Checkbox disabled checked={this.state.isValidNotNull}>
          <tt>DateCustomValidateCheck.NotNull</tt>
          <div>
            Все компоненты даты заполнены (не равны{' '}
            <b>
              <tt>null</tt>
            </b>
            )
          </div>
        </Checkbox>
        <Checkbox disabled checked={this.state.isValidLimits}>
          <tt>DateCustomValidateCheck.Limits</tt>
          <div>
            Компоненты даты не выходят за рамки предустановленных лимитов
            <br />
            Год: {MIN_YEAR} - {MAX_YEAR}
            <br />
            Месяц: {MIN_MONTH} - {MAX_MONTH}
            <br />
            Число: {MIN_DATE} - {MAX_DATE}
          </div>
        </Checkbox>
        <Checkbox disabled checked={this.state.isValidNative}>
          <tt>DateCustomValidateCheck.Native</tt>
          <div>Из компонентов даты можно создать валидный экземпляр нативного объекта Date()</div>
        </Checkbox>
        <Checkbox disabled checked={this.state.isValidRange}>
          <tt>DateCustomValidateCheck.Range</tt>
          <div>
            Дата не выходит за пределы диапазонов <tt>minDate/maxDate</tt>
          </div>
        </Checkbox>
        <div>
          <pre>
            minDate="23.09.2000"
            <br />
            maxDate="03.03.2010"
          </pre>
        </div>
        <DateInput
          value={this.state.value}
          error={!this.state.isValid}
          minDate="23.09.2000"
          maxDate="03.03.2010"
          onChange={(x, value, internalDate) => this.setState({ value, internalDate }, this.validate)}
        />
      </Gapped>
    );
  }

  private validate(): void {
    const { internalDate } = this.state;
    if (internalDate === null) {
      return;
    }
    this.setState({ isValidNotNull: internalDate.validate({ checks: [InternalDateValidateCheck.NotNull] }) });
    this.setState({ isValidLimits: internalDate.validate({ checks: [InternalDateValidateCheck.Limits] }) });
    this.setState({ isValidNative: internalDate.validate({ checks: [InternalDateValidateCheck.Native] }) });
    this.setState({ isValidRange: internalDate.validate({ checks: [InternalDateValidateCheck.Range] }) });
    this.setState({ isValid: internalDate.validate() });
  }
}

class DateInputFormatting extends React.Component<any, any> {
  public state = {
    order: InternalDateOrder.YMD,
    separator: 'Dot',
    value: '2012.12.30',
  };

  public render() {
    return (
      <Gapped vertical gap={10}>
        <div>
          <span style={{ width: '300px', display: 'inline-block' }}>
            Порядок компонентов <tt>DateCustomOrder</tt>
          </span>
          <Select
            value={this.state.order}
            items={Object.keys(InternalDateOrder)}
            onChange={(_, order) => this.setState({ order })}
          />
        </div>
        <div>
          <span style={{ width: '300px', display: 'inline-block' }}>
            Разделитель <tt>DateCustomSeparator</tt>
          </span>
          <Select
            value={this.state.separator}
            items={Object.keys(InternalDateSeparator)}
            onChange={(_, separator) => this.setState({ separator })}
          />
        </div>
        <LocaleProvider
          locale={{ DatePicker: { separator: InternalDateSeparator[this.state.separator], order: this.state.order } }}
        >
          <DateInput
            onChange={(a, value) => {
              action('DateInput.onChange')(value);
              console.log('DateInput.onChange', value);
              this.setState({
                value,
              })
            }}
            value={this.state.value}
          />
          <br/>
          <br/>
        </LocaleProvider>
      </Gapped>
    );
  }
}

class DateInputDifferentFormatting extends React.Component<any, any> {
  public render() {
    const value = "21.12.2012";
    return (
      <table>
        <thead>
        <tr>
          <td> </td>
          <td>YMD</td>
          <td>MDY</td>
          <td>DMY</td>
        </tr>
        </thead>
        <tbody>
        <tr>
          <td>Dot</td>
          <td>
            <LocaleProvider
              locale={{ DatePicker: { separator: InternalDateSeparator.Dot, order: InternalDateOrder.YMD } }}
            >
              <DateInput value={value} />
            </LocaleProvider>
          </td>
          <td>
            <LocaleProvider
              locale={{ DatePicker: { separator: InternalDateSeparator.Dot, order: InternalDateOrder.MDY } }}
            >
              <DateInput value={value} />
            </LocaleProvider>
          </td>
          <td>
            <LocaleProvider
              locale={{ DatePicker: { separator: InternalDateSeparator.Dot, order: InternalDateOrder.DMY } }}
            >
              <DateInput value={value} />
            </LocaleProvider>
          </td>
        </tr>
        <tr>
          <td>Dash</td>
          <td>
            <LocaleProvider
              locale={{ DatePicker: { separator: InternalDateSeparator.Dash, order: InternalDateOrder.YMD } }}
            >
              <DateInput value={value} />
            </LocaleProvider>
          </td>
          <td>
            <LocaleProvider
              locale={{ DatePicker: { separator: InternalDateSeparator.Dash, order: InternalDateOrder.MDY } }}
            >
              <DateInput value={value} />
            </LocaleProvider>
          </td>
          <td>
            <LocaleProvider
              locale={{ DatePicker: { separator: InternalDateSeparator.Dash, order: InternalDateOrder.DMY } }}
            >
              <DateInput value={value} />
            </LocaleProvider>
          </td>
        </tr>
        <tr>
          <td>Slash</td>
          <td>
            <LocaleProvider
              locale={{ DatePicker: { separator: InternalDateSeparator.Slash, order: InternalDateOrder.YMD } }}
            >
              <DateInput value={value} />
            </LocaleProvider>
          </td>
          <td>
            <LocaleProvider
              locale={{ DatePicker: { separator: InternalDateSeparator.Slash, order: InternalDateOrder.MDY } }}
            >
              <DateInput value={value} />
            </LocaleProvider>
          </td>
          <td>
            <LocaleProvider
              locale={{ DatePicker: { separator: InternalDateSeparator.Slash, order: InternalDateOrder.DMY } }}
            >
              <DateInput value={value} />
            </LocaleProvider>
          </td>
        </tr>
        <tr>
          <td>Space</td>
          <td>
            <LocaleProvider
              locale={{ DatePicker: { separator: InternalDateSeparator.Space, order: InternalDateOrder.YMD } }}
            >
              <DateInput value={value} />
            </LocaleProvider>
          </td>
          <td>
            <LocaleProvider
              locale={{ DatePicker: { separator: InternalDateSeparator.Space, order: InternalDateOrder.MDY } }}
            >
              <DateInput value={value} />
            </LocaleProvider>
          </td>
          <td>
            <LocaleProvider
              locale={{ DatePicker: { separator: InternalDateSeparator.Space, order: InternalDateOrder.DMY } }}
            >
              <DateInput value={value} />
            </LocaleProvider>
          </td>
        </tr>
        </tbody>
      </table>
    );
  }
}

storiesOf('DateInput', module)
  .add('simple', () => <DateInput value="01.02.2017" />)
  .add('validations', () => <DateInputValidations />)
  .add('formatting', () => <DateInputFormatting />)
  .add('different formatting', () => <DateInputDifferentFormatting />)
  .add('disabled', () => <DateInput disabled value="01.02.2017" />)
  .add('with width', () => <DateInput width="50px" value="01.02.2017" />)
  .add('YMD - Slash', () => (
    <div>
      <LocaleProvider
        locale={{
          DatePicker: {
            order: InternalDateOrder.YMD,
            separator: InternalDateSeparator.Slash,
          },
        }}
      >
        YMD - Slash
        <DateInput
          value="2006.10.21"
          maxDate="2008.10.21"
          minDate="2004.08.15"
          onFocus={e => action('focus 1')(e.nativeEvent)}
          onBlur={e => action('blur 1')(e.nativeEvent)}
        />
      </LocaleProvider>
      <br />
      MDY - Dash
      <LocaleProvider
        locale={{
          DatePicker: {
            order: InternalDateOrder.DMY,
            separator: InternalDateSeparator.Dash,
          },
        }}
      >
        <DateInput
          value=""
          maxDate="10.03.2012"
          minDate="15.08.2009"
          onFocus={e => action('focus 2')(e.nativeEvent)}
          onBlur={e => action('blur 2')(e.nativeEvent)}
        />
      </LocaleProvider>
      <br />
      <Button>123</Button>
    </div>
  ));
