import * as React from "react";
import {Nullable} from "../../typings/Types";
import {FunctionHelper, LambdaPath} from "./FunctionHelper";
import {ValidationWriter} from "./ValidationWriter";
import {ItemValidationRule, ValidationRule} from "./Types";
import {ValidationBehaviour, ValidationLevel} from "../ValidationWrapper";

type MessageProvider<T> = React.ReactNode | ((value: T) => React.ReactNode);

interface PathInfo<T> {
  data: T;
  path: string[];
}

interface BuilderOptions<T> {
  readonly validationWriter: ValidationWriter<T>;
}

export class ValidationBuilder<TRoot, T> {
  private readonly options: BuilderOptions<TRoot>;
  private readonly path: string[];
  private readonly data: T;

  constructor(options: BuilderOptions<TRoot>, path: string[], data: T) {
    this.options = options;
    this.path = path;
    this.data = data;
  }

  prop = <TChild>(lambdaPath: LambdaPath<T, TChild>, rule: ValidationRule<TRoot, TChild>): void => {
    const builder = this.getBuilder(lambdaPath);
    if (!builder) {
      return;
    }
    rule(builder, builder.data);
  };

  array = <TChild>(lambdaPath: LambdaPath<T, TChild[]>, rule: ItemValidationRule<TRoot, TChild>): void => {
    const builders = this.getBuilders(lambdaPath);
    if (!builders) {
      return;
    }

    for (let i = 0; i < builders.length; ++i) {
      rule(builders[i], i, builders[i].data);
    }
  };

  invalid = (isInvalid: (value: T) => boolean, getMessage: MessageProvider<T>, type?: ValidationBehaviour, level?: ValidationLevel): void => {
    const validationWriter = this.options.validationWriter.getNode<T>(this.path);
    if (validationWriter.isValidated()) {
      return;
    }

    const invalid = isInvalid(this.data);
    if (!invalid) {
      return;
    }

    const message = FunctionHelper.isFunction(getMessage)
      ? getMessage(this.data)
      : getMessage;

    validationWriter.set({message, type, level});
  };

  private getBuilder = <TChild>(lambdaPath: LambdaPath<T, TChild>): Nullable<ValidationBuilder<TRoot, TChild>> => {
    const info = this.getPathInfo(lambdaPath);
    if (info == null) {
      return null;
    }
    return new ValidationBuilder<TRoot, TChild>(this.options, info.path, info.data);
  };

  private getBuilders = <TChild>(lambdaPath: LambdaPath<T, TChild[]>): Nullable<ValidationBuilder<TRoot, TChild>[]> => {
    const info = this.getPathInfo(lambdaPath);
    if (info == null || !Array.isArray(info.data)) {
      return null;
    }
    return info.data.map((x, i) => new ValidationBuilder<TRoot, TChild>(this.options, [...info.path, i.toString()], x));
  };

  private getPathInfo = <TChild>(lambdaPath: LambdaPath<T, TChild>): Nullable<PathInfo<TChild>> => {
    const path = FunctionHelper.getLambdaPath(lambdaPath);

    let data: any = this.data;
    for (let i = 0; i < path.length; ++i) {
      if (data == null) {
        return null;
      }
      const part = path[i];
      data = data[part];
    }

    return {data, path: [...this.path, ...path]};
  }
}
