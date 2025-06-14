// Class.
// Type.
import { GetterCallback, SetterCallback } from '@typedly/callback';
import { PrototypeOf } from '../temp/type';
// Symbol.
import { indicatorSymbol } from './indicator.symbol';
export class WrapProperty<
  Obj extends object | (new () => any),
  Target = (Obj extends new () => any ? PrototypeOf<Obj> : Obj),
  NameValue extends keyof Target extends string
  ? keyof Target
  : never = keyof Target extends string
    ? keyof Target
    : never,
> {
  // The private indicator.
  #private = '_';

  // The indicators for the private property.
  #active = 'active';
  #descriptor = 'descriptor';
  #get = 'get';
  #set = 'set';

  constructor(
    object: Obj,
    name: NameValue,
    {
      configurable,
      enumerable,
      get,
      set,
    }: {
      configurable?: boolean,
      enumerable?: boolean,
      get?: GetterCallback<Target, NameValue>,
      set?: SetterCallback<Target, NameValue>,
    } = {}
  ) {
    this
      .#defineIndicator(object, name)
      .#setPrivate(object, name)
      .#addGet(object, name, get)
      .#addSet(object, name, set);

    // Define the property getter and setter.
    Object.defineProperty(
      typeof object === 'function'
        ? Object.getPrototypeOf(object)
        : object,
      name, {
        // Whether the property can be deleted or changed.
        configurable,

        // Whether the property is visible in enumerations.
        enumerable,

        // Getter for the property.
        get(): Target[NameValue] | void {
          // Get indicator.
          const indicator = Object.getPrototypeOf(this)[indicatorSymbol][name];
          // Get names.
          const privateName = `${indicator['private']}${name}`;
          const getName = `${indicator['get']}${privateName}`;
          const getters = this[getName] as Set<GetterCallback<Target, NameValue>>;
          const previousValue = this[privateName] as Target[NameValue];
          getters.forEach(
            get => typeof get === 'function' &&
              (this[privateName] = get.call(this, name, this[privateName], previousValue, this))
          );
          // get if active
          const isActive = this[`active_${name}`];
          // Returns the private property value.
          return this[privateName];
        },

        // Setter for the property.
        set(value: Target[NameValue]) {
          // Get indicator.
          const indicator = Object.getPrototypeOf(this)[indicatorSymbol][name];
          // Property names.
          const privateName = `${indicator['private']}${name}` as NameValue;
          const setName = `${indicator['set']}${privateName}`;
          // Get the setter callback function.
          const setters = this[setName] as Set<SetterCallback<Target, NameValue>>;
          // Previous value.
          const previousValue = this[privateName] as Target[NameValue];
          // Perform setter from the `set` property.
          setters.forEach(
            set =>
              typeof set === 'function' && set.call(
                this,
                value,
                previousValue,
                privateName,
                this
              )
            );
          // Set value in the private property.
          this[privateName] = value;
        }

      }
    );
  }

  /**
   * @description
   * @public
   * @param {string} name 
   * @param {('' | 'descriptor' | 'get' | 'set')} [role=''] 
   * @returns {string} 
   */
  #getPropertyName(
    name: string,
    role: '' | 'descriptor' | 'get' | 'set' = ''
  ): string {
    return `${this.#indicator(role)}${this.#private}${name}`;
  }

  /**
   * @description
   * @public
   * @param {('' | 'descriptor' | 'get' | 'set')} [role=''] 
   * @returns {string} 
   */
  #indicator(role: '' | 'descriptor' | 'get' | 'set' = ''): string {
    switch(role) {
      case 'descriptor': return this.#descriptor;
      case 'get': return this.#get;
      case 'set': return this.#set;
      default: return '';
    };
  }

  // Property to store setter.
  #addSet(object: Obj, name: NameValue, set: SetterCallback<Target, NameValue> | undefined): this {
    this.#getPropertyName(name, 'set') in object
      ? Object.getPrototypeOf(object)[this.#getPropertyName(name, 'set')].add(set)
      : Object.defineProperty(
          Object.getPrototypeOf(object),
          this.#getPropertyName(name, 'set'), {
            configurable: false,
            enumerable: false,
            value: new Set([set]),
            writable: true
          }
        );
    return this;
  }

  // Property to store getter.
  #addGet(object: Obj, name: NameValue, get: GetterCallback<Target, NameValue> | undefined): this {
    this.#getPropertyName(name, 'get') in object
      ? Object.getPrototypeOf(object)[this.#getPropertyName(name, 'get')].add(get)
      : Object.defineProperty(
          Object.getPrototypeOf(object),
          this.#getPropertyName(name, 'get'), {
            configurable: false,
            enumerable: false,
            value: new Set([get]),
            writable: true
          }
        );
    return this;
  }

  // Property to store the private value.
  #setPrivate(
    object: Obj,
    name: NameValue
  ): this {
    this.#getPropertyName(name, '') in object
      ? Object.assign(
          Object.getPrototypeOf(object),
          { [this.#getPropertyName(name, '')]: (object as any)[name] }
        )
      : Object.defineProperty(
          Object.getPrototypeOf(object),
          this.#getPropertyName(name, ''), {
            configurable: false,
            enumerable: false,
            value: (typeof object === 'function'
              ? Object.getPrototypeOf(object)
              : object )[name],
            writable: true
          }
        );
    return this;
  }

  #defineIndicator(object: Obj, name: NameValue): this {
    // The property to store the indicator.
    indicatorSymbol in Object.getPrototypeOf(object) === false &&
      Object.defineProperty(
        Object.getPrototypeOf(object),
        indicatorSymbol, {
          configurable: false,
          enumerable: false,
          value: {},
          writable: true
        });
    name in Object.getPrototypeOf(object)[indicatorSymbol] === false &&
      Object.defineProperty(
        Object.getPrototypeOf(object)[indicatorSymbol],
        name, {
          configurable: false,
          enumerable: false,
          value: {
            active: this.#active,
            descriptor: this.#descriptor,
            get: this.#get,
            private: this.#private,
            set: this.#set
          },
          writable: true
        }
      );
    return this;
  }
}
