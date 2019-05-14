import * as React from 'react';
import Button from 'retail-ui/components/Button';
import Gapped from 'retail-ui/components/Gapped';
import Input from 'retail-ui/components/Input';
import {ValidationContainer, ValidationWrapperV1, createValidator, text} from '../../../../../src';
import {Nullable} from "../../../../../typings/Types";

export interface ArrayValidationProps {
}

interface ArrayValidationState {
  emails: string[];
}

const getDuplicatesFor = (items: string[], index: number): number[] => {
  return items
    .map((x, i) => x === items[index] && i !== index ? i : null)
    .filter(x => x != null) as number[];
};

const validate = createValidator<string[]>((b, a) => {
  b.array(x => x, (b, i) => {
    b.invalid(x => !x, "Укажите email", "submit");
    b.invalid(x => !/^[a-z]+@[a-z]+\.[a-z]+$/.test(x), "Неверный формат email", "lostfocus");
    b.invalid(x => !!getDuplicatesFor(a, i).length, x => "Дубль со строками " + getDuplicatesFor(a, i).map(x => x + 1).join(", "), "lostfocus");
  });
});

export default class ArrayValidation extends React.Component<ArrayValidationProps, ArrayValidationState> {
  public state: ArrayValidationState = {
    emails: [""],
  };

  private container: Nullable<ValidationContainer> = null;

  public render() {
    const validation = validate(this.state.emails);
    return (
      <ValidationContainer ref={this.refContainer}>
        <div style={{padding: 30}}>
          <Gapped vertical>
            <Gapped>
              <span>Emails</span>
              <Button data-tid="AddButton" onClick={this.handleEmailAdd}>
                Add
              </Button>
            </Gapped>
            {this.state.emails.map((email, i) => (
              <Gapped>
                <Button data-tid="RemoveButton" onClick={() => this.handleEmailRemove(i)}>
                  X
                </Button>
                <ValidationWrapperV1 data-tid="EmailInputValidation" validationInfo={validation.getNodeByIndex(i).get()} renderMessage={text()}>
                  <Input data-tid="EmailInput" value={email} onChange={(_, value) => this.handleEmailChange(value, i)}/>
                </ValidationWrapperV1>
              </Gapped>
            ))}
            <Gapped>
              <Button data-tid={"SubmitButton"} onClick={this.handleSubmit}>
                Submit
              </Button>
            </Gapped>
          </Gapped>
        </div>
      </ValidationContainer>
    );
  }

  private handleEmailChange = (email: string, index: number): void => {
    this.setState({emails: this.state.emails.map((x, i) => i === index ? email : x)});
  };

  private handleEmailAdd = (): void => {
    this.setState({emails: [...this.state.emails, ""]});
  };

  private handleEmailRemove = (index: number): void => {
    const emails = this.state.emails.filter((x, i) => i !== index);
    this.setState({emails: emails.length ? emails : [""]});
  };

  private handleSubmit = async () => {
    if (!this.container) {
      throw new Error("invalid state");
    }
    await this.container.validate();
  };

  private refContainer = (el: ValidationContainer | null) => (this.container = el);
}
