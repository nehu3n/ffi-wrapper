import { open, suffix, Types } from "../src/index.ts";

// Automatically complete the suffix depending on the operating system (.dll, .so, .dylib)
const lib = `lib.${suffix}`

const ffi = await open(lib, {
  "add": {
    params: [Types.Int32, Types.Int32],
    returns: Types.Int32
  }
});

console.log(ffi.symbols.add(1, 2)); // Output: 3
