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

function getOS(): string {
  const runtime = detectRuntime();

  if (runtime == "node" || runtime == "bun") {
    return process.platform;
  } else {
    return Deno.build.os;
  }
}

function getSuffix(): "dll" | "dylib" | "so" {
  const platform = getOS();

  const osMapping: Record<string, "dll" | "dylib" | "so"> = {
    win32: "dll",
    windows: "dll",

    darwin: "dylib",
    linux: "so",
  };

  return osMapping[platform] || "so";
}
