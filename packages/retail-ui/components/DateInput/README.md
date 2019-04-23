```jsx
<DateInput value="27.04.1992" />
```

```jsx
<DateInput value={state.value} onChange={(_, v) => setState({ value: v })} />
```

```jsx
<DateInput disabled value="27.04.1992" />
```

### Валидация даты

```typescript jsx
dateCustom.validate(): boolean
```

```jsx
const { MAX_DATE, MAX_MONTH, MAX_YEAR, MIN_DATE, MIN_MONTH, MIN_YEAR } = require('../../lib/date/constants');
const { DateCustomValidateCheck } = require('../../lib/date/types');
const { DateCustom } = require('../../lib/date/DateCustom');

class DateInputValidations extends React.Component {
  constructor() {
    this.state = {
      value: '15.06.2005',
      minDate: '23.09.2000',
      maxDate: '03.03.2010',
      dateCustom: new DateCustom(),
      isValidNotNull: true,
      isValidLimits: true,
      isValidNative: true,
      isValidRange: true,
      isValid: true,
    };
  }

  render() {
    return (
      <Gapped gap={10} vertical>
        <h3>Внутренние проверки</h3>
        <Checkbox disabled checked={this.state.isValidNotNull}>
          🡓 <tt style={{ color: 'black' }}>NotNull</tt>
          <div>
            Все компоненты даты заполнены (не равны{' '}
            <b>
              <tt>null</tt>
            </b>
            )
          </div>
        </Checkbox>
        <Checkbox disabled checked={this.state.isValidLimits}>
          🡓 <tt style={{ color: 'black' }}>Limits</tt>
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
          🡓 <tt style={{ color: 'black' }}>Native</tt>
          <div>
            Из компонентов даты можно создать валидный экземпляр нативного объекта <tt>Date()</tt>
          </div>
        </Checkbox>
        <Checkbox disabled checked={this.state.isValidRange}>
          ⭳ <tt style={{ color: 'black' }}>Range</tt>
          <div>
            Дата не выходит за пределы диапазонов <tt>minDate/maxDate</tt>
          </div>
        </Checkbox>
        <div>
          <pre>
            minDate = {this.state.minDate}
            <br />
            maxDate = {this.state.maxDate}
          </pre>
        </div>
        <DateInput
          value={this.state.value}
          error={!this.state.isValid}
          minDate={this.state.minDate}
          maxDate={this.state.maxDate}
          onChange={(x, value, dateCustom) => this.setState({ value, dateCustom }, this.validate)}
        />
      </Gapped>
    );
  }

  validate() {
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

<DateInputValidations />;
```

### Форматирование даты при смене локали

```jsx
const { default: LocaleProvider, LangCodes } = require('../LocaleProvider');
const { DateCustom } = require('../../lib/date/DateCustom');

class DateInputFormatting2 extends React.Component {
  constructor() {
    this.state = {
      langCode: LangCodes.en_EN,
      dateCustom: new DateCustom().setComponents({ year: 2012, month: 12, date: 30 }),
    };
  }

  render() {
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

<DateInputFormatting2 />;
```

### Ручное форматирование даты

```jsx
const { DateCustomOrder, DateCustomSeparator } = require('../../lib/date/types');
const { DateCustom } = require('../../lib/date/DateCustom');
const { default: LocaleProvider } = require('../LocaleProvider');

class DateInputFormatting extends React.Component {
  constructor() {
    this.state = {
      order: DateCustomOrder.YMD,
      separator: 'Dot',
      dateCustom: new DateCustom().parseValue('23.12.2012'),
    };
  }

  render() {
    return (
      <Gapped vertical gap={10}>
        <div>
          <span style={{ width: '300px', display: 'inline-block' }}>
            Порядок компонентов (<tt>DateCustomOrder</tt>)
          </span>
          <Select
            value={this.state.order}
            items={Object.keys(DateCustomOrder)}
            onChange={(_, order) => this.setState({ order })}
          />
        </div>
        <div>
          <span style={{ width: '300px', display: 'inline-block' }}>
            Разделитель (<tt>DateCustomSeparator</tt>)
          </span>
          <Select
            value={this.state.separator}
            items={Object.keys(DateCustomSeparator)}
            onChange={(_, separator) => this.setState({ separator })}
          />
        </div>
        <LocaleProvider
          locale={{
            DatePicker: {
              separator: DateCustomSeparator[this.state.separator],
              order: this.state.order,
            },
          }}
        >
          <DateInput
            onChange={(a, b, dateCustom) => this.setState({ dateCustom })}
            value={this.state.dateCustom.toString({
              withSeparator: true,
              withPad: true,
              order: this.state.order,
              separator: DateCustomSeparator[this.state.separator],
            })}
          />
        </LocaleProvider>
      </Gapped>
    );
  }
}

<DateInputFormatting />;
```
