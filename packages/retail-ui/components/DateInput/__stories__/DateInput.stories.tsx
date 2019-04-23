import { action } from '@storybook/addon-actions';
import { storiesOf } from '@storybook/react';
import React from 'react';
import { MAX_DATE, MAX_MONTH, MAX_YEAR, MIN_DATE, MIN_MONTH, MIN_YEAR } from '../../../lib/date/constants';
import { DateCustom } from '../../../lib/date/DateCustom';
import { DateCustomOrder, DateCustomSeparator, DateCustomValidateCheck } from '../../../lib/date/types';
import Button from '../../Button';
import Checkbox from '../../Checkbox';
import DatePicker from '../../DatePicker';
import Gapped from '../../Gapped';
import LocaleProvider, { LangCodes } from '../../LocaleProvider';
import Select from '../../Select';
import DateInput from '../DateInput';

class DateInputValidations extends React.Component<any, any> {
  public state = {
    value: '15.06.2005',
    dateCustom: new DateCustom(),
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
          onChange={(x, value, dateCustom) => this.setState({ value, dateCustom }, this.validate)}
        />
      </Gapped>
    );
  }

  private validate(): void {
    const { dateCustom } = this.state;
    if (dateCustom === null) {
      return;
    }
    this.setState({ isValidNotNull: dateCustom.validate({ checks: [DateCustomValidateCheck.NotNull] }) });
    this.setState({ isValidLimits: dateCustom.validate({ checks: [DateCustomValidateCheck.Limits] }) });
    this.setState({ isValidNative: dateCustom.validate({ checks: [DateCustomValidateCheck.Native] }) });
    this.setState({ isValidRange: dateCustom.validate({ checks: [DateCustomValidateCheck.Range] }) });
    this.setState({ isValid: dateCustom.validate() });
  }
}

class DateInputFormatting extends React.Component<any, any> {
  public state = {
    order: DateCustomOrder.YMD,
    separator: 'Dot',
    value: '2012.12.30',
    dateCustom: new DateCustom(DateCustomOrder.YMD, DateCustomSeparator.Dot).setComponents({
      year: 2012,
      month: 12,
      date: 30,
    }),
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
            items={Object.keys(DateCustomOrder)}
            onChange={(_, order) => this.setState({ order })}
          />
        </div>
        <div>
          <span style={{ width: '300px', display: 'inline-block' }}>
            Разделитель <tt>DateCustomSeparator</tt>
          </span>
          <Select
            value={this.state.separator}
            items={Object.keys(DateCustomSeparator)}
            onChange={(_, separator) => this.setState({ separator })}
          />
        </div>
        <LocaleProvider
          locale={{ DatePicker: { separator: DateCustomSeparator[this.state.separator], order: this.state.order } }}
        >
          <DateInput
            onChange={(a, value, dateCustom) =>
              this.setState({
                dateCustom,
                value,
              })
            }
            value={this.state.dateCustom.toString({
              withSeparator: true,
              withPad: true,
              order: this.state.order,
              separator: DateCustomSeparator[this.state.separator],
            })}
          />
          <br/>
          <br/>
          <DatePicker
            onChange={(a, value, dateCustom) =>
              this.setState({
                dateCustom,
                value,
              })
            }
            value={this.state.dateCustom.toString({
              withSeparator: true,
              withPad: true,
              order: this.state.order,
              separator: DateCustomSeparator[this.state.separator],
            })}
            enableTodayLink
          />
        </LocaleProvider>
      </Gapped>
    );
  }
}

class DateInputFormatting2 extends React.Component<any, any> {
  public state = {
    langCode: LangCodes.en_EN,
    dateCustom: new DateCustom().setComponents({ year: 2012, month: 12, date: 30 }),
  };

  public render() {
    return (
      <Gapped vertical gap={10}>
        <div>
          <span style={{ width: '300px', display: 'inline-block' }}>
            Локаль (<tt>LangCodes</tt>)
          </span>
          <Select
            value={this.state.langCode}
            placeholder="Выбрать язык"
            items={Object.values(LangCodes)}
            onChange={(_, langCode) => this.setState({ langCode })}
          />
        </div>
        <LocaleProvider langCode={this.state.langCode}>
          <DateInput
            onChange={(a, b, dateCustom) =>
              this.setState({
                dateCustom,
              })
            }
            value={this.state.dateCustom.toString({
              withSeparator: true,
              withPad: true,
            })}
          />
        </LocaleProvider>
      </Gapped>
    );
  }
}

storiesOf('DateInput', module)
  .add('simple', () => <DateInput value="01.02.2017" />)
  .add('validations', () => <DateInputValidations />)
  .add('formatting', () => <DateInputFormatting />)
  .add('formatting 2', () => <DateInputFormatting2 />)
  .add('disabled', () => <DateInput disabled value="01.02.2017" />)
  .add('with width', () => <DateInput width="50px" value="01.02.2017" />)
  .add('YMD - Slash', () => (
    <div>
      <LocaleProvider
        locale={{
          DatePicker: {
            order: DateCustomOrder.YMD,
            separator: DateCustomSeparator.Slash,
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
            order: DateCustomOrder.DMY,
            separator: DateCustomSeparator.Dash,
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
