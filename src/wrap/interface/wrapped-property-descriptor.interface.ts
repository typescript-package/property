import { GetterCallback, SetterCallback } from "@typedly/callback";

export interface WrappedPropertyDescriptor<
  O extends object,
  K extends keyof O
> extends Pick<PropertyDescriptor, 'configurable' | 'enumerable'> {
  onGet?: GetterCallback<O, K>,
  onSet?: SetterCallback<O, K>,
  privateKey?: PropertyKey,
}
