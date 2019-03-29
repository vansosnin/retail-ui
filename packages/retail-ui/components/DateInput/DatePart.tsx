import * as React from 'react';
import { selectNodeContents } from './SelectionHelpers';

export interface DatePartProps {
  selected?: boolean;
  isValid?: boolean;
  children?: React.ReactNode;
  onDoubleClick?: (event: React.MouseEvent<HTMLSpanElement>) => void;
  onMouseDown?: (event: React.MouseEvent<HTMLSpanElement>) => void;
}

export class DatePart extends React.Component<DatePartProps> {
  private _node: HTMLSpanElement | null = null;

  public componentDidMount() {
    this._ensureSelection();
  }

  public componentDidUpdate() {
    this._ensureSelection();
  }

  public render() {
    const style = this.props.isValid === false ? {color: 'red'} : {};
    return (
      <span style={style} ref={el => (this._node = el)} onMouseDown={this.props.onMouseDown} onDoubleClick={this.props.onDoubleClick}>
        {this.props.children}
      </span>
    );
  }

  private _ensureSelection() {
    if (this.props.selected && this._node) {
      selectNodeContents(this._node);
    }
  }
}
