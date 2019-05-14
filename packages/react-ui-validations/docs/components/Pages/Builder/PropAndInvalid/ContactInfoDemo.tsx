import * as React from 'react';
import Button from 'retail-ui/components/Button';
import Input from 'retail-ui/components/Input';
import {ValidationContainer, ValidationWrapperV1, text, createValidator} from '../../../../../src';
import {Nullable} from "../../../../../typings/Types";
import Form from "../../../Form";

interface ContactInfo {
  name: string;
  email: string;
}

interface ContactInfoState {
  contactInfo: ContactInfo;
}

const validate = createValidator<ContactInfo>(b => {
  b.prop(x => x.name, b => {
    b.invalid(x => !x, "Укажите имя", "submit");
  });
  b.prop(x => x.email, b => {
    b.invalid(x => !x, "Укажите email", "submit");
    b.invalid(x => !/^[a-z]+@[a-z]+\.[a-z]+$/.test(x), "Неверный формат email");
  });
});

export default class ContactInfoDemo extends React.Component<{}, ContactInfoState> {
  public state: ContactInfoState = {
    contactInfo: {
      name: "",
      email: "",
    },
  };

  private container: Nullable<ValidationContainer> = null;

  public render() {
    const {contactInfo} = this.state;
    const validation = validate(contactInfo);
    return (
      <ValidationContainer ref={this.refContainer}>
        <Form>

          <Form.Line title="Имя">
            <ValidationWrapperV1
              renderMessage={text()}
              validationInfo={validation.getNode(x => x.name).get()}
            >
              <Input
                value={contactInfo.name}
                onChange={(_, name) => this.handleChange({name})}
              />
            </ValidationWrapperV1>
          </Form.Line>

          <Form.Line title="E-mail">
            <ValidationWrapperV1
              renderMessage={text()}
              validationInfo={validation.getNode(x => x.email).get()}
            >
              <Input
                value={contactInfo.email}
                onChange={(_, email) => this.handleChange({email})}
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

  private handleChange = (value: Partial<ContactInfo>): void => {
    this.setState(state => ({contactInfo: {...state.contactInfo, ...value}}));
  };

  private handleSubmit = async (): Promise<void> => {
    if (!this.container) {
      throw new Error("invalid state");
    }
    if (await this.container.validate()) {
      alert("success");
    }
  };

  private refContainer = (el: ValidationContainer | null) => (this.container = el);
}
