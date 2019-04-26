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
DatePicker.validate(): boolean
```

```jsx
const { MAX_DATE, MAX_MONTH, MAX_YEAR, MIN_DATE, MIN_MONTH, MIN_YEAR } = require('../../lib/date/constants');
const { InternalDateValidateCheck } = require('../../lib/date/types');
const { InternalDate } = require('../../lib/date/InternalDate');
const { ViewDateInputValidateChecks } = require('./ViewDateInputValidateChecks');

class DateInputValidations extends React.Component {
  constructor() {
    this.state = {
      value: '15.06.2005',
      minDate: '23.09.2000',
      maxDate: '03.03.2010',
      isValid: true,
    };
  }

  render() {
    return (
      <Gapped gap={10} vertical>
        <ViewDateInputValidateChecks
          value={this.state.value}
          minDate={this.state.minDate}
          maxDate={this.state.maxDate}
        />
        <pre>
          minDate = {this.state.minDate}
          <br />
          maxDate = {this.state.maxDate}
        </pre>
        <DateInput
          value={this.state.value}
          error={!this.state.isValid}
          minDate={this.state.minDate}
          maxDate={this.state.maxDate}
          onChange={(x, value) => this.setState({ value }, this.validate)}
        />
      </Gapped>
    );
  }

  validate() {
    this.setState({
      isValid: DatePicker.validate(this.state.value, {
        minDate: this.state.minDate,
        maxDate: this.state.maxDate,
      }),
    });
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
      langCode: LangCodes.ru_RU,
      value: '21.12.2012',
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
          <DateInput onChange={(a, value) => this.setState({ value })} value={this.state.value} />
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
      value: '21.12.2012',
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
          <DateInput onChange={(a, value) => this.setState({ value })} value={this.state.value} />
        </LocaleProvider>
      </Gapped>
    );
  }
}

<DateInputFormatting />;
```
