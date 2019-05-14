import { storiesOf } from '@storybook/react';
import * as React from 'react';
import EmailInputValidation from "./ValidationBuilderStories/EmailInputValidation";
import ArrayValidation from "./ValidationBuilderStories/ArrayValidation";

storiesOf('ValidationBuilder', module)
  .add('EmailInputValidation', () => <EmailInputValidation/>)
  .add('ArrayValidation', () => <ArrayValidation/>)
