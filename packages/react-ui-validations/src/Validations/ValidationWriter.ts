import {ValidationNode} from "./Types";
import {ValidationInfo} from "../ValidationWrapperV1";
import {ValidationReader} from "./ValidationReader";

export class ValidationWriter<T> {
  private readonly node: ValidationNode<T>;

  constructor(node?: ValidationNode<T>) {
    this.node = node || {validation: null, children: null};
  }

  get reader(): ValidationReader<T> {
    return new ValidationReader(this.node);
  }

  set = (validation: ValidationInfo): void => {
    this.node.validation = validation;
  };

  isValidated = (): boolean => {
    return !!this.node.validation;
  };

  getNode = <TChild>(path: string[]): ValidationWriter<TChild> => {
    const node = this.getNodeInternal<TChild>(path);
    return new ValidationWriter<TChild>(node);
  };

  private getNodeInternal = <TChild>(path: string[]): ValidationNode<TChild> => {
    let node: ValidationNode<any> = this.node;
    for (let i = 0; i < path.length; ++i) {
      if (!node.children) {
        node.children = {};
      }
      const part = path[i];
      if (!node.children[part]) {
        node.children[part] = {
          validation: null,
          children: null,
        };
      }
      node = node.children[part];
    }
    return node;
  };
}
