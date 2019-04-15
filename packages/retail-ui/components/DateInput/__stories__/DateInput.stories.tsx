import { storiesOf } from '@storybook/react';
import React from 'react';
import { DateCustomOrder, DateCustomSeparator } from '../../../lib/date/types';
import LocaleProvider from '../../LocaleProvider';
import DateInput from '../DateInput';
import { action } from '@storybook/addon-actions';

storiesOf('DateInput', module)
  .add('simple', () => <DateInput value="01.02.2017" />)
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
          onFocus={(e) => action('focus 1')(e.nativeEvent)}
          onBlur={(e) => action('blur 1')(e.nativeEvent)}
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
          onFocus={(e) => action('focus 2')(e.nativeEvent)}
          onBlur={(e) => action('blur 2')(e.nativeEvent)}
        />
      </LocaleProvider>
    </div>
  ));
