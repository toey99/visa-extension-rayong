// =============================================================
// Rayong TM.7 page-3 coordinate-tuning preview
// =============================================================
// Loads public/templates/tm7-rayong.pdf, draws the page-3 fields from
// src/lib/tm7-page3-fields.ts (PAGE3_FIELDS) with dummy data, and
// writes preview-rayong.pdf in the project root.
//
// Usage (from the project root):
//   npm run preview                                  # = --page 3 --grid
//   node scripts/preview-rayong.mts                  # all 3 pages, no grid
//   node scripts/preview-rayong.mts --page 3 --grid --title MISS
//
// Flags:
//   --page N     output only page N (1-based)
//   --grid       overlay a coordinate grid (10 pt fine, 50 pt bold, labels)
//   --title T    MR. | MRS. | MISS (default MR.) — picks the title strike
//
// Tuning loop: edit PAGE3_FIELDS → npm run preview → open the PDF.
// =============================================================

import fs from "fs";
import path from "path";
import { PDFDocument, PDFPage, PDFFont, StandardFonts, rgb } from "pdf-lib";
import fontkit from "@pdf-lib/fontkit";
import {
  PAGE3_INDEX,
  PAGE3_LINE_THICKNESS,
  PAGE3_TITLE_STRIKES,
  page3TextOps,
  type Page3Values,
  type Title,
} from "../src/lib/tm7-page3-fields.ts";

// ── Args ─────────────────────────────────────────────────────
const argv = process.argv.slice(2);
const flag = (name: string) => argv.includes(name);
const opt = (name: string) => {
  const i = argv.indexOf(name);
  return i >= 0 ? argv[i + 1] : undefined;
};

const pageArg = opt("--page");
const onlyPage = pageArg ? Number(pageArg) : undefined;
const grid = flag("--grid");
const titleArg = (opt("--title") || "MR.").toUpperCase();
const titles: Title[] = ["MR.", "MRS.", "MISS"];
if (!titles.includes(titleArg as Title)) {
  console.error(`--title must be one of ${titles.join(", ")}`);
  process.exit(1);
}
const title = titleArg as Title;

// ── Dummy data ───────────────────────────────────────────────
const appointment = new Date("2026-07-20T00:00:00");
const dob = new Date("1990-03-15T00:00:00");
const today = new Date();
let age = today.getFullYear() - dob.getFullYear();
const m = today.getMonth() - dob.getMonth();
if (m < 0 || (m === 0 && today.getDate() < dob.getDate())) age--;

const values: Page3Values = {
  printDate: appointment
    .toLocaleDateString("en-GB", { day: "2-digit", month: "long", year: "numeric" })
    .toUpperCase(),
  lastName: "SMITH",
  firstName: "JOHN",
  age: String(age),
  nationality: "BRITISH",
  extensionReason: "TOURISM",
};

// ── Render ───────────────────────────────────────────────────
const root = process.cwd();
const templatePath = path.join(root, "public", "templates", "tm7-rayong.pdf");
const src = await PDFDocument.load(fs.readFileSync(templatePath));
src.registerFontkit(fontkit);
const font = await src.embedFont(fs.readFileSync(path.join(root, "public", "fonts", "Sarabun-Regular.ttf")));
const C = rgb(0.1, 0.2, 0.8); // ballpoint blue

const pageCount = src.getPageCount();
if (onlyPage !== undefined && !(Number.isInteger(onlyPage) && onlyPage >= 1 && onlyPage <= pageCount)) {
  console.error(`--page must be 1..${pageCount}`);
  process.exit(1);
}

const page3 = src.getPage(PAGE3_INDEX);
const ops = page3TextOps(values);
for (const op of ops) {
  page3.drawText(op.value, { x: op.x, y: op.y, size: op.size, font, color: C });
}
for (const s of PAGE3_TITLE_STRIKES[title]) {
  page3.drawLine({ start: { x: s.x1, y: s.y }, end: { x: s.x2, y: s.y }, thickness: PAGE3_LINE_THICKNESS, color: C });
}

let out = src;
if (onlyPage !== undefined) {
  out = await PDFDocument.create();
  const [copied] = await out.copyPages(src, [onlyPage - 1]);
  out.addPage(copied);
}

if (grid) {
  const labelFont = await out.embedFont(StandardFonts.Helvetica);
  for (const p of out.getPages()) drawGrid(p, labelFont);
}

const outPath = path.join(root, "preview-rayong.pdf");
fs.writeFileSync(outPath, await out.save());

// ── Report ───────────────────────────────────────────────────
const { width: W, height: H } = page3.getSize();
type Box = { key: string; x1: number; y1: number; x2: number; y2: number };
const boxes: Box[] = ops.map((op) => ({
  key: op.key,
  x1: op.x,
  y1: op.y - font.heightAtSize(op.size) * 0.25,
  x2: op.x + font.widthOfTextAtSize(op.value, op.size),
  y2: op.y + font.heightAtSize(op.size, { descender: false }),
}));
const overlap = (a: Box, b: Box) => a.x1 < b.x2 && b.x1 < a.x2 && a.y1 < b.y2 && b.y1 < a.y2;

console.log(`page 3 fields (title = ${title}):`);
for (const [i, op] of ops.entries()) {
  const b = boxes[i];
  const flags: string[] = [];
  if (b.x1 < 0 || b.y1 < 0 || b.x2 > W || b.y2 > H) flags.push("OUTSIDE PAGE");
  if (b.x2 > op.maxX) flags.push(`overflows box by ${(b.x2 - op.maxX).toFixed(1)} pt`);
  for (const [j, other] of boxes.entries()) if (j !== i && overlap(b, other)) flags.push(`overlaps ${other.key}`);
  console.log(
    `  ${op.key.padEnd(16)} x=${String(op.x).padStart(4)} y=${String(op.y).padStart(4)}  ` +
      `"${op.value}" → x ${b.x1.toFixed(0)}–${b.x2.toFixed(0)}${flags.length ? "  ⚠ " + flags.join("; ") : ""}`,
  );
}
for (const s of PAGE3_TITLE_STRIKES[title]) {
  console.log(`  titleStrike      x=${s.x1}–${s.x2} y=${s.y}`);
}
console.log(`✓ Wrote ${outPath}`);

// ── Grid ─────────────────────────────────────────────────────
function drawGrid(page: PDFPage, labelFont: PDFFont) {
  const { width, height } = page.getSize();
  const fine = { color: rgb(0.75, 0.85, 1), opacity: 0.6, thickness: 0.2 };
  const bold = { color: rgb(0.9, 0.2, 0.2), opacity: 0.6, thickness: 0.5 };
  const label = { size: 6, font: labelFont, color: rgb(0.85, 0.1, 0.1) };
  for (let x = 0; x <= width; x += 10) {
    page.drawLine({ start: { x, y: 0 }, end: { x, y: height }, ...(x % 50 === 0 ? bold : fine) });
    if (x % 50 === 0) {
      page.drawText(String(x), { x: x + 1, y: 2, ...label });
      page.drawText(String(x), { x: x + 1, y: height - 8, ...label });
    }
  }
  for (let y = 0; y <= height; y += 10) {
    page.drawLine({ start: { x: 0, y }, end: { x: width, y }, ...(y % 50 === 0 ? bold : fine) });
    if (y % 50 === 0) {
      page.drawText(String(y), { x: 2, y: y + 1, ...label });
      page.drawText(String(y), { x: width - 16, y: y + 1, ...label });
    }
  }
}
