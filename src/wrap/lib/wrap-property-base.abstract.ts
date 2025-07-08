// Abstract.
import { WrapPropertyCore } from './wrap-property-core.abstract';
// Interface.
import { WrappedPropertyDescriptor } from '../interface';

export abstract class WrapPropertyBase<
  T extends object | (new () => any),
  O extends Record<PropertyKey, any> = (T extends new () => T ? (T extends { prototype: infer P } ? P : never) : T),
  K extends keyof O extends string | symbol ? keyof O : never = keyof O extends string | symbol ? keyof O : never,
  C extends boolean = boolean,
  E extends boolean = boolean,
  D extends WrappedPropertyDescriptor<O, K, C, E> = WrappedPropertyDescriptor<O, K, C, E>,
> extends WrapPropertyCore<T, O, K, C, E, D> {

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
  #target: T;

  constructor(
    target: T,
    key: K,
    descriptor?: D,
  ) {
    super();
    const object = (typeof target === 'function' ? target.prototype : target) as O;

    // Assign the key, target, and private key.
    this.#key = key;
    this.#target = target;
    this.#privateKey = descriptor?.privateKey || `_${String(key)}`; // Set the private key if not provided.

    // Define the private property to store the value.
    this.#hasPrivateProperty(object) === false && this.#definePrivateProperty(object, key);
  }

  protected getPreviousDescriptor(object: O, key: K): PropertyDescriptor | undefined {
    this.#previousDescriptor = !this.#previousDescriptor
      ? Object.getOwnPropertyDescriptor(object, key) as PropertyDescriptor
      : this.#previousDescriptor as PropertyDescriptor;
    return this.#previousDescriptor;
  }

  public unwrap(): this {
    Object.defineProperty((typeof this.#target === 'function' ? this.#target.prototype : this.#target) as O, this.#key, this.#previousDescriptor!);
    delete (typeof this.target === 'function' ? this.target.prototype : this.#target)[this.#privateKey];
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
    }: WrappedPropertyDescriptor<O, K> = {},
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
            const previousValue = (t[privateKey as keyof O] || (previousDescriptor as PropertyDescriptor)?.value) as O[K];

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

  #hasPrivateProperty(object: O): boolean {
    return Object.hasOwn(object, this.privateKey);
  }

  #definePrivateProperty(object: O, key: K) {
    Object.defineProperty(
      object,
      this.privateKey, {
        configurable: true,
        enumerable: false,
        value: object[key],
        writable: true
      }
    );
  }
}
