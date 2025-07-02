
export interface PropertyAttributeType<
  Active extends boolean | undefined = boolean | undefined,
  Descriptors extends Set<PropertyDescriptor> | undefined = Set<PropertyDescriptor> | undefined,
  PrivateKey extends PropertyKey | undefined = PropertyKey | undefined,
> {
  active: Active,
  descriptors: Descriptors,
  privateKey: PrivateKey,
};
