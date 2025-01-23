export const Types = {
  // Integer numbers
  Int8: 0,
  Int16: 1,
  Int32: 2,
  Int64: 3,
  // Unsigned numbers
  UInt8: 4,
  UInt16: 5,
  UInt32: 6,
  UInt64: 7,
  // Float numbers
  Float32: 8,
  Float64: 9,
  // Others
  Boolean: 10,
  Char: 11,
  String: 12,
  Function: 13,
  Pointer: 14,
  Buffer: 15,
} as const;

type TypeValue<T> = T[keyof T];
export type Type = TypeValue<typeof Types>;

export type Symbols = {
  [key: string]: {
    params: Type[];
    returns: Type;
  };
};
