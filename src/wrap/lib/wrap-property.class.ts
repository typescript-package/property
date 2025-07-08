// Abstract.
import { WrapPropertyBase } from './wrap-property-base.abstract';
// Interface.
import { WrappedPropertyDescriptor } from '../interface';

export class WrapProperty<
  // Used to determine the type of the target object for picking the key from prototype.
  T extends object | (new () => any),
  O extends Record<PropertyKey, any> = (T extends new () => T ? ( T extends { prototype: infer P } ? P : never) : T),
  K extends keyof O extends string | symbol ? keyof O : never = keyof O extends string | symbol ? keyof O : never,
  C extends boolean = boolean,
  E extends boolean = boolean,
  D extends WrappedPropertyDescriptor<O, K, C, E> = WrappedPropertyDescriptor<O, K, C, E>,
> extends WrapPropertyBase<T, O, K, C, E, D> {
  constructor(
    target: T,
    key: K,
    descriptor?: D
  ) {
    super(
      target,
      key,
      descriptor
    );

    // Define the property with the given key and options.
    this.wrap(
      (typeof target === 'function' ? target.prototype : target) as O,
      key,
      descriptor
    );
  }
}
