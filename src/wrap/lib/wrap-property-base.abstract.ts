// Abstract.
import { WrapPropertyCore } from './wrap-property-core.abstract';
// Type.
import { GetterCallback, SetterCallback } from '@typedly/callback';
import { PrototypeOf } from '../../type';

export class WrapPropertyBase<
  T extends object | (new () => any),
  O extends Record<PropertyKey, any> = (T extends new () => any ? PrototypeOf<T> : T),
  K extends keyof O extends string | symbol
  ? keyof O
  : never = keyof O extends string | symbol
    ? keyof O
    : never,
> extends WrapPropertyCore<T, O, K> {

  protected get key() {
    return this.#key;
  }

  protected get privateKey() {
    return this.#privateKey;
  }

  protected get target() {
    return this.#target;
  }

  #key: K;
  #privateKey: PropertyKey;
  #target: T;

  #previousDescriptor?: PropertyDescriptor;

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
    super(
      target,
      key,
      { configurable, enumerable, onGet, onSet, privateKey },
    );

    // Set the private key if not provided.
    privateKey = privateKey || `_${String(key)}`;

    // Assign the key, target, and private key.
    this.#key = key;
    this.#target = target;
    this.#privateKey = privateKey;
  }

  public getPreviousDescriptor(object: O, key: K): PropertyDescriptor | undefined {
    this.#previousDescriptor = !this.#previousDescriptor
      ? Object.getOwnPropertyDescriptor(object, key)
      : this.#previousDescriptor;
    return this.#previousDescriptor;
  }

  public unwrap(): this {
    this.wrap(
      typeof this.target === 'function' ? this.target.prototype : this.target,
      this.key,
      this.#previousDescriptor
    );
    return this;
  }

  // Wraps the property with a private indicator.
  protected wrap(
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
    } = {},
  ): this {
    // Get the previous descriptor of the property.
    const previousDescriptor = this.getPreviousDescriptor(object, key);

    // Define property with the given key and options.
    Object.defineProperty(
      object,
      key, {
        // Whether the property can be deleted or changed.
        configurable: configurable === undefined ? WrapPropertyCore.configurable : configurable,

        // Whether the property is visible in enumerations.
        enumerable: enumerable === undefined ? WrapPropertyCore.enumerable : enumerable,

        // Getter for the property.
        ...{
          get(): O[K] { 
            // Set the this as the target object.
            const t = (this as O);

            // Get the previous value from descriptor.
            const previousValue = previousDescriptor
              ? previousDescriptor.get && typeof previousDescriptor.get === 'function'
                ? previousDescriptor.get.call(this)
                : previousDescriptor.value
              : undefined;

            // Current descriptor.
            return onGet && typeof onGet === 'function'
                  ? onGet.call(t, key, t[privateKey as keyof O] as O[K], previousValue, t) as O[K]
                  : t[privateKey as keyof O] as O[K];
          }
        },

        // Setter for the property.
        ...{
          set(value: O[K]): void {
            // Set the this as the target object.
            const t = (this as O);

            // Get the previous value from previous descriptor or current value.
            const previousValue = (t[privateKey as keyof O] || previousDescriptor?.value) as O[K];

            // Perform previous descriptor.
            previousDescriptor?.set && previousDescriptor.set.call(t, value);

            // Set the private property value.
            t[privateKey as keyof O] = onSet && typeof onSet === 'function'
              ? onSet.call(t, value, previousValue, key, t) as O[K]
              : value;
          }
        },
      }
    );
    return this;
  }
}
