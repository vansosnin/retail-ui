import * as React from 'react';
import Button from 'retail-ui/components/Button';
import Input from 'retail-ui/components/Input';
import {ValidationContainer, ValidationWrapperV1, text, createValidator} from '../../../../../src';
import {Nullable} from "../../../../../typings/Types";
import Form from "../../../Form";

interface EmailInputState {
  email: string;
}

const validate = createValidator<string>(b => {
  b.invalid(x => !x, "Укажите email", "submit");
  b.invalid(x => !/^[a-z]+@[a-z]+\.[a-z]+$/.test(x), "Неверный формат email");
});

export default class EmailInputDemo extends React.Component<{}, EmailInputState> {
  public state: EmailInputState = {
    email: "",
  };

  private container: Nullable<ValidationContainer> = null;

  public render() {
    const validation = validate(this.state.email);
    return (
      <ValidationContainer ref={this.refContainer}>
        <Form>

          <Form.Line title="E-mail">
            <ValidationWrapperV1
              renderMessage={text()}
              validationInfo={validation.get()}
            >
              <Input
                value={this.state.email}
                onChange={(_, email) => this.setState({email})}
              />
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

  public handleSubmit = async (): Promise<void> => {
    if (!this.container) {
      throw new Error("invalid state");
    }
    if (await this.container.validate()) {
      alert("success");
    }
  };

  private refContainer = (el: ValidationContainer | null) => (this.container = el);
}
