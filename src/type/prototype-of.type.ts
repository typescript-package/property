export type PrototypeOf<T> = T extends { prototype: infer P } ? P : never;
