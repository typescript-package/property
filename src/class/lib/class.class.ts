// Type.
import { ValidationCallback } from "@typedly/callback";

export class Class {
  /**
   * 
   * @param value 
   * @returns 
   */
  public static is(value: any) {
    return typeof value === 'function' &&
      Object.prototype.toString.call(value).slice(8, -1).toLowerCase() === 'function' &&
      (value as any) instanceof Function
    ? /class/.test(Function.prototype.toString.call(value).slice(0, 5)) : false;
  }

  /**
   * 
   * @param cls 
   * @param callbackFn 
   * @param payload 
   * @returns 
   */
  public static guard<Class extends object, Payload extends object = object>(
    cls: Class,
    callbackFn?: ValidationCallback,
    payload?: Payload
  ) {
    const result = this.is(cls);
    return (callbackFn && callbackFn(result, cls, payload)) || result;
  }

}
