// Type.
import { GetterCallback, SetterCallback } from '@typedly/callback';
import { PrototypeOf } from '../../type';

export abstract class WrapPropertyCore<
  T extends object | (new () => any),
  O extends Record<PropertyKey, any> = (T extends new () => T ? PrototypeOf<T> : T),
  K extends keyof O extends string | symbol
  ? keyof O
  : never = keyof O extends string | symbol
    ? keyof O
    : never
> {
  public static configurable = true
  public static enumerable = false

  protected abstract get key(): K;
  protected abstract get privateKey(): PropertyKey;
  protected abstract get target(): T;

  constructor(
    target: T,
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
      onGet?: GetterCallback<O, K>,
      onSet?: SetterCallback<O, K>,
      privateKey?: PropertyKey,
    } = {},
  ) {
    const object = (typeof target === 'function' ? target.prototype : target) as O;

    // Define the private property to store the value.
    this.#hasPrivateProperty(object, key) === false && this.#definePrivateProperty(object, key);
  }

  // Get the previous descriptor of the property.
  public abstract getPreviousDescriptor(object: O, key: K): PropertyDescriptor | undefined;

  // Unwrap.
  public abstract unwrap(): this;

  // Wraps the property with a private key.
  protected abstract wrap(
    object: O,
    key: K, {
      configurable,
      enumerable,
      onGet,
      onSet,
      privateKey,
    }: {
      configurable?: boolean,
      enumerable?: boolean,
      onGet?: GetterCallback<O, K>,
      onSet?: SetterCallback<O, K>,
      privateKey?: PropertyKey,
    },
  ): this;

  #definePrivateProperty(
    object: O,
    key: K,
  ) {
    Object.defineProperty(
      object,
      this.privateKey, {
        configurable: false,
        enumerable: false,
        value: object[key],
        writable: true
      }
    );
  }

  #hasPrivateProperty(object: O, key: K): boolean {
    return Object.hasOwn(object, key);
  }
}
