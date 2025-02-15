import type { Type } from "./types.d.ts";
import { detectRuntime } from "./utils.ts";
import { mapType } from "./open.ts";
import {
  funcConstructor,
  createPointer,
  unwrapPointer,
  freePointer,
  PointerType,
} from "ffi-rs";

type Definition = {
  params: Type[];
  returns: Type;
  threadSafe?: boolean;
};

export async function createCallback(
  definition: Definition,
  callback: () => void,
) {
  const runtime = detectRuntime();

  switch (runtime) {
    case "deno": {
      const denoDefinition = {
        parameters: definition.params.map(mapType),
        result: mapType(definition.returns),
      };

      if (definition.threadSafe) {
        const result = Deno.UnsafeCallback.threadSafe(denoDefinition, callback);
        return {
          ptr: result.pointer,
          close: () => result.close(),
        };
      }

      const result = new Deno.UnsafeCallback(denoDefinition, callback);
      return {
        ptr: result.pointer,
        close: () => result.close(),
      };
    }
    case "bun": {
      const bunDefinition = {
        args: definition.params.map(mapType),
        returns: mapType(definition.returns),
      };

      if (definition.threadSafe) bunDefinition["thresafe"] = true;

      const { JSCallback } = await import("bun:ffi");

      const result = new JSCallback(callback, bunDefinition);
      return {
        ptr: result.ptr,
        close: () => result.close(),
      };
    }
    case "node": {
      const funcDefinition = funcConstructor({
        paramsType: definition.params.map(mapType),
        retType: mapType(definition.returns),
      });

      const funcPointer = createPointer({
        paramsType: [funcDefinition],
        paramsValue: [callback],
      });

      return {
        ptr: unwrapPointer(funcPointer),
        close: () =>
          freePointer({
            paramsType: [
              funcConstructor({
                paramsType: definition.params.map(mapType),
                retType: mapType(definition.returns),
              }),
            ],
            paramsValue: funcPointer,
            pointerType: PointerType.RsPointer,
          }),
      };
    }
  }
}
