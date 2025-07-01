// Type.
import { GetterCallback, SetterCallback } from '@typedly/callback';
import { PrototypeOf } from '../../type';

export abstract class WrapPropertyCore<
  Target extends object | (new () => any),
  O extends Record<PropertyKey, any> = (Target extends new () => Target ? PrototypeOf<Target> : Target),
  K extends keyof O extends string | symbol
  ? keyof O
  : never = keyof O extends string | symbol
    ? keyof O
    : never
> {
  public static configurable = true
  public static enumerable = false

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
  #previousDescriptor?: PropertyDescriptor;
  #privateKey: PropertyKey;
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
      onGet?: GetterCallback<O, K>,
      onSet?: SetterCallback<O, K>,
      privateKey?: PropertyKey,
    } = {},
  ) {
    const object = (typeof target === 'function' ? target.prototype : target) as O;

    // Set the private key if not provided.
    privateKey = privateKey || `_${String(key)}`;

    // Assign the key, target, and private key.
    this.#key = key;
    this.#target = target;
    this.#privateKey = privateKey;

    // Define the private property to store the value.
    this.#hasPrivateProperty() === false && this.#definePrivateProperty(object, key);

    // Define the property with the given key and options.
    this.wrap(
      object,
      key, {
        configurable,
        enumerable,
        onGet,
        onSet,
        privateKey,
      },
    );
  }

  // Unwrap (pop the descriptor stack and restore previous descriptor)
  public unwrap(): boolean {
    this.wrap(
      typeof this.#target === 'function' ? this.#target.prototype : this.#target,
      this.#key,
      this.#previousDescriptor
    );
    return false;
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
    const previousDescriptor = Object.getOwnPropertyDescriptor(object, key);

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

  #definePrivateProperty(
    object: O,
    key: K,
  ) {
    console.debug(
      `Defining private property: ${String(this.#privateKey)} in`,
      object
    );
    Object.defineProperty(
      object,
      this.#privateKey, {
        configurable: false,
        enumerable: false,
        value: object[key],
        writable: true
      }
    );
  }

  #hasPrivateProperty(): boolean {
    console.debug(
      `Checking private property: ${String(this.#privateKey)} in`,
      (typeof this.#target === 'function' ? this.#target.prototype : this.#target) as O,
      Object.hasOwn(
        (typeof this.#target === 'function' ? this.#target.prototype : this.#target) as O,
        this.#privateKey
      )
    );
    return Object.hasOwn(
      (typeof this.#target === 'function' ? this.#target.prototype : this.#target) as O,
      this.#privateKey
    );
  }
}
