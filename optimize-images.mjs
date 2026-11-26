import sharp from "sharp";
import fs from "fs";
import path from "path";

const INPUT = "./public/images";
const OUTPUT = "./public/images-optimized";
const MAX_WIDTH = 1080;
const QUALITY = 75;

async function walk(dir) {
  for (const file of fs.readdirSync(dir)) {
    const full = path.join(dir, file);
    if (fs.statSync(full).isDirectory()) {
      await walk(full);
      continue;
    }
    if (!/\.(webp|png|jpe?g)$/i.test(file)) continue;

    const rel = path.relative(INPUT, full);
    const dest = path.join(OUTPUT, rel.replace(/\.(png|jpe?g)$/i, ".webp"));
    fs.mkdirSync(path.dirname(dest), { recursive: true });

    try {
      const before = fs.statSync(full).size;
      const buffer = await sharp(fs.readFileSync(full))
        .resize({ width: MAX_WIDTH, withoutEnlargement: true })
        .webp({ quality: QUALITY, effort: 6 })
        .toBuffer();

      // se não ficou menor, copia o original
      const final = buffer.length < before ? buffer : fs.readFileSync(full);
      fs.writeFileSync(dest, final);
      console.log(`✔ ${rel}: ${(before / 1024).toFixed(0)}KB → ${(final.length / 1024).toFixed(0)}KB`);
    } catch (err) {
      console.log(`✖ ${rel}: ${err.message}`);
    }
  }
}

await walk(INPUT);
console.log("\nPronto! Confira a pasta public/images-optimized");



/* Rode de novo: node optimize-images.mjs  */