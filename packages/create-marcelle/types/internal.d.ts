export type Options = {
  name: string;
  template: 'default' | 'skeleton';
  typescript: boolean;
  // prettier: boolean;
  // eslint: boolean;
  linting: boolean;
};

export type File = {
  name: string;
  contents: string;
};

export type Condition = 'linting' | 'typescript' | 'default' | 'sveltekit';

export type Common = {
  files: Array<{
    name: string;
    include: Condition[];
    exclude: Condition[];
    contents: string;
  }>;
};
