import { helper } from '@ember/component/helper';

export interface SubstringSignature {
  Args: {
    Positional: [string, number, number?];
  };
  Return: string;
}

const substringHelper = helper<SubstringSignature>(([str, start, end]) => {
  if (!str || typeof str !== 'string') {
    return '';
  }
  return str.substring(start, end);
});

export default substringHelper;

declare module '@glint/environment-ember-loose/registry' {
  export default interface Registry {
    substring: typeof substringHelper;
  }
}