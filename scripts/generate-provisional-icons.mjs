// Generates the PROVISIONAL icon set from public/brand/provisional-mark.svg.
// Replace the source with the owner-approved square icon and re-run:
//   npm run icons
import { copyFile, readFile, writeFile } from "node:fs/promises";
import sharp from "sharp";

const source = "public/brand/provisional-mark.svg";
const svg = await readFile(source);
const png = (size) => sharp(svg, { density: 384 }).resize(size, size).png().toBuffer();

/** Minimal ICO container with embedded PNG images (supported by all modern browsers). */
function ico(images) {
  const header = Buffer.alloc(6);
  header.writeUInt16LE(0, 0);
  header.writeUInt16LE(1, 2);
  header.writeUInt16LE(images.length, 4);
  let offset = 6 + images.length * 16;
  const entries = images.map(({ size, data }) => {
    const entry = Buffer.alloc(16);
    entry.writeUInt8(size >= 256 ? 0 : size, 0);
    entry.writeUInt8(size >= 256 ? 0 : size, 1);
    entry.writeUInt16LE(1, 4); // colour planes
    entry.writeUInt16LE(32, 6); // bits per pixel
    entry.writeUInt32LE(data.length, 8);
    entry.writeUInt32LE(offset, 12);
    offset += data.length;
    return entry;
  });
  return Buffer.concat([header, ...entries, ...images.map((i) => i.data)]);
}

const sizes = [16, 32, 48];
const images = await Promise.all(
  sizes.map(async (size) => ({ size, data: await png(size) })),
);

await writeFile("src/app/favicon.ico", ico(images));
await writeFile("src/app/apple-icon.png", await png(180));
await copyFile(source, "src/app/icon.svg");
console.log("Provisional icons written: favicon.ico, icon.svg, apple-icon.png");
