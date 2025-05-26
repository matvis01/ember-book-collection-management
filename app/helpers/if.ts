import { helper } from '@ember/component/helper';

export function ifHelper([condition, truthy, falsy]: [
  unknown,
  unknown,
  unknown,
]): unknown {
  return condition ? truthy : falsy;
}

export default helper(ifHelper);
