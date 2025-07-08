import { AccessorPropertyDescriptor } from '@typedly/descriptor';
import { GetterCallback, SetterCallback } from '@typedly/callback';

export interface WrappedPropertyDescriptor<
  O,
  K extends keyof O,
  A extends boolean = boolean,
  C extends boolean = boolean,
  E extends boolean = boolean,
> extends AccessorPropertyDescriptor<O[K], C, E> {
  /**
   * @description Whether the property descriptor `onGet` and `onSet` callbacks are active.
    * @type {?(A | {onGet?: boolean; onSet?: boolean})}
   */
  active?: A | {onGet?: boolean; onSet?: boolean};

  /**
   * @description The key used to access the property in the object.
   * @type {?PropertyKey}
   */
  privateKey?: PropertyKey;

  /**
   * @description The callback function that is called when the property is accessed.
   * @type {?GetterCallback<O, K>}
   */
  onGet?: GetterCallback<O, K>;

  /**
   * @description The callback function that is called when the property is set.
   * @type {?SetterCallback<O, K>}
   */
  onSet?: SetterCallback<O, K>;
}
