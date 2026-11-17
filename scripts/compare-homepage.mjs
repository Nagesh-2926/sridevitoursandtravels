import sharp from "sharp";
import fs from "node:fs/promises";
// The reference contains two different-height homepage panels. Compare each
// independently at its native dimensions, normalizing only the captured region.
const results = [];
for (const [theme, top, height] of [
  ["light", 0, 485],
  ["dark", 485, 456],
]) {
  const reference = await sharp("public/art/travel-reference.png")
    .extract({ left: 0, top, width: 1672, height })
    .png()
    .toBuffer();
  await fs.writeFile(`artifacts/reference-${theme}.png`, reference);
  const actual = await sharp(`artifacts/${theme}-showcase.png`)
    .resize(1672, height, { fit: "fill" })
    .png()
    .toBuffer();
  await fs.writeFile(`artifacts/normalized-${theme}.png`, actual);
  await sharp({
    create: { width: 1672, height: height * 2, channels: 3, background: "#fff" },
  })
    .composite([
      { input: reference, top: 0, left: 0 },
      { input: actual, top: height, left: 0 },
    ])
    .png()
    .toFile(`artifacts/comparison-${theme}.png`);
  const a = await sharp(reference).removeAlpha().raw().toBuffer();
  const b = await sharp(actual).removeAlpha().raw().toBuffer();
  const diff = Buffer.alloc(a.length);
  let sum = 0;
  for (let i = 0; i < a.length; i++) {
    const d = Math.abs(a[i] - b[i]);
    sum += d;
    diff[i] = Math.min(255, d * 3);
  }
  await sharp(diff, { raw: { width: 1672, height, channels: 3 } })
    .png()
    .toFile(`artifacts/diff-${theme}.png`);
  results.push({
    theme,
    width: 1672,
    height,
    meanAbsoluteChannelDifference: sum / a.length,
    normalizedMeanDifference: sum / a.length / 255,
    method:
      "Reference above actual in contact sheet; actual showcase height normalized to reference. Diff amplified 3x. This is not a pixel-perfect score.",
  });
}
await fs.writeFile(
  "artifacts/comparison-results.json",
  JSON.stringify(results, null, 2) + "\n",
);
