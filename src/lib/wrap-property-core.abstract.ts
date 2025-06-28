// Type.
import { GetterCallback, SetterCallback } from '@typedly/callback';
import { PrototypeOf } from '../type';

export abstract class WrapPropertyCore<
  Target extends object | (new () => any),
  T extends Record<PropertyKey, any> = (Target extends new () => Target ? PrototypeOf<Target> : Target),
  K extends keyof T extends string | symbol
  ? keyof T
  : never = keyof T extends string | symbol
    ? keyof T
    : never,
> {
  public get key() {
    return this.#key;
  }

  public get privateKey() {
    return this.#privateKey;
  }

  public get target() {
    return this.#target;
  }

  #key: K;
  #privateKey?: PropertyKey;
  #target: Target;

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
    { set, get }: { set?: PropertyDescriptor['set'], get?: PropertyDescriptor['get'] } = {},
  ) {
    const object = (typeof target === 'function' ? target.prototype : target) as T;

    this.#key = key;
    this.#target = target;
    this.#privateKey = privateKey || `_${String(key)}`;

    // Set the private property to store the value.
    Object.hasOwn(object, this.#privateKey) === false &&
      Object.defineProperty(
        object,
        this.#privateKey, {
          configurable: false,
          enumerable: false,
          value: object[key],
          writable: true
        }
      );

    // Define the property with the given key and options.
    this.defineProperty(
      object,
      key, {
        configurable,
        enumerable,
        onGet,
        privateKey,
        onSet,
      },
      { set, get }
    );
  }

  // Wraps the property with a private indicator.
  protected defineProperty(
    object: T,
    key: K, {
      configurable,
      enumerable,
      onGet,
      privateKey,
      onSet,
    }: {
      configurable?: boolean,
      enumerable?: boolean,
      onGet?: GetterCallback<T, K>,
      privateKey?: PropertyKey,
      onSet?: SetterCallback<T, K>,
    } = {},
    { set, get }: { set?: PropertyDescriptor['set'], get?: PropertyDescriptor['get'] } = {},
  ): this {
    const previousDescriptor = Object.getOwnPropertyDescriptor(object, key);

    // Define property with the given key and options.
    Object.defineProperty(
      object,
      key, {
        // Whether the property can be deleted or changed.
        configurable,

        // Whether the property is visible in enumerations.
        enumerable,

        // Getter for the property.
        ...{
          get(): T[K] {
            const t = (this as T);

            const previousValue = previousDescriptor
              ? previousDescriptor?.get && typeof previousDescriptor.get === 'function' ? previousDescriptor.get.call(this) : previousDescriptor.value
              : undefined;

            return onGet && typeof onGet === 'function'
              ? onGet.call(t, key, t[privateKey as keyof T] as T[K], previousValue, t) as T[K]
              : t[privateKey as keyof T] as T[K];
          }
        },
        ...get? { get: get.bind(this)} : {},

        // Setter for the property.
        ...{
          set(value: T[K]): void {
            const t = (this as T);

            previousDescriptor?.set && previousDescriptor.set.call(t, value);

            t[privateKey as keyof T] = onSet && typeof onSet === 'function'
              ? onSet.call(t, value, t[privateKey as keyof T] as T[K], key, t) as T[K]
              : value;
          }
        },
        ...set? { set: set.bind(this)} : {},

      }
    );
    return this;
  }
}
