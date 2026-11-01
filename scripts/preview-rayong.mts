// =============================================================
// Rayong TM.7 coordinate-tuning preview
// =============================================================
// Renders generateTm7Pdf() with a full set of dummy data
// (every field populated at once) so all text placements are visible
// on a single generated packet. Writes the result to preview-rayong.pdf
// in the project root. No auth, no browser, no dev server needed.
//
// Usage (from the project root):
//   node scripts/preview-rayong.mts            # MR. (male base layout)
//   node scripts/preview-rayong.mts MRS.       # exercise female offsets
//   node scripts/preview-rayong.mts MISS
//
// Edit-and-regenerate loop for fine-tuning X/Y in
// src/lib/tm7-generator-rayong.ts:
//   1. tweak a coordinate
//   2. re-run this script
//   3. open preview-rayong.pdf
// =============================================================

import fs from "fs";
import path from "path";
import {
  generateTm7Pdf,
  type Tm7FormData,
  type Title,
} from "../src/lib/tm7-generator.ts";

const titleArg = (process.argv[2] || "MR.").toUpperCase() as Title;
const validTitles: Title[] = ["MR.", "MRS.", "MISS"];
const title: Title = validTitles.includes(titleArg) ? titleArg : "MR.";

// Every field filled so all placements render simultaneously.
const dummy: Tm7FormData = {
  title,
  firstName: "JOHN",
  lastName: "SMITH",
  nationality: "BRITISH",
  dateOfBirth: "1990-03-15",
  placeOfBirth: "LONDON",

  passportNo: "AB1234567",
  passportIssueDate: "2021-06-20",
  passportExpiryDate: "2031-06-19",
  passportIssuedAt: "UNITED KINGDOM",

  arrivalDate: "2026-05-01",
  fromCountry: "UNITED KINGDOM",
  portOfArrival: "SUVARNABHUMI AIRPORT",
  arrivedBy: "AIRPLANE",
  visaType: "EXEMPTION (PORPOR 60)",

  houseNo: "123/45",
  road: "SUKHUMVIT",
  subDistrict: "BANG KRASO",
  district: "MUEANG RAYONG",
  province: "RAYONG",
  postalCode: "11000",
  phone: "+66 81 234 5678",

  appointmentDate: "2026-07-20",
  formLocation: "RAYONG",
  extensionDays: 30,
  extensionReason: "TOURISM",
};

const pdfBytes = await generateTm7Pdf(dummy);
const outPath = path.join(process.cwd(), "preview-rayong.pdf");
fs.writeFileSync(outPath, pdfBytes);
console.log(`✓ Wrote ${outPath}  (title = ${title}, ${pdfBytes.byteLength} bytes)`);
