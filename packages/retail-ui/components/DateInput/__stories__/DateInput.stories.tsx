import { storiesOf } from '@storybook/react';
import React from 'react';
import { DateCustomOrder, DateCustomSeparator } from '../../../lib/date/types';
import LocaleProvider from '../../LocaleProvider';
import DateInput from '../DateInput';

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
          // maxDate="2008.10.21"
          minDate="2004.08.15"
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
          // maxDate="10.03.2012"
          // minDate="15.08.2009"
        />
      </LocaleProvider>
    </div>
  ));
