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
internalDate.validate(): boolean
```

```jsx
const { MAX_DATE, MAX_MONTH, MAX_YEAR, MIN_DATE, MIN_MONTH, MIN_YEAR } = require('../../lib/date/constants');
const { InternalDateValidateCheck } = require('../../lib/date/types');
const { InternalDate } = require('../../lib/date/InternalDate');

class DateInputValidations extends React.Component {
  constructor() {
    this.state = {
      value: '15.06.2005',
      minDate: '23.09.2000',
      maxDate: '03.03.2010',
      internalDate: new InternalDate(),
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
          onChange={(x, value, internalDate) => this.setState({ value, internalDate }, this.validate)}
        />
      </Gapped>
    );
  }

  validate() {
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

<DateInputValidations />;
```

### Форматирование даты при смене локали

```jsx
const { default: LocaleProvider, LangCodes } = require('../LocaleProvider');
const { InternalDate } = require('../../lib/date/InternalDate');

class DateInputFormatting2 extends React.Component {
  constructor() {
    this.state = {
      langCode: LangCodes.en_EN,
      internalDate: new InternalDate({langCode: LangCodes.en_EN}).setComponents({ year: 2012, month: 12, date: 30 }),
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
            onChange={(a, b, internalDate) =>
              this.setState({
                internalDate,
              })
            }
            value={this.state.internalDate.toString({
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
const { InternalDateOrder, InternalDateSeparator } = require('../../lib/date/types');
const { InternalDate } = require('../../lib/date/InternalDate');
const { default: LocaleProvider } = require('../LocaleProvider');

class DateInputFormatting extends React.Component {
  constructor() {
    this.state = {
      order: InternalDateOrder.YMD,
      separator: 'Dot',
      internalDate: new InternalDate().parseValue('23.12.2012'),
    };
  }

  render() {
    return (
      <Gapped vertical gap={10}>
        <div>
          <span style={{ width: '300px', display: 'inline-block' }}>
            Порядок компонентов (<tt>InternalDateOrder</tt>)
          </span>
          <Select
            value={this.state.order}
            items={Object.keys(InternalDateOrder)}
            onChange={(_, order) => this.setState({ order })}
          />
        </div>
        <div>
          <span style={{ width: '300px', display: 'inline-block' }}>
            Разделитель (<tt>InternalDateSeparator</tt>)
          </span>
          <Select
            value={this.state.separator}
            items={Object.keys(InternalDateSeparator)}
            onChange={(_, separator) => this.setState({ separator })}
          />
        </div>
        <LocaleProvider
          locale={{
            DatePicker: {
              separator: InternalDateSeparator[this.state.separator],
              order: this.state.order,
            },
          }}
        >
          <DateInput
            onChange={(a, b, internalDate) => this.setState({ internalDate })}
            value={this.state.internalDate.toString({
              withSeparator: true,
              withPad: true,
              order: this.state.order,
              separator: InternalDateSeparator[this.state.separator],
            })}
          />
        </LocaleProvider>
      </Gapped>
    );
  }
}

<DateInputFormatting />;
```
