// Symbol.
import { symbolicPropertiesSymbol } from "./symbolic-properties.symbol";
// Type.
import { PrototypeOf } from "../type";
/**
 * @description
 * @export
 * @class SymbolicProperties
 * @template {object | (new () => any)} Target 
 * @template {Record<PropertyKey, any>} [Obj=(Target extends new () => Target ? PrototypeOf<Target> : Target)] 
 * @template {keyof Obj extends string
 *   ? keyof Obj
 *   : never} [Name=keyof Obj extends string
 *     ? keyof Obj
 *     : never] 
 * @extends {Map<Name, Symbol>}
 */
export class SymbolicProperties<
  Target extends object | (new () => any),
  Obj extends Record<PropertyKey, any> = (Target extends new () => Target ? PrototypeOf<Target> : Target),
  Name extends keyof Obj extends string
  ? keyof Obj
  : never = keyof Obj extends string
    ? keyof Obj
    : never,
> extends Map<Name, Symbol> {
  public static inject<
    Target extends object | (new () => any),
    Obj extends Record<PropertyKey, any> = (Target extends new () => Target ? PrototypeOf<Target> : Target),
    Name extends keyof Obj extends string
    ? keyof Obj
    : never = keyof Obj extends string
      ? keyof Obj
      : never,
  >(target: Target): SymbolicProperties<Target, Obj, Name> {
    const object: Obj = (typeof target === 'function' ? target.prototype : target);
    Object.assign(object, { [symbolicPropertiesSymbol]: new SymbolicProperties(target)});
    return object[symbolicPropertiesSymbol];
  }

  #object: Obj;

  constructor(private target: Target) {
    super();
    this.#object = (typeof this.target === 'function'
      ? this.target.prototype
      : this.target);
  }

  public define(name: Name, descriptor: PropertyDescriptor & ThisType<any> = {}): this {
    Object.defineProperty(
      this.#object,
      super.get(name) as any,
      descriptor
    );
    return this;
  }

  public override delete(name: Name): boolean {
    if (super.has(name)) {
      const symbol = super.get(name);
      delete this.#object[symbol as any];
    }
    return super.delete(name);
  }

  public override set(name: Name, value: Symbol | string = Symbol(name)): this {
    super.set(name, typeof value === 'string' ? Symbol(value) : value);
    return this;
  }
}
