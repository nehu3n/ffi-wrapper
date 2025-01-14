<img src="./public/logo.png" width="170px" align="right" />

# FFI Wrapper

This library provides a **lightweight**, **optimized** and **simple** way to invoke FFI calls to libs in **NodeJS**, **Deno** and **Bun**. It abstracts the FFI API from each runtime into a single unified one.

```ts
import { open, suffix, Types } from "ffi-wrapper";

// Automatically complete the suffix depending on the operating system (.dll, .so, .dylib)
const lib = `lib.${suffix}`

const ffi = open(lib, {
    "add": [Types.Int32, Types.Int32],
});

console.log(ffi.add(1, 2)); // Output: 3
```

## 🚀 Installation

You can install this library using the following commands for each runtime:

### NodeJS

```sh
npm install ffi-wrapper
```

```sh
pnpm add ffi-wrapper
```

```sh
yarn add ffi-wrapper
```

### Deno

```sh
deno add npm:ffi-wrapper
```

### Bun

```sh
bun add ffi-wrapper
```

## 📖 Documentation

For more information, please refer to the [documentation](https://github.com/nehu3n/ffi-wrapper/wiki).

## 📄 License

This project is licensed under the [MIT License](./LICENSE).
