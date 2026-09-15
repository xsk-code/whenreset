import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import sharp from "sharp";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, "..");
const publicDir = path.resolve(rootDir, "public");
const svgPath = path.resolve(publicDir, "icon.svg");

async function generate() {
  console.log("Generating favicons and PWA icons from", svgPath);
  const svgBuffer = fs.readFileSync(svgPath);

  // 1. Generate PNGs of different sizes
  const sizes = [16, 32, 48, 180, 192, 512];
  const pngBuffers = {};

  for (const size of sizes) {
    pngBuffers[size] = await sharp(svgBuffer)
      .resize(size, size, { kernel: sharp.kernel.lanczos3 })
      .png()
      .toBuffer();
  }

  // 2. Write apple-touch-icon.png (180x180)
  fs.writeFileSync(path.resolve(publicDir, "apple-touch-icon.png"), pngBuffers[180]);
  console.log("✓ Generated public/apple-touch-icon.png (180x180)");

  // 3. Write PWA icons
  fs.writeFileSync(path.resolve(publicDir, "icon-192.png"), pngBuffers[192]);
  fs.writeFileSync(path.resolve(publicDir, "icon-512.png"), pngBuffers[512]);
  console.log("✓ Generated public/icon-192.png & public/icon-512.png");

  // 4. Create multi-size favicon.ico (containing 16x16, 32x32, 48x48 PNGs)
  const icoSizes = [16, 32, 48];
  const header = Buffer.alloc(6);
  header.writeUInt16LE(0, 0); // reserved
  header.writeUInt16LE(1, 2); // image type (1 = ico)
  header.writeUInt16LE(icoSizes.length, 4); // count

  let currentOffset = 6 + icoSizes.length * 16;
  const directoryEntries = [];
  const imageDatas = [];

  for (const size of icoSizes) {
    const pngData = pngBuffers[size];
    const entry = Buffer.alloc(16);
    entry.writeUInt8(size, 0); // width
    entry.writeUInt8(size, 1); // height
    entry.writeUInt8(0, 2); // color count
    entry.writeUInt8(0, 3); // reserved
    entry.writeUInt16LE(1, 4); // color planes
    entry.writeUInt16LE(32, 6); // bit count
    entry.writeUInt32LE(pngData.length, 8); // size
    entry.writeUInt32LE(currentOffset, 12); // offset

    directoryEntries.push(entry);
    imageDatas.push(pngData);
    currentOffset += pngData.length;
  }

  const icoBuffer = Buffer.concat([header, ...directoryEntries, ...imageDatas]);
  fs.writeFileSync(path.resolve(publicDir, "favicon.ico"), icoBuffer);
  console.log("✓ Generated public/favicon.ico (16x16, 32x32, 48x48)");

  // 5. Generate site.webmanifest
  const manifest = {
    name: "WhenReset — AI Quota Reset Radar",
    short_name: "WhenReset",
    description: "Real-time OpenAI Codex and Claude usage limit reset tracking, forecast countdowns, and developer alerts.",
    start_url: "/",
    display: "standalone",
    background_color: "#080B11",
    theme_color: "#080B11",
    icons: [
      {
        src: "/icon.svg",
        sizes: "any",
        type: "image/svg+xml",
      },
      {
        src: "/icon-192.png",
        sizes: "192x192",
        type: "image/png",
      },
      {
        src: "/icon-512.png",
        sizes: "512x512",
        type: "image/png",
      },
      {
        src: "/apple-touch-icon.png",
        sizes: "180x180",
        type: "image/png",
      },
    ],
  };

  fs.writeFileSync(
    path.resolve(publicDir, "site.webmanifest"),
    JSON.stringify(manifest, null, 2)
  );
  console.log("✓ Generated public/site.webmanifest");
}

generate().catch((err) => {
  console.error("Failed to generate favicons:", err);
  process.exit(1);
});
