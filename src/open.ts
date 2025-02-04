import type { Symbols, Type } from "./types.d.ts";
import { DataType, open as nodeOpen, define, close as nodeClose } from "ffi-rs";
import { detectRuntime } from "./utils.ts";

const DenoTypes: { [key: number]: string } = {
  0: "i8",
  1: "i16",
  2: "i32",
  3: "i64",
  4: "u8",
  5: "u16",
  6: "u32",
  7: "u64",
  8: "f32",
  9: "f64",
  10: "bool",
  12: "buffer",
  13: "function",
  14: "pointer",
  15: "buffer"
} as const;

let BunTypes: { [key: number]: any } | null = null;

if (detectRuntime() === "bun") {
  const { FFIType } = await import("bun:ffi");
  BunTypes = {
    0: FFIType.i8,
    1: FFIType.i16,
    2: FFIType.i32,
    3: FFIType.i64,
    4: FFIType.u8,
    5: FFIType.u16,
    6: FFIType.u32,
    7: FFIType.u64,
    8: FFIType.f32,
    9: FFIType.f64,
    10: FFIType.bool,
    11: FFIType.char,
    12: FFIType.cstring,
    13: FFIType.function,
    14: FFIType.ptr,
    15: FFIType.buffer
  } as const;
}

const NodeTypes: { [key: number]: DataType } = {
  0: DataType.I16,
  1: DataType.I16,
  2: DataType.I32,
  3: DataType.I64,
  4: DataType.U8,
  5: DataType.U64,
  6: DataType.U64,
  7: DataType.U64,
  8: DataType.Float,
  9: DataType.Double,
  10: DataType.Boolean,
  11: DataType.WString,
  12: DataType.String,
  13: DataType.Function,
  14: DataType.External,
  15: DataType.U8Array
} as const;

function mapType(wrapperType: Type): string | any {
  const runtime = detectRuntime();

  switch (runtime) {
    case "deno":
      return DenoTypes[wrapperType];
    case "bun":
      if (!BunTypes) throw new Error("BunTypes not initialized");
      return BunTypes[wrapperType];
    case "node":
      return NodeTypes[wrapperType];
    default:
      throw new Error(`Unsupported runtime: ${runtime}`);
  }
}


export async function open(libPath: string, symbols: Symbols) {
  const runtime = detectRuntime();

  switch (runtime) {
    case "deno": {
      const denoSymbols = Object.fromEntries(
        Object.entries(symbols).map(([key, { params, returns }]) => [
          key,
          {
            parameters: params.map(mapType),
            result: mapType(returns),
          },
        ])
      );
      const lib = Deno.dlopen(libPath, denoSymbols);

      return {
        symbols: lib.symbols,
        close: lib.close,
      }
    }
    case "bun": {
      const { dlopen } = await import("bun:ffi");

      const bunSymbols = Object.fromEntries(
        Object.entries(symbols).map(([key, { params, returns }]) => [
          key,
          {
            args: params.map(mapType),
            returns: mapType(returns),
          },
        ])
      );

      const lib = dlopen(libPath, bunSymbols);

      return {
        symbols: lib.symbols,
        close: lib.close,
      };
    }
    case "node": {
      nodeOpen({
        library: libPath,
        path: libPath,
      });

      const nodeSymbols = Object.fromEntries(
        Object.entries(symbols).map(([key, { params, returns }]) => [
          key,
          {
            library: libPath,
            retType: mapType(returns),
            paramsType: params.map(mapType),
          },
        ])
      );

      const wrappedSymbols = Object.fromEntries(
        Object.entries(define(nodeSymbols)).map(([key, fn]) => [
          key,
          (...args: any[]) => fn(args),
        ])
      );

      return {
        symbols: wrappedSymbols,
        close: () => nodeClose(libPath),
      };
    }
    default:
      throw new Error(`Unsupported runtime: ${runtime}`);
  }
}
