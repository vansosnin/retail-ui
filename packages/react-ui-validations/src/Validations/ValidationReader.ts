import {ValidationNode} from "./Types";
import {FunctionHelper, LambdaPath} from "./FunctionHelper";
import {ValidationInfo} from "../ValidationWrapperV1";
import {Nullable} from "../../typings/Types";

export class ValidationReader<T> {
  constructor(node: Nullable<ValidationNode<T>>) {
    this.node = node;
  }

  private readonly node: Nullable<ValidationNode<T>>;

  getNode<TChild>(lambdaPath: LambdaPath<T, TChild>): ValidationReader<TChild> {
    const path = FunctionHelper.getLambdaPath(lambdaPath);
    return this.getReaderInternal<TChild>(path);
  }

  getNodeByIndex<TChild>(index: number): ValidationReader<TChild> {
    return this.getReaderInternal<TChild>([index.toString()]);
  }

  getNodeByKey<TKey extends keyof T>(key: TKey): ValidationReader<T[TKey]> {
    return this.getReaderInternal<T[TKey]>([key.toString()]);
  }

  get(): Nullable<ValidationInfo> {
    return this.node ? this.node.validation : null;
  }

  private getReaderInternal = <TChild>(path: string[]): ValidationReader<TChild> => {
    const node = this.getNodeInternal<TChild>(path);
    return new ValidationReader<TChild>(node);
  };

  private getNodeInternal = <TChild>(path: string[]): Nullable<ValidationNode<TChild>> => {
    let current: Nullable<ValidationNode<any>> = this.node;
    for (let i = 0; i < path.length; ++i) {
      if (!current || !current.children) {
        return null;
      }
      const part = path[i];
      current = current.children[part];
    }
    return current;
  };
}
