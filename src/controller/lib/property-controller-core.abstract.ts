// Type.
import { GetterCallback, SetterCallback } from "@typedly/callback";
import { PrototypeOf } from "../../type";
import { WrappedPropertyDescriptor } from "../../wrap";
// Interface.
// import { PropertyAttributeType } from "../../interface";


export abstract class PropertyControllerCore<
  Target extends object | (new () => any),
  T extends Record<PropertyKey, any> = (Target extends new () => Target ? PrototypeOf<Target> : Target),
  K extends keyof T extends string | symbol
  ? keyof T
  : never = keyof T extends string | symbol
    ? keyof T
    : never,
> {
  protected static controllerKey = '__controller__';

  /**
   * @description Whether controller is active.
   * If `true`, the property is wrapped and controlled by this controller.
   * If `false`, the property is not wrapped and controlled by this controller.
   * If `undefined`, the property is not controlled by this controller.
   * @abstract
   * @readonly
   * @type {(boolean | undefined)}
   */
  abstract get active(): boolean | undefined;

  /**
   * @description Set of property descriptors stored by this controller.
   * @abstract
   * @readonly
   * @type {(Set<PropertyDescriptor> | undefined)}
   */
  abstract get descriptors(): Set<PropertyDescriptor> | undefined;

  /**
   * @description The private key used to store the property in the object.
   * @abstract
   * @readonly
   * @type {(PropertyKey | undefined)}
   */
  abstract get privateKey(): PropertyKey | undefined;

  abstract get get(): PropertyDescriptor['get'] | undefined;
  abstract get set(): PropertyDescriptor['set'] | undefined;

  public get onGet(): GetterCallback<T, K> | undefined {
    return undefined; // default implementation
  }

  public get onSet(): SetterCallback<T, K> | undefined {
    return undefined; // default implementation
  }
  /**
   * @description The key of the property controlled by this controller.
   * This is the key of the property in the object.
   * It can be a string or a symbol.
   * This key is used to access the property in the object.
   * @public
   * @readonly
   * @type {K}
   */
  public get key(): K {
    return this.#key;
  }

  /**
   * @description The reference to the object controlled by this controller.
   * This is the object that contains the property controlled by this controller.
   * It can be an object or a class prototype.
   * This object is used to access the property controlled by this controller.
   * If the target is a class, this will be the prototype of the class.
   * @public
   * @readonly
   * @type {T}
   */
  public get object(): T {
    return this.#object;
  }

  #key: K;
  #object: T;

  constructor(
    target: Target,
    key: K,
    {
      active,
      get,
      onGet,
      privateKey,
      set,
      onSet,
    }: Partial<WrappedPropertyDescriptor<T, K>> & {
      get?: PropertyDescriptor['get'],
      set?: PropertyDescriptor['set'],
      onGet?: GetterCallback<T, K>,
      onSet?: SetterCallback<T, K>
    } & ThisType<T> = {}

  ) {
    this.#object = typeof target === 'function'
      ? (target as Function).prototype
      : target;
    this.#key = key;
    
    !(PropertyControllerCore.controllerKey in this.#object) && PropertyControllerCore.#defineController(this.#object);
    // !(key in this.#object) && PropertyControllerCore.#defineControllerProperty(this.#object, key);
  }

  abstract attach(): this;

  // Descriptors.
  abstract addDescriptor(descriptor: PropertyDescriptor): this;
  abstract getDescriptor(id: number): PropertyDescriptor;
  abstract removeDescriptor(id: number): this;

  // Active.
  /**
   * @description The method to check if the controller is active.
   * If the controller is active, it means that the property is wrapped and controlled by this controller.
   * If the controller is not active, it means that the property is not wrapped and controlled by this controller.
   * If the controller is undefined, it means that the property is not controlled by this controller.
   * @abstract
   * @returns {boolean} 
   */
  abstract isActive(): boolean;

  /**
   * @description The method to set the active state of the controller.
   * If the controller is set to active, it means that the property is wrapped and controlled by this controller.
   * If the controller is set to inactive, it means that the property is not wrapped and controlled by this controller.
   * If the controller is set to undefined, it means that the property is not controlled by this controller.
   * @abstract
   * @param {boolean} active 
   * @returns {this} 
   */
  abstract setActive(active: boolean): this;

  static #defineController<T extends object>(
    object: T,
  ): void {
    Object.defineProperty(
      this.getPrototypeOf(object),
      PropertyControllerCore.controllerKey, {
      value: {},
      writable: false,
      enumerable: false,
      configurable: false,
    });
  }

  // static #defineControllerProperty<T extends object, K extends PropertyKey>(
  //   object: T,
  //   key: K,
  // ): void {
  //   Object.defineProperty(
  //     (this.#getPrototypeOf(object) as any)[PropertyControllerCore.#controllerKey],
  //     key, {
  //       value: undefined,
  //       writable: false,
  //       enumerable: false,
  //       configurable: false,
  //     }
  //   );
  // }

  protected static getPrototypeOf(target: any): any {
    return Object.getPrototypeOf(Object.getPrototypeOf(
      typeof target === 'function' ? target.prototype : target
    ));
  }
}
