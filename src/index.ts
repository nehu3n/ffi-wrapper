declare global {
  var Bun: any;
  var Deno: any;
}

function detectRuntime(): "deno" | "bun" | "node" {
  if (globalThis.Deno) {
    return "deno";
  } else if (globalThis.Bun) {
    return "bun";
  } else {
    return "node";
  }
}
