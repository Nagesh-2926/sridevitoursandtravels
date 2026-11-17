import fs from "node:fs/promises";
import sharp from "sharp";
const routes = ["home", "services", "about", "location", "contact", "modal"];
for (const theme of ["light", "dark"]) {
  const tiles = await Promise.all(
    routes
      .filter((r) => r !== "modal")
      .map(async (route) => {
        const input = await sharp(
          `artifacts/global-theme-after/${theme}-en-${route}-1440.png`,
        )
          .resize({ width: 300 })
          .png()
          .toBuffer();
        return { input, height: (await sharp(input).metadata()).height };
      }),
  );
  await sharp({
    create: {
      width: 1500,
      height: Math.max(...tiles.map((t) => t.height)),
      channels: 3,
      background: theme === "light" ? "white" : "#0b0f14",
    },
  })
    .composite(tiles.map((tile, i) => ({ input: tile.input, left: i * 300, top: 0 })))
    .png()
    .toFile(`artifacts/global-theme-${theme}-overview.png`);
}
const comparisons = [];
for (const locale of ["en", "te"]) {
  for (const route of routes.filter((r) => r !== "modal")) {
    for (const width of [375, 1440]) {
      // The top 500px exclude intentionally changed contact details/footer.
      const name = `dark-${locale}-${route}-${width}.png`;
      const read = (phase) =>
        sharp(`artifacts/global-theme-${phase}/${name}`)
          .extract({ left: 0, top: 0, width, height: 500 })
          .removeAlpha()
          .raw()
          .toBuffer();
      const [before, after] = await Promise.all([read("before"), read("after")]);
      let changed = 0;
      for (let i = 0; i < before.length; i += 3)
        if (
          before[i] !== after[i] ||
          before[i + 1] !== after[i + 1] ||
          before[i + 2] !== after[i + 2]
        )
          changed++;
      comparisons.push({
        name,
        comparedRegion: `${width}x500`,
        changedPixels: changed,
        totalPixels: width * 500,
      });
      if (changed)
        await sharp({ create: { width, height: 1000, channels: 3, background: "white" } })
          .composite([
            {
              input: await sharp(before, { raw: { width, height: 500, channels: 3 } })
                .png()
                .toBuffer(),
              top: 0,
              left: 0,
            },
            {
              input: await sharp(after, { raw: { width, height: 500, channels: 3 } })
                .png()
                .toBuffer(),
              top: 500,
              left: 0,
            },
          ])
          .png()
          .toFile(`artifacts/compare-${name}`);
    }
  }
}
await fs.writeFile(
  "artifacts/global-theme-comparison.json",
  JSON.stringify(comparisons, null, 2) + "\n",
);
const rows = [];
for (const theme of ["light", "dark"])
  for (const locale of ["en", "te"])
    for (const route of routes) {
      const links = (phase, width) =>
        `<a href="global-theme-${phase}/${theme}-${locale}-${route}-${width}.png">${phase} ${width}px</a>`;
      rows.push(
        `<tr><td>${theme}</td><td>${locale}</td><td>${route}</td><td>${links("before", 375)} · ${links("after", 375)}</td><td>${links("before", 1440)} · ${links("after", 1440)}</td></tr>`,
      );
    }
await fs.writeFile(
  "artifacts/global-theme-gallery.html",
  `<!doctype html><html lang="en"><meta charset="utf-8"><meta name="viewport" content="width=device-width"><title>Sridevi website verification</title><style>body{font:16px system-ui;color:#14263d;background:#f4f7fb;margin:24px}table{border-collapse:collapse;width:100%;background:white}th,td{text-align:left;padding:12px;border:1px solid #d6dfe9}a{color:#1756a9}main{overflow:auto}</style><h1>Website screenshots: before and after</h1><p>Actual production browser captures. Each full-page image includes the header, content and footer. Modal images show the visible scrollable dialog.</p><main><table><thead><tr><th>Theme</th><th>Language</th><th>Page</th><th>Mobile</th><th>Desktop</th></tr></thead><tbody>${rows.join("")}</tbody></table></main></html>`,
);
console.log(JSON.stringify(comparisons));
