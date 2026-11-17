import { createHash } from "node:crypto";
import { readFile, writeFile } from "node:fs/promises";
import sharp from "sharp";

const source = "public/brand/sridevi-logo-dark.png";
const output = "public/brand/sridevi-logo-dark-integrated.png";
const expectedSourceHash =
  "3E6F48E4D44305A0B4C9253EA10A2EA485CBEB0D4B10EEF6ECCB48C48836C31A";

const sourceBytes = await readFile(source);
const sourceHash = createHash("sha256").update(sourceBytes).digest("hex").toUpperCase();
if (sourceHash !== expectedSourceHash) {
  throw new Error(`Refusing to process an unapproved dark logo: ${sourceHash}`);
}

const { data, info } = await sharp(sourceBytes)
  .raw()
  .toBuffer({ resolveWithObject: true });
if (info.channels !== 3)
  throw new Error(`Expected opaque RGB input; got ${info.channels}`);

// Sampled from unobstructed corners and outer edges of the approved source.
const background = [1, 8, 20];
const transparentAt = 0.018;
const opaqueAt = 0.14;
const rgba = Buffer.alloc(info.width * info.height * 4);

const smoothstep = (value) => value * value * (3 - 2 * value);
const clampByte = (value) => Math.max(0, Math.min(255, Math.round(value)));

for (let pixel = 0; pixel < info.width * info.height; pixel += 1) {
  const sourceOffset = pixel * 3;
  const outputOffset = pixel * 4;
  const rgb = [data[sourceOffset], data[sourceOffset + 1], data[sourceOffset + 2]];
  const distance =
    Math.max(
      Math.abs(rgb[0] - background[0]),
      Math.abs(rgb[1] - background[1]),
      Math.abs(rgb[2] - background[2]),
    ) / 255;

  let alpha = 0;
  if (distance > transparentAt) {
    const normalized = Math.min(
      1,
      (distance - transparentAt) / (opaqueAt - transparentAt),
    );
    alpha = Math.max(distance, smoothstep(normalized));
  }

  if (alpha === 0) {
    rgba[outputOffset] = 0;
    rgba[outputOffset + 1] = 0;
    rgba[outputOffset + 2] = 0;
    rgba[outputOffset + 3] = 0;
    continue;
  }

  // Remove the sampled background contribution from partially transparent
  // glow pixels. Fully opaque artwork retains the source RGB byte-for-byte.
  for (let channel = 0; channel < 3; channel += 1) {
    rgba[outputOffset + channel] = clampByte(
      (rgb[channel] - (1 - alpha) * background[channel]) / alpha,
    );
  }
  rgba[outputOffset + 3] = clampByte(alpha * 255);
}

const png = await sharp(rgba, {
  raw: { width: info.width, height: info.height, channels: 4 },
})
  .png({ compressionLevel: 9 })
  .toBuffer();
await writeFile(output, png);

const outputHash = createHash("sha256").update(png).digest("hex").toUpperCase();
console.log(JSON.stringify({ source, sourceHash, output, outputHash }, null, 2));
