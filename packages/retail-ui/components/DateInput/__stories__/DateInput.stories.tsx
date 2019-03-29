import { storiesOf } from '@storybook/react';
import React from 'react';
import { DateComponentsOrder, DateComponentsSeparator } from '../../../lib/date/types';
import DateInput from '../DateInput';

storiesOf('DateInput', module)
  .add('simple', () => <DateInput value="01.02.2017" />)
  .add('disabled', () => <DateInput disabled value="01.02.2017" />)
  .add('with width', () => <DateInput width="50px" value="01.02.2017" />)
  .add('YMD - Slash', () => (
    <div>
      YMD - Slash
      <DateInput
        value="2012.10.21"
        minDate="2009.08.15"
        dateComponentsOrder={DateComponentsOrder.YMD}
        dateComponentsSeparator={DateComponentsSeparator.Slash}
      />
      <br/>
      MDY - Dash
      <DateInput
        value="21.12.2012"
        maxDate="10.03.2012"
        minDate="15.08.2009"
        dateComponentsOrder={DateComponentsOrder.DMY}
        dateComponentsSeparator={DateComponentsSeparator.Dash}
      />
    </div>
  ));
