import { WrapProperty } from "../lib";

const object = {
  firstName: 'Someone' as string,
  lastName: 'Someone surname',
  age: 227
};

let wrapped: any = new WrapProperty(object, 'firstName', {
  configurable: true,
  enumerable: true,
  get: (name, value) => (console.log(`Getting ${name}: ${value}`), value),
  set: (name, value) => (console.log(`Setting ${name}: ${value}`), value),
});

wrapped = undefined;

object.firstName = 'Mr Property'; // This will not throw an error because we are using a setter in WrapProperty

console.log(`wrapped: `, wrapped);
console.log(`object: `, object);
console.log(`object.firstName: `, object.firstName);

console.debug(`=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=`);

let wrapped1: any = new WrapProperty(object, 'firstName', {
  configurable: true,
  enumerable: true,
  get: (name, value) => (console.log(`Getting1 ${name}: ${value}`), value),
  set: (name, value) => (console.log(`Setting1 ${name}: ${value}`), value),
});

wrapped1 = undefined;

console.log(`wrapped1: `, wrapped1);
console.log(`object: `, object);
console.log(`object.firstName: `, object.firstName);
