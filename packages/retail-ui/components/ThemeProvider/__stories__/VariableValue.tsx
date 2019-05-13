import * as React from 'react';
import Input from '../../Input';
import styles from './styles.less';

export interface IVariableValueProps {
  onChange: (variable: string, value: string) => void;
  value: string;
  variable: string;
}
export interface IVariableValueState {
  value: string;
}

export class VariableValue extends React.Component<IVariableValueProps, IVariableValueState> {
  public state = {
    value: this.props.value,
  };

  public render() {
    const { variable } = this.props;
    return (
      <div className={styles.variableValueRoot}>
        <div className={styles.variableName} title={variable}>{`${variable}: `}</div>
        <Input width={150} value={this.state.value} onChange={this.handleChange} onBlur={this.handleBlur} />
      </div>
    );
  }

  public componentDidUpdate(prevProps: IVariableValueProps) {
    if (prevProps.value !== this.props.value) {
      this.setState({ value: this.props.value });
    }
  }

  private handleChange = (e: React.ChangeEvent<HTMLInputElement>, value: string) => {
    this.setState({
      value,
    });
  };

  private handleBlur = () => {
    const { variable, value, onChange } = this.props;
    if (this.state.value !== value) {
      onChange(variable, this.state.value);
    }
  };
}