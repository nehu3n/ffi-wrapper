import { getSuffix } from "./utils.ts";

export const suffix = getSuffix();
export { open } from "./open.ts";
export { Types } from "./types.ts";
export { createCallback } from "./callbacks.ts";
export {
  createPointer,
  readPointer,
  freePointer,
  wrapPointer,
  unwrapPointer,
  isNullPointer,
  arrayConstructor,
} from "./pointers.ts";
