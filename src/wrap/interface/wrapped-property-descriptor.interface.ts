import { AccessorPropertyDescriptor } from '@typedly/descriptor';
import { GetterCallback, SetterCallback } from '@typedly/callback';

export interface WrappedPropertyDescriptor<
  O,
  K extends keyof O,
  C extends boolean = boolean,
  E extends boolean = boolean,
> extends AccessorPropertyDescriptor<O[K], C, E> {
  active?: boolean;
  privateKey?: PropertyKey;
  onGet?: GetterCallback<O, K>;
  onSet?: SetterCallback<O, K>;
}
