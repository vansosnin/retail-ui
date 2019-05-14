import * as React from 'react';
import {Prism as Code} from 'react-syntax-highlighter';
import * as Styles from 'react-syntax-highlighter/dist/styles/prism';
import styled from 'styled-components';
import Button from "../../../retail-ui/components/Button";

interface DemoProps {
  demo?: React.ComponentClass<any>;
  source?: string;
}

interface DemoState {
  showCode: boolean
}

const DemoContainer = styled.div`
  border: 1px solid #aaa;
  padding: 20px;
  margin-top: 20px;
  margin-bottom: 20px;
  font-size: 14px;
`;

export default class Demo extends React.Component<DemoProps> {
  state: DemoState = {
    showCode: !this.props.demo && !this.props.children,
  };

  render() {
    const DemoComponent = this.props.demo;
    const ui = DemoComponent ? <DemoComponent/> : this.props.children;
    return (
      <div>
        {ui && <DemoContainer>{ui}</DemoContainer>}
        {this.renderCode()}
        <br/>
      </div>
    );
  }

  private renderCode = () => {
    if (!this.props.source) {
      return null;
    }

    if (!this.props.demo && !this.props.children) {
      return (
        <Code language="tsx" style={Styles.darcula}>{this.props.source}</Code>
      );
    }

    return this.state.showCode
      ? (
        <div>
          <Button width={150} onClick={() => this.setState({showCode: false})}>Скрыть код</Button>
          <Code language="tsx" style={Styles.darcula}>{this.props.source}</Code>
        </div>
      )
      : (
        <div>
          <Button width={150} onClick={() => this.setState({showCode: true})}>Показать код</Button>
        </div>
      );
  }
}
