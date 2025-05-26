import { helper } from '@ember/component/helper';

export function unless([condition]: [unknown]): boolean {
  return !condition;
}

export default helper(unless);
