import * as React from 'react';
import Button from 'retail-ui/components/Button';
import Input from 'retail-ui/components/Input';
import {ValidationContainer, ValidationWrapperV1, createValidator} from '../../../../../src';
import {Nullable} from "../../../../../typings/Types";
import Form from "../../../Form";

const validate = createValidator<string[]>(b => {
  b.array(x => x, b => {
    b.invalid(x => !x, "Укажите email", "submit");
    b.invalid(x => !/^[a-z]+@[a-z]+\.[a-z]+$/.test(x), "Неверный формат email");
  });
});

interface State {
  emails: string[];
}

export default class ArrayValidation extends React.Component<{}, State> {
  public state: State = {
    emails: ["", "", ""],
  };

  private container: Nullable<ValidationContainer> = null;

  public render() {
    const validation = validate(this.state.emails);
    return (
      <ValidationContainer ref={this.refContainer}>
        <Form>

          {this.state.emails.map((email, i) => (
            <Form.Line title={`E-mail #${i}`} key={i}>
              <ValidationWrapperV1 validationInfo={validation.getNodeByIndex(i).get()}>
                <Input
                  value={this.state.emails[i]}
                  onChange={(_, email) => this.handleEmailChange(email, i)}
                />
              </ValidationWrapperV1>
            </Form.Line>
          ))}

          <Form.ActionsBar>
            <Button onClick={this.handleSubmit}>
              Submit
            </Button>
          </Form.ActionsBar>

        </Form>
      </ValidationContainer>
    );
  }

  private handleEmailChange = (email: string, index: number): void => {
    const emails = this.state.emails.map((x, i) => i === index ? email : x);
    this.setState({emails});
  };

  private handleSubmit = async () => {
    if (!this.container) {
      throw new Error("invalid state");
    }
    if (await this.container.validate()) {
      alert("success");
    }
  };

  private refContainer = (el: ValidationContainer | null) => (this.container = el);
}
