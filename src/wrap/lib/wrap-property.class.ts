// Abstract.
import { WrapPropertyBase } from './wrap-property-base.abstract';
// Type.
import { PrototypeOf } from '../../type';
// Interface.
import { WrappedPropertyDescriptor } from '../interface';

export class WrapProperty<
  T extends object | (new () => any),
  O extends Record<PropertyKey, any> = (T extends new () => any ? PrototypeOf<T> : T),
  K extends keyof O extends string | symbol
  ? keyof O
  : never = keyof O extends string | symbol
    ? keyof O
    : never,
> extends WrapPropertyBase<T, O, K> {
  constructor(
    target: T,
    key: K,
    {
      configurable,
      enumerable,
      onGet,
      onSet,
      privateKey,
    }: WrappedPropertyDescriptor<O, K> = {},
  ) {
    super(
      target,
      key,
      { configurable, enumerable, onGet, onSet, privateKey },
    );

    // Define the property with the given key and options.
    this.wrap(
      (typeof target === 'function' ? target.prototype : target) as O,
      key, {
        configurable,
        enumerable,
        onGet,
        onSet,
        privateKey,
      },
    );
  }
}
