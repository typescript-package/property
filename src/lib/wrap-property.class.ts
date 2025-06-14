// Class.
// Type.
import { GetterCallback, SetterCallback } from '@typedly/callback';
import { PrototypeOf } from '../temp/type';
// Symbol.
import { indicatorSymbol } from './indicator.symbol';
/**
 * Creates an instance of `WrapProperty`.
 * @class
 * @classdesc Wrap the property in `object`.
 */
export class WrapProperty<
  Obj extends object | (new () => any),
  Target = (Obj extends new () => any ? PrototypeOf<Obj> : Obj),
  NameValue extends keyof Target extends string
  ? keyof Target
  : never = keyof Target extends string
    ? keyof Target
    : never,
> {

  #get = 'get';
  #private = '_';
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
    // The property to store the indicator.
    indicatorSymbol in Object.getPrototypeOf(object) === false &&
      Object.defineProperty(
        Object.getPrototypeOf(object),
        indicatorSymbol, {
          configurable: false,
          enumerable: false,
          value: {},
          writable: true
        }
      );

    // Define the indicator under specific name.
    name in Object.getPrototypeOf(object)[indicatorSymbol] === false &&
      Object.defineProperty(
        Object.getPrototypeOf(object)[indicatorSymbol],
        name, {
          configurable: false,
          enumerable: false,
          value: {
            private: this.#private,
            get: this.#get,
            set: this.#set
          },
          writable: true
        }
      );

    // Property to store the private value.
    this.getPropertyName(name, '') in object
      ? Object.assign(
          Object.getPrototypeOf(object),
          { [this.getPropertyName(name, '')]: (object as any)[name] }
        )
      : Object.defineProperty(
          Object.getPrototypeOf(object),
          this.getPropertyName(name, ''), {
            configurable: false,
            enumerable: false,
            value: (typeof object === 'function'
              ? Object.getPrototypeOf(object)
              : object )[name],
            writable: true
          }
        );

    // Property to store getter.
    this.getPropertyName(name, 'get') in object
      ? Object.assign(
          Object.getPrototypeOf(object),
          { [this.getPropertyName(name, 'get')]: get }
        )
      : Object.defineProperty(
          Object.getPrototypeOf(object),
          this.getPropertyName(name, 'get'), {
            configurable: false,
            enumerable: false,
            value: get,
            writable: true
          }
        );

    // Property to store setter.
    this.getPropertyName(name, 'set') in object
      ? Object.assign(
          Object.getPrototypeOf(object),
          { [this.getPropertyName(name, 'set')]: set }
      )
      : Object.defineProperty(
          Object.getPrototypeOf(object),
          this.getPropertyName(name, 'set'), {
            configurable: false,
            enumerable: false,
            value: set,
            writable: true
          }
        );

    // const prevDescriptor = Object.getOwnPropertyDescriptor(typeof object === 'function' ? Object.getPrototypeOf(object) : object, name);

    // Define the property getter and setter.
    Object.defineProperty(
      typeof object === 'function'
        ? Object.getPrototypeOf(object)
        : object
      ,
      name, {
        // Whether the property can be deleted or changed.
        configurable,

        // Whether the property is visible in enumerations.
        enumerable,

        // Getter for the property.
        get(): Target[NameValue] | void {
          const obj = (this as any);
          const indicator = this[indicatorSymbol][name];
          const privateName = `${indicator['private']}${name}`;
          const getName = `${indicator['get']}${privateName}`;
          const get = obj[getName] as GetterCallback<Target, NameValue>;

          // If a previous getter exists, call it to get the previous value
          // const prevValue = prevDescriptor?.get ? prevDescriptor.get.call(this) : obj[privateName];

          // Perform setter from the `get` property.
          return typeof get === 'function'
            ? get.call(obj, name, obj[privateName], undefined as any, obj)
            : obj[privateName];
        },

        // Setter for the property.
        set(value: Target[NameValue]) {
          const obj = (this as any);
          const indicator = this[indicatorSymbol][name];
          const privateName = `${indicator['private']}${name}`;
          const setName = `${indicator['set']}${privateName}`;
          const set = obj[setName] as SetterCallback<Target, NameValue>;

          // Perform setter from the `set` property.
          typeof set === 'function' && set.call(
            obj,
            value,
            obj[privateName],
            privateName as any,
            obj
          );

          // Set value in the private property.
          Object.getPrototypeOf(object)[privateName] = value;
        }

      }
    );
  }

  /**
   * @description
   * @public
   * @param {string} name 
   * @param {('' | 'get' | 'set')} [indicator=''] 
   * @returns {string} 
   */
  public getPropertyName(name: string, indicator: '' | 'get' | 'set' = ''): string {
    return `${this.indicator(indicator)}${this.#private}${name}`;
  }

  /**
   * @description
   * @public
   * @param {('' | 'get' | 'set')} [indicator=''] 
   * @returns {string} 
   */
  public indicator(indicator: '' | 'get' | 'set' = '') {
    switch(indicator) {
      case 'get': return this.#get;
      case 'set': return this.#set;
      default: return '';
    };
  }

  /**
   * @description Returns `PropDescriptor` instance of property `name`.
   * @param object Object to get `PropDescriptor` of property `name`.
   * @returns The returned value is an instance of `PropDescriptor`.
   */
  // public getPropertyDescriptor(object: Obj) {
  //   return Object.getPrototypeOf(object)[this.#name.role('descriptor')] as PropertyDescriptorChain<Obj>
  // }

  /**
   * @description Defines the active property, that indicates whether the property is active.
   * @param {Obj} object 
   * @returns {this} 
   */
  // #defineActive(object: Obj) {
  //   (this.#name.role('active') in object === false) &&
  //     Object.defineProperty(
  //       Object.getPrototypeOf(object),
  //       this.#name.role('active'), {
  //         configurable: false,
  //         enumerable: false,
  //         value: true,
  //         writable: true
  //       }
  //     );  
  //   return this;
  // }

  /**
   * @description Defines the descriptor property, that indicates the property descriptor.
   * @param {Obj} object 
   * @param {NameValue} name 
   * @returns {this} 
   */
  // Original descriptor.
  // #defineDescriptorProperty(object: Obj, name: NameValue) {
  //   if (this.#name.role('descriptor') in object) {
  //     this.getPropertyDescriptor(object).add();
  //   } else {
  //     Object.defineProperty(
  //       Object.getPrototypeOf(object),
  //       this.#name.role('descriptor'), {
  //         configurable: false,
  //         enumerable: false,
  //         value: new PropertyDescriptorChain(object, name),
  //         writable: true
  //       }
  //     );  
  //   }
  //   return this;
  // }

  /**
   * @description
   * @param {Obj} object 
   * @param {NameValue} name 
   * @returns {this} 
   */
  // #definePrivate(object: Obj, name: NameValue): this {
  //   const obj = Object.getPrototypeOf(object);
  //   if (`_${name}` in object) {
  //     Object.assign(obj, { [`_${name}`]: (object as any)[name] });
  //   } else {
  //     Object.defineProperty(
  //       obj,
  //       `_${name}`, {
  //         configurable: false,
  //         enumerable: false,
  //         value: (typeof object === 'function' ? Object.getPrototypeOf(object) : object)[name],
  //         writable: true
  //       }
  //     );  
  //   }  
  //   return this;
  // }




  // #defineProperty(
  //   object: Obj,
  //   name: NameValue,
  //   get?: GetterCallback<Target, NameValue>,
  //   set?: SetterCallback<Target, NameValue>,
  //   configurable = true,
  //   enumerable = false,
  // ) {
  //   const t = this;
  //   // TODO: Check.
  //   // const descriptorId = this.getPropertyDescriptor(object, name).size - 1;
  //   // const previousValue = (object as any)[t.getPropertyName('private', name)]
  //   Object.defineProperty(
  //     typeof object === 'function' ? Object.getPrototypeOf(object) : object,
  //     name, {
  //       configurable,
  //       enumerable,
  //       get(): Target[NameValue] {
  //         // Object.getPrototypeOf(object)[this.getPropertyName('descriptor', name)]

  //         // // perform original getter.
  //         // const propDescriptor = (this[`descriptor_${name}`] as PropertyDescriptorChain<Obj>);
  //         // const descriptor = propDescriptor.get(descriptorId);
  //         // const previousDescriptorValue = descriptor
  //         //   ? 'value' in descriptor
  //         //     ? descriptor.value
  //         //     : descriptor.get?.apply(this, arguments as any)
  //         //   : undefined;

  //         // // Use custom getter.
  //         // let value = typeof getterCallbackFn === "function" && this[`active_${name}`]
  //         //   ? getterCallbackFn.apply(this, [name, previousDescriptorValue, this[`_${name}`], this])
  //         //   : this[`_${name}`];

  //         return value;
  //       },
  //       set(value: Target[NameValue]){
  //         // // Previous value.
  //         // const previousValue = this[`_${name}`];

  //         // // Perform original setter.
  //         // (this[`descriptor_${name}`] as PropertyDescriptorChain<Obj>)
  //         //   .get(descriptorId)
  //         //   ?.set
  //         //   ?.apply(this, arguments as any);
    
  //         // // Use custom setter.
  //         // typeof setterCallbackFn === "function" && this[`active_${name}`] &&
  //         //   setterCallbackFn.apply(this, [value, previousValue, name, this]);

  //         // // Set value in the private property.
  //         // Object.getPrototypeOf(this)[`_${name}`] = value;
  //       }
  //     }
  //   );
  // }
}
