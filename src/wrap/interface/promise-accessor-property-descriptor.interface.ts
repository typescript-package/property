export type PromiseAccessorPropertyDescriptor<T, K extends keyof T> = {
  get?: (this: T) => Promise<T[K]>;
  set?: (this: T, value: T[K] | Promise<T[K]>) => void;
  configurable?: boolean;
  enumerable?: boolean;
};