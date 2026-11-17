import sharp from "sharp";

const light = "artifacts/travel-services/te-light-1440.png";
const dark = "artifacts/travel-services/te-dark-1440.png";
const metadata = await sharp(light).metadata();
const darkMetadata = await sharp(dark).metadata();
await sharp({
  create: {
    width: metadata.width,
    height: metadata.height + darkMetadata.height,
    channels: 3,
    background: "white",
  },
})
  .composite([
    { input: light, left: 0, top: 0 },
    { input: dark, left: 0, top: metadata.height },
  ])
  .png()
  .toFile("artifacts/travel-services/te-light-dark-comparison.png");
console.log("Created paired light/dark Services comparison.");
