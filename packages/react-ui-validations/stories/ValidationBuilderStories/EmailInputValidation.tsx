import * as React from 'react';
import Button from 'retail-ui/components/Button';
import Gapped from 'retail-ui/components/Gapped';
import Input from 'retail-ui/components/Input';
import {text} from '../../src';
import ValidationContainer from '../../src/ValidationContainer';
import ValidationWrapperV1 from '../../src/ValidationWrapperV1';
import {createValidator} from "../../src/Validations";
import {Nullable} from "../../typings/Types";

export interface EmailInputValidationProps {
}

interface EmailInputValidationState {
  email: string;
}

const validate = createValidator<string>(b => {
  b.invalid(x => !x, "Укажите email", "submit");
  b.invalid(x => !/^[a-z]+@[a-z]+\.[a-z]+$/.test(x), "Неверный формат email", "lostfocus");
});

export default class EmailInputValidation extends React.Component<EmailInputValidationProps, EmailInputValidationState> {
  public state: EmailInputValidationState = {
    email: "",
  };

  private container: Nullable<ValidationContainer> = null;

  public render() {
    const validation = validate(this.state.email);
    return (
      <ValidationContainer ref={this.refContainer}>
        <div style={{padding: 30}}>
          <Gapped vertical>
            <span>Email</span>
            <ValidationWrapperV1 data-tid="EmailInputValidation" validationInfo={validation.get()} renderMessage={text()}>
              <Input data-tid="EmailInput" value={this.state.email} onChange={(_, value) => this.setState({email: value})}/>
            </ValidationWrapperV1>
            <Gapped>
              <Button data-tid="SubmitButton" onClick={this.handleSubmit}>
                Submit
              </Button>
            </Gapped>
          </Gapped>
        </div>
      </ValidationContainer>
    );
  }

  public handleSubmit = async () => {
    if (!this.container) {
      throw new Error("invalid state");
    }
    await this.container.validate();
  };

  private refContainer = (el: ValidationContainer | null) => (this.container = el);
}
