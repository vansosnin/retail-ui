import * as React from 'react';
import Input from 'retail-ui/components/Input';
import {ValidationContainer, ValidationWrapperV1, ValidationInfo, tooltip} from '../../../../../src';
import {Nullable} from "../../../../../typings/Types";
import Form from "../../../Form";

interface State {
  value: string;
}

export default class TooltipValidationDemo extends React.Component<{}, State> {
  public state: State = {
    value: "",
  };

  public render() {
    const v = this.validate(this.state.value);
    return (
      <ValidationContainer>
        <Form>
          <Form.Line title="Только цифры">
            <ValidationWrapperV1 validationInfo={v}>
              {this.renderInput()}
            </ValidationWrapperV1>
          </Form.Line>
          <Form.Line title="Только цифры">
            <ValidationWrapperV1 validationInfo={v} renderMessage={tooltip("right top")}>
              {this.renderInput()}
            </ValidationWrapperV1>
          </Form.Line>
          <Form.Line title="Только цифры">
            <ValidationWrapperV1 validationInfo={v} renderMessage={tooltip("top left")}>
              {this.renderInput()}
            </ValidationWrapperV1>
          </Form.Line>
        </Form>
      </ValidationContainer>
    );
  }

  private renderInput = () => {
    return (
      <Input value={this.state.value} onChange={(_, value) => this.setState({value})}/>
    );
  };

  private validate = (value: string): Nullable<ValidationInfo> => {
    if (!/^\d*$/.test(value)) {
      return {message: "Только цифры", type: "lostfocus"}
    }
    return null;
  }
}
