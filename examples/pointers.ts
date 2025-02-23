import { createPointer, readPointer, Types } from "../src/index.ts";

const buffer = new Uint8Array([1, 2, 3, 4]);
const pointer = await createPointer(buffer, { type: Types.Buffer, length: 4 });

const data = await readPointer(pointer, { type: Types.Buffer, length: 4 });
console.log(data);
