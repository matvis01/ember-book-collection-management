import { helper } from '@ember/component/helper';

export function and(params: unknown[]): boolean {
  return params.every((param) => Boolean(param));
}

export default helper(and);
