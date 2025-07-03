import { AccessorPropertyDescriptor } from '@typedly/descriptor';
import { GetterCallback, SetterCallback } from '@typedly/callback';

export interface WrappedPropertyDescriptor<
  O extends object,
  K extends keyof O
> extends AccessorPropertyDescriptor<O[K]> {
  active?: boolean;
  privateKey?: PropertyKey;
  onGet?: GetterCallback<O, K>;
  onSet?: SetterCallback<O, K>;
}
