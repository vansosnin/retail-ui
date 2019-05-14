import * as React from 'react';
import Button from 'retail-ui/components/Button';
import Input from 'retail-ui/components/Input';
import {ValidationContainer, ValidationWrapperV1, text, createValidator} from '../../../../../src';
import {Nullable} from "../../../../../typings/Types";
import Form from "../../../Form";

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
        <Form>
          <Form.Line title="Email">
            <ValidationWrapperV1 validationInfo={validation.get()} renderMessage={text()}>
              <Input value={this.state.email} onChange={(_, value) => this.setState({email: value})}/>
            </ValidationWrapperV1>
          </Form.Line>
          <Form.ActionsBar>
            <Button onClick={this.handleSubmit}>
              Submit
            </Button>
          </Form.ActionsBar>
        </Form>
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
