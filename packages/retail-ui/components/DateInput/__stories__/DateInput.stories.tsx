import { action } from '@storybook/addon-actions';
import { storiesOf } from '@storybook/react';
import React from 'react';
import { InternalDateOrder, InternalDateSeparator } from '../../../lib/date/types';
import Button from '../../Button';
import Gapped from '../../Gapped';
import LocaleProvider from '../../LocaleProvider';
import Select from '../../Select';
import DateInput from '../DateInput';

class DateInputFormatting extends React.Component<any, any> {
  public state = {
    order: InternalDateOrder.YMD,
    separator: 'Dot',
    value: '2012.12.30',
  };

  public handleChangeOrder = (fakeEvent: any, order: any) => this.setState({ order });
  public handleChangeSeparator = (fakeEvent: any, separator: any) => this.setState({ separator });
  public handleChangeValue = (fakeEvent: any, value: any) => this.setState({ value });

  public render() {
    return (
      <Gapped vertical gap={10}>
        <div>
          <span style={{ width: '300px', display: 'inline-block' }}>
            Порядок компонентов <code>DateCustomOrder</code>
          </span>
          <Select value={this.state.order} items={Object.keys(InternalDateOrder)} onChange={this.handleChangeOrder} />
        </div>
        <div>
          <span style={{ width: '300px', display: 'inline-block' }}>
            Разделитель <code>DateCustomSeparator</code>
          </span>
          <Select
            value={this.state.separator}
            items={Object.keys(InternalDateSeparator)}
            onChange={this.handleChangeSeparator}
          />
        </div>
        <LocaleProvider
          locale={{
            DatePicker: {
              separator: InternalDateSeparator[this.state.separator as any] as InternalDateSeparator,
              order: this.state.order,
            },
          }}
        >
          <DateInput onChange={this.handleChangeValue} value={this.state.value} />
          <br />
          <br />
        </LocaleProvider>
      </Gapped>
    );
  }
}

class DateInputDifferentFormatting extends React.Component<any, any> {
  public render() {
    const value = '21.12.2012';
    return (
      <table>
        <thead>
          <tr>
            <td>{' '}</td>
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
          onFocus={action('focus 1')}
          onBlur={action('blur 1')}
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
          onFocus={action('blur 1')}
          onBlur={action('blur 2')}
        />
      </LocaleProvider>
      <br />
      <Button>Button</Button>
    </div>
  ));
