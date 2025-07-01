import { WrapProperty } from "../lib/wrap-property.class";

export class TestObject {
  firstName = 'First name';
  lastName = 'Last name';
  age = 1000;
}

const object = new TestObject();

let wrapped1 = new WrapProperty(
  object,
  'firstName',
  {
    configurable: true,
    onGet: (name, value, previousValue) => {
      console.log(`Getting0 ${name} actual: ${value}, previous: ${previousValue}`);
      return value;
    },
    onSet: (value, previousValue, key) => {
      console.log(`Setting0 ${key} new value: ${value}, previous: ${previousValue}`);
      return value;
    },
    // privateKey: '_firstName',
  }
)

console.debug(`---`);

// console.debug(`Wrapped property:`, wrapped1);

object.firstName = 'Second name';
// // object.firstName;


console.debug(`object: `, object);

// // --- class test ---

const wrapped2 = new WrapProperty(
  object,
  'firstName',
  {
    configurable: true,
    // enumerable: true,
    onGet: (name, value, previousValue) => {
      console.log(`Getting1 ${name} actual: ${value}, previous: ${previousValue}`);
      return value;
    },
    onSet: (value, previousValue, key) => {
      console.log(`Setting1 ${key} new value: ${value}, previous: ${previousValue}`);
      return value;
    }
  }
);


object.firstName = 'Third name';
// // object.firstName;

// console.debug(`---`);

const wrapped3 = new WrapProperty(
  object,
  'firstName',
  {
    configurable: true,
    enumerable: true,
    onGet: (name, value, previousValue) => {
      console.log(`Getting2 ${name} actual: ${value}, previous: ${previousValue}`);
      return value;
    },
    onSet: (value, previousValue, key) => {
      console.log(`Setting2 ${key} new value: ${value}, previous: ${previousValue}`);
      return value;
    }
  }
);

object.firstName = 'Fourth name';

// console.debug(`---`);

// const wrapped4 = new WrapProperty(
//   object,
//   'firstName',
//   {
//     configurable: true,
//     enumerable: true,
//     onGet: (name, value, previousValue) => {
//       console.log(`Getting3 ${name} actual: ${value}, previous: ${previousValue}`);
//       return value;
//     },
//     onSet: (value, previousValue, key, t) => {
//       console.log(`Setting3 ${key} new value: ${value}, previous: ${previousValue}`);
//       return value;
//     }
//   }
// );

// object.firstName = 'Fifth name';

// console.debug(`---`);

// wrapped4.unwrap();


// object.firstName = 'Sixth name';

// console.debug(`---`);
