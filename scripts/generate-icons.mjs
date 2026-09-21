import { writeFileSync, mkdirSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import zlib from "node:zlib";

const __dirname = dirname(fileURLToPath(import.meta.url));
const iconsDir = join(__dirname, "..", "icons");
mkdirSync(iconsDir, { recursive: true });

function crc32(buffer) {
  let crc = 0xffffffff;
  for (const byte of buffer) {
    crc ^= byte;
    for (let i = 0; i < 8; i += 1) {
      crc = crc & 1 ? (crc >>> 1) ^ 0xedb88320 : crc >>> 1;
    }
  }
  return (crc ^ 0xffffffff) >>> 0;
}

function createChunk(type, data) {
  const length = Buffer.alloc(4);
  length.writeUInt32BE(data.length);
  const typeBuffer = Buffer.from(type);
  const crc = Buffer.alloc(4);
  crc.writeUInt32BE(crc32(Buffer.concat([typeBuffer, data])));
  return Buffer.concat([length, typeBuffer, data, crc]);
}

function createPng(size) {
  const width = size;
  const height = size;
  const raw = Buffer.alloc((width * 4 + 1) * height);

  for (let y = 0; y < height; y += 1) {
    const rowStart = y * (width * 4 + 1);
    raw[rowStart] = 0;
    for (let x = 0; x < width; x += 1) {
      const offset = rowStart + 1 + x * 4;
      const edge = x < 2 || y < 2 || x >= width - 2 || y >= height - 2;
      const center = x > width * 0.2 && x < width * 0.8 && y > height * 0.2 && y < height * 0.8;
      if (edge) {
        raw[offset] = 15;
        raw[offset + 1] = 23;
        raw[offset + 2] = 42;
        raw[offset + 3] = 255;
      } else if (center) {
        raw[offset] = 34;
        raw[offset + 1] = 197;
        raw[offset + 2] = 94;
        raw[offset + 3] = 255;
      } else {
        raw[offset] = 22;
        raw[offset + 1] = 163;
        raw[offset + 2] = 74;
        raw[offset + 3] = 255;
      }
    }
  }

  const signature = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]);
  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(width, 0);
  ihdr.writeUInt32BE(height, 4);
  ihdr[8] = 8;
  ihdr[9] = 6;
  ihdr[10] = 0;
  ihdr[11] = 0;
  ihdr[12] = 0;

  const idat = zlib.deflateSync(raw);
  return Buffer.concat([
    signature,
    createChunk("IHDR", ihdr),
    createChunk("IDAT", idat),
    createChunk("IEND", Buffer.alloc(0)),
  ]);
}

for (const size of [16, 48, 128]) {
  writeFileSync(join(iconsDir, `icon${size}.png`), createPng(size));
}

console.log("Icons generated in icons/");
