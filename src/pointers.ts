import { detectRuntime } from "./utils.ts";
import type { Type } from "./types.d.ts";
import { mapType } from "./open.ts";
import {
  createPointer as nodeCreatePointer,
  restorePointer as nodeRestorePointer,
  unwrapPointer as nodeUnwrapPointer,
  wrapPointer as nodeWrapPointer,
  freePointer as nodeFreePointer,
  arrayConstructor,
  DataType,
} from "ffi-rs";

type PointerOptions = {
  type: Type;
  length?: number;
};

export async function createPointer(
  value: ArrayBuffer | TypedArray,
  options: PointerOptions,
) {
  const runtime = detectRuntime();
  switch (runtime) {
    case "deno": {
      return Deno.UnsafePointer.of(value);
    }
    case "bun": {
      const { ptr } = await import("bun:ffi");
      return ptr(value);
    }
    case "node": {
      return nodeCreatePointer({
        paramsType: [DataType.U8Array],
        paramsValue: [new Uint8Array(value)],
      });
    }
  }
}

export async function readPointer(pointer: any, options: PointerOptions) {
  const runtime = detectRuntime();
  let ab: ArrayBuffer | SharedArrayBuffer;

  switch (runtime) {
    case "deno": {
      if (pointer === null) return null;
      ab = new Deno.UnsafePointerView(pointer).getArrayBuffer(
        options.length || 0,
      );
      break;
    }
    case "bun": {
      const { toArrayBuffer } = await import("bun:ffi");
      ab = toArrayBuffer(pointer, 0, options.length);
      break;
    }
    case "node": {
      const rawResult = nodeRestorePointer({
        retType: [
          arrayConstructor({
            type: DataType.U8Array,
            length: options.length || 0,
          }),
        ],
        paramsValue: pointer,
      });
      const [nodeBuf] = rawResult as unknown as [Buffer];
      ab = nodeBuf.buffer.slice(
        nodeBuf.byteOffset,
        nodeBuf.byteOffset + nodeBuf.byteLength,
      );
      break;
    }
  }

  return { buffer: ab, byteLength: ab.byteLength };
}

export async function freePointer(pointer: any, options: PointerOptions) {
  const runtime = detectRuntime();
  switch (runtime) {
    case "deno":
      break;
    case "bun":
      break;
    case "node":
      nodeFreePointer({
        paramsType: [
          arrayConstructor({
            type: mapType(options.type),
            length: options.length || 0,
          }),
        ],
        paramsValue: pointer,
        pointerType: mapType(options.type),
      });
      break;
  }
}

export async function wrapPointer(pointer: any): Promise<any> {
  const runtime = detectRuntime();
  switch (runtime) {
    case "deno":
      return pointer;
    case "bun":
      return pointer;
    case "node":
      return nodeWrapPointer([pointer])[0];
  }
}

export async function unwrapPointer(pointer: any): Promise<any> {
  const runtime = detectRuntime();
  switch (runtime) {
    case "deno":
      return pointer;
    case "bun":
      return pointer;
    case "node":
      return nodeUnwrapPointer([pointer])[0];
  }
}

export async function isNullPointer(pointer: any): Promise<boolean> {
  const runtime = detectRuntime();
  switch (runtime) {
    case "deno":
      return pointer === null;
    case "bun":
      return pointer === 0 || pointer === null;
    case "node":
      return pointer === null;
  }
  return false;
}

export { arrayConstructor };
