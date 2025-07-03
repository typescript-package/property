// Class.
import { PropertyAttribute } from "../../attribute";
// Abstract.
import { PropertyControllerCore } from "./property-controller-core.abstract";
// Type.
import { GetterCallback, SetterCallback } from '@typedly/callback';
import { PrototypeOf } from "../../type";
// Interface.
import { PropertyAttributeType } from "../../attribute";


export class PropertyController<
  Target extends object | (new () => any),
  T extends Record<PropertyKey, any> = (Target extends new () => Target ? PrototypeOf<Target> : Target),
  K extends keyof T extends string | symbol
  ? keyof T
  : never = keyof T extends string | symbol
    ? keyof T
    : never,
> extends PropertyControllerCore<Target, T, K> {

  public static attach<
    Target extends object | (new () => any),
    T extends Record<PropertyKey, any> = (Target extends new () => Target ? PrototypeOf<Target> : Target),
    K extends keyof T extends string | symbol
    ? keyof T
    : never = keyof T extends string | symbol
      ? keyof T
      : never,
  >(target: Target, controller: PropertyController<Target, T, K>) {
    Object.assign(
      super.getPrototypeOf(target)[super.controllerKey],
      { [controller.key]: controller }
    );
    return this;
  }

  public static create<
    Target extends object | (new () => any),
    T extends Record<PropertyKey, any> = (Target extends new () => Target ? PrototypeOf<Target> : Target),
    K extends keyof T extends string | symbol
    ? keyof T
    : never = keyof T extends string | symbol
      ? keyof T
      : never,
  >(
    target: Target,
    key: K,
    { active, descriptors, privateKey }: Partial<PropertyAttributeType>
  ): PropertyController<Target, T, K> {
    return new this(target, key, { active, descriptors, privateKey });
  }

  public static exists<
    Target extends object | (new () => any),
    T extends Record<PropertyKey, any> = (Target extends new () => Target ? PrototypeOf<Target> : Target),
    K extends keyof T extends string | symbol
    ? keyof T
    : never = keyof T extends string | symbol
      ? keyof T
      : never,
  >(target: Target, key: K): boolean {
    return Object.prototype.hasOwnProperty.call(
      this.#controller(target, key),
      key
    );
  }

  public static get<
    Target extends object | (new () => any),
    T extends Record<PropertyKey, any> = (Target extends new () => Target ? PrototypeOf<Target> : Target),
    K extends keyof T extends string | symbol
    ? keyof T
    : never = keyof T extends string | symbol
      ? keyof T
      : never,
  >(
    target: Target,
    key: K,
  ): PropertyController<Target, T, K> | undefined {
    return this.#controller(target, key)?.[key] as PropertyController<Target, T, K> | undefined;
  }

  public static set<
    Target extends object | (new () => any),
    T extends Record<PropertyKey, any> = (Target extends new () => Target ? PrototypeOf<Target> : Target),
    K extends keyof T extends string | symbol
    ? keyof T
    : never = keyof T extends string | symbol
      ? keyof T
      : never,
  >(target: Target, key: K, { active, descriptors, privateKey }: Partial<PropertyAttributeType> = {}) {
    Object.assign(
      super.getPrototypeOf(target)[super.controllerKey],
      { [key]: this.create(target, key, { active, descriptors, privateKey }) }
    );
    return this;
  }

  static #controller<
    Target extends object | (new () => any),
    T extends Record<PropertyKey, any> = (Target extends new () => Target ? PrototypeOf<Target> : Target),
    K extends keyof T extends string | symbol
    ? keyof T
    : never = keyof T extends string | symbol
      ? keyof T
      : never,
  >(target: Target, key?: K): Record<K, PropertyController<Target, T, K>> | undefined {
    return super.getPrototypeOf(target)[super.controllerKey];
  };

  public get active() {
    return PropertyAttribute.get(super.object, super.key)?.active || false;
  }

  public get descriptors() {
    return PropertyAttribute.get(super.object, super.key)?.descriptors;
  }

  public get privateKey() {
    return PropertyAttribute.get<T, K>(super.object, super.key)!.privateKey;
  }

  public get get(): PropertyDescriptor['get'] | undefined {
    return this.#get;
  }

  public get set(): PropertyDescriptor['set'] | undefined {
    return this.#set;
  }

  #get?: PropertyDescriptor['get'];
  #set?: PropertyDescriptor['set'];

  constructor(
    target: Target,
    key: K,
    {
      active,
      descriptors,
      get,
      getter,
      privateKey,
      set,
      setter,
    }: Partial<PropertyAttributeType> & {
      get?: PropertyDescriptor['get'],
      set?: PropertyDescriptor['set'],
      getter?: GetterCallback<T, K>,
      setter?: SetterCallback<T, K>
    } & ThisType<T & {controller: Record<K, PropertyController<Target, T, K>>}> = {}
  ) {
    super(target, key);
    this.#get = get;
    this.#set = set;
    PropertyAttribute.define((typeof target === 'function' ? target.prototype : target) as T, key, { active, descriptors, privateKey });
  }

  public activate(): this {
    this.setActive(true);
    return this;
  }

  public attach(): this {
    PropertyController.attach(super.object, this);
    return this;
  }

  public addDescriptor(descriptor: PropertyDescriptor): this {
    PropertyAttribute.get(super.object, super.key)!.descriptors?.add(descriptor);
    return this;
  }

  public deactivate(): this {
    this.setActive(false);
    return this;
  }

  public getDescriptor(id: number): PropertyDescriptor {
    return [...PropertyAttribute.get(super.object, super.key)!.descriptors!][id];
  }

  public isActive(): boolean {
    return PropertyAttribute.get(super.object, super.key)!.active || false;
  }

  public removeDescriptor(id: number): this {
    const attribute = PropertyAttribute.get(super.object, super.key);
    if (attribute) {
      const descriptor = [...attribute.descriptors!][id];
      descriptor && attribute.descriptors!.delete(descriptor);
    }
    return this;
  }

  public setActive(active: boolean): this {
    PropertyAttribute.get(super.object, super.key)!.active = active;
    return this;
  }
}
