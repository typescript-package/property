// Interface.
import { PropertyAttributeType } from "../interface";

export class PropertyAttribute {
  static #key = '__attribute__';

  public static define<T extends object, K extends keyof T extends symbol | string ? keyof T : never = keyof T extends symbol | string ? keyof T : never>(
    object: T,
    key: K,
    attribute: Partial<PropertyAttributeType>,
  ): void {
    // Ensure the prototype has the __attribute__ property
    !(PropertyAttribute.#key in object) && this.#defineAttribute(object);
    // Ensure the specific key exists in the __attribute__ object
    !this.exists(object, key) && this.#defineAttributeKey(object, key);
    // Assign the attribute to the specific key
    Object.assign(
      this.get(object, key) || {},
      attribute
    );
  }

  public static exists<T extends object, K extends PropertyKey>(
    object: T,
    key: K,
  ): boolean {
    return Object.prototype.hasOwnProperty.call(
      (this.#getPrototypeOf(object) as any)[PropertyAttribute.#key],
      key
    );
  }

  public static get<T, K extends keyof T>(
    o: T,
    key: K,
    // attribute?: keyof PropertyAttribute
  ): PropertyAttributeType | undefined {
    return Object.getPrototypeOf(Object.getPrototypeOf(o))[PropertyAttribute.#key]?.[key];
  }

  static #defineAttribute<T extends object>(
    object: T,
  ): void {
    Object.defineProperty(
      this.#getPrototypeOf(object),
      PropertyAttribute.#key, {
      value: {},
      writable: false,
      enumerable: false,
      configurable: false,
    });
  }

  static #defineAttributeKey<T extends object, K extends PropertyKey>(
    object: T,
    key: K,
  ): void {
    Object.defineProperty(
      (this.#getPrototypeOf(object) as any)[PropertyAttribute.#key],
      key, {
        value: {},
        writable: false,
        enumerable: false,
        configurable: false,
      }
    );
  }

  static #getPrototypeOf<T extends object>(object: T): T {
    return Object.getPrototypeOf(Object.getPrototypeOf(object));
  }
}
