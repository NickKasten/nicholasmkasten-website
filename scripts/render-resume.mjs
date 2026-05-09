// Rasterize the newest resume PDF into high-resolution PNG pages so every
// browser (Safari, mobile included) sees a crisp image rather than a fit-to-page
// PDF viewer. Runs as a `prebuild` / `predev` hook so the output is on disk
// before Astro copies `public/` into `dist/`.

import fs from "node:fs";
import path from "node:path";
import { createRequire } from "node:module";
import { createCanvas } from "@napi-rs/canvas";

const require = createRequire(import.meta.url);
const pdfjsLib = require("pdfjs-dist/legacy/build/pdf.js");

const RESUME_DIR = "public/resume";
const GENERATED_DIR = path.join(RESUME_DIR, "_generated");
const SCALE = 2.5;

if (!fs.existsSync(RESUME_DIR)) {
  console.log(`[render-resume] no ${RESUME_DIR} directory; skipping`);
  process.exit(0);
}

const pdfs = fs
  .readdirSync(RESUME_DIR)
  .filter((f) => f.toLowerCase().endsWith(".pdf"))
  .map((f) => ({
    name: f,
    mtime: fs.statSync(path.join(RESUME_DIR, f)).mtimeMs,
  }))
  .sort((a, b) => b.mtime - a.mtime);

if (pdfs.length === 0) {
  console.log(`[render-resume] no PDF in ${RESUME_DIR}; skipping`);
  process.exit(0);
}

const resume = pdfs[0];
fs.mkdirSync(GENERATED_DIR, { recursive: true });

const baseName = resume.name.replace(/\.pdf$/i, "");
const pdfFullPath = path.join(RESUME_DIR, resume.name);
const pdfBytes = new Uint8Array(fs.readFileSync(pdfFullPath));

const standardFontDataUrl = path.join(
  process.cwd(),
  "node_modules/pdfjs-dist/legacy/build/standard_fonts/",
);
const fallbackFontDataUrl = path.join(
  process.cwd(),
  "node_modules/pdfjs-dist/standard_fonts/",
);
const fontDataUrl = fs.existsSync(standardFontDataUrl)
  ? standardFontDataUrl
  : fallbackFontDataUrl;

const pdf = await pdfjsLib.getDocument({
  data: pdfBytes,
  standardFontDataUrl: fontDataUrl,
  disableFontFace: true,
}).promise;

let regenerated = 0;
let cached = 0;

for (let i = 1; i <= pdf.numPages; i++) {
  const outName = `${baseName}-p${i}.png`;
  const outPath = path.join(GENERATED_DIR, outName);
  const isCached =
    fs.existsSync(outPath) &&
    fs.statSync(outPath).mtimeMs >= resume.mtime;

  if (isCached) {
    cached++;
    continue;
  }

  const page = await pdf.getPage(i);
  const viewport = page.getViewport({ scale: SCALE });
  const canvas = createCanvas(viewport.width, viewport.height);
  const ctx = canvas.getContext("2d");
  await page.render({ canvasContext: ctx, viewport }).promise;
  const buf = await canvas.encode("png");
  fs.writeFileSync(outPath, buf);
  regenerated++;
}

console.log(
  `[render-resume] ${resume.name}: ${pdf.numPages} pages (${regenerated} rendered, ${cached} cached)`,
);
