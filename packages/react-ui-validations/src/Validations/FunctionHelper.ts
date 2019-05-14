export type LambdaPath<T, TChild> = (x: T) => TChild;

export class FunctionHelper {
  static isFunction = (f: any): f is Function => {
    return typeof f === "function";
  };

  static pathRegEx = /^function\s*\(\s*([A-Za-z0-9_]+)\s*\)\s*\{\s*(?:\"use strict\";|\'use strict\';)?\s*return\s+\1(?:[\.\[](.+?))?\s*;?\s*\}$/;

  static getLambdaPath = <T, TChild>(lambdaPath: LambdaPath<T, TChild>): string[] => {
    if (lambdaPath.length === 1) {
      const lambda = lambdaPath.toString();
      const match = FunctionHelper.pathRegEx.exec(lambda);
      if (match && match.length === 3) {
        return (match[2] || "")
          .split(/[\s\.\[\]]+/g)
          .filter(x => x);
      }
    }
    throw new Error(`Not a lambda path: <${lambdaPath.toString()}>`);
  };
}
