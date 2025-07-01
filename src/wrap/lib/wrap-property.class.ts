// Abstract.
import { WrapPropertyCore } from './wrap-property-core.abstract';
// Type.
import { GetterCallback, SetterCallback } from '@typedly/callback';
import { PrototypeOf } from '../../type';

export class WrapProperty<
  Target extends object | (new () => any),
  T extends Record<PropertyKey, any> = (Target extends new () => any ? PrototypeOf<Target> : Target),
  K extends keyof T extends string | symbol
  ? keyof T
  : never = keyof T extends string | symbol
    ? keyof T
    : never,
> extends WrapPropertyCore<Target, T, K> {
  constructor(
    target: Target,
    key: K,
    {
      configurable,
      enumerable,
      onGet,
      onSet,
      privateKey,
    }: {
      configurable?: boolean,
      enumerable?: boolean,
      onGet?: GetterCallback<T, K>,
      onSet?: SetterCallback<T, K>,
      privateKey?: PropertyKey,
    } = {},
  ) {
    super(
      target,
      key,
      { configurable, enumerable, onGet, onSet, privateKey },
    );
  }
}
