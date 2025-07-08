// Interface.
import { WrappedPropertyDescriptor } from '../interface';

export abstract class WrapPropertyCore<
  T extends object | (new () => any),
  O extends Record<PropertyKey, any> = (T extends new () => T ? ( T extends { prototype: infer P } ? P : never) : T),
  K extends keyof O extends string | symbol ? keyof O : never = keyof O extends string | symbol ? keyof O : never,
  C extends boolean = boolean,
  E extends boolean = boolean,
  D extends WrappedPropertyDescriptor<O, K, C, E> = WrappedPropertyDescriptor<O, K, C, E>,
> {
  /**
   * @description Defaults for configurable.
   * @public
   * @static
   * @type {boolean}
   */
  public static configurable: boolean = true;

  /**
   * @description Defaults for enumerable.
   * @public
   * @static
   * @type {boolean}
   */
  public static enumerable: boolean = false;

  /**
   * @description The key of the property to wrap.
   * @protected
   * @abstract
   * @readonly
   * @type {K}
   */
  protected abstract get key(): K;

  /**
   * @description The private key used to store the value of the property.
   * @protected
   * @abstract
   * @readonly
   * @type {PropertyKey}
   */
  protected abstract get privateKey(): PropertyKey;

  /**
   * @description The target object of the property.
   * @protected
   * @abstract
   * @readonly
   * @type {T}
   */
  protected abstract get target(): T;
  
  /**
   * @description Unwraps the property using previous descriptor.
   * @public
   * @abstract
   * @returns {this} 
   */
  public abstract unwrap(): this;

  // Get the previous descriptor of the property.
  protected abstract getPreviousDescriptor(object: O, key: K): PropertyDescriptor | undefined;

  // Wraps the property with a private key.
  protected abstract wrap(object: O, key: K, descriptor: D): this;
}
