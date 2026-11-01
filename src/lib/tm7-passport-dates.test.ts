// Regression test for the passport issue/expiry day transposition:
// the two dates' DAY boxes sit on different printed lines than their
// own month/year, and they were once mapped to each other's slot.
//
// Run with: npm test
import assert from "node:assert/strict";
import test from "node:test";
import { passportDateFields, splitIsoDate, type Tm7TextField } from "./tm7-passport-dates.ts";

function byKey(fields: Tm7TextField[]): Record<string, Tm7TextField> {
  return Object.fromEntries(fields.map((f) => [f.key, f]));
}

const ISSUE_SLOTS = {
  "p1.issueDay": { x: 480, y: 478 },
  "p1.issueMonth": { x: 105, y: 436 },
  "p1.issueYear": { x: 205, y: 436 },
};
const EXPIRY_SLOTS = {
  "p1.expDay": { x: 480, y: 436 },
  "p1.expMonth": { x: 105, y: 406 },
  "p1.expYear": { x: 205, y: 406 },
};

function assertSlot(f: Tm7TextField, slot: { x: number; y: number }) {
  assert.deepEqual({ x: f.x, y: f.y }, slot, `${f.key} drawn at wrong position`);
}

test("issue 2024-11-20 → 20 / NOVEMBER / 2024 in the issue slots", () => {
  const f = byKey(passportDateFields("2024-11-20", "2034-11-19"));
  assert.equal(f["p1.issueDay"].value, "20");
  assert.equal(f["p1.issueMonth"].value, "NOVEMBER");
  assert.equal(f["p1.issueYear"].value, "2024");
  for (const [key, slot] of Object.entries(ISSUE_SLOTS)) assertSlot(f[key], slot);
});

test("expiry 2034-11-19 → 19 / NOVEMBER / 2034 in the expiry slots", () => {
  const f = byKey(passportDateFields("2024-11-20", "2034-11-19"));
  assert.equal(f["p1.expDay"].value, "19");
  assert.equal(f["p1.expMonth"].value, "NOVEMBER");
  assert.equal(f["p1.expYear"].value, "2034");
  for (const [key, slot] of Object.entries(EXPIRY_SLOTS)) assertSlot(f[key], slot);
});

test("no two fields share a slot", () => {
  const fields = passportDateFields("2024-11-20", "2034-11-19");
  assert.equal(fields.length, 6);
  const slots = fields.map((v) => `${v.x},${v.y}`);
  assert.equal(new Set(slots).size, slots.length);
});

test("single-digit days are zero-padded for both dates", () => {
  const f = byKey(passportDateFields("2019-01-05", "2029-01-04"));
  assert.equal(f["p1.issueDay"].value, "05");
  assert.equal(f["p1.expDay"].value, "04");
});

test("parsing does not depend on the server timezone", () => {
  // new Date("2024-11-20") is UTC midnight → getDate() gives 19 west of UTC.
  // The helper parses the string itself, so any TZ yields the same parts.
  assert.deepEqual(splitIsoDate("2024-11-20"), { day: "20", month: "NOVEMBER", year: "2024" });
  assert.deepEqual(splitIsoDate("2024-11-20T00:00:00Z"), { day: "20", month: "NOVEMBER", year: "2024" });
});

test("missing or invalid dates contribute no fields", () => {
  assert.deepEqual(passportDateFields("2024-11-20", undefined).map((x) => x.key),
    ["p1.issueDay", "p1.issueMonth", "p1.issueYear"]);
  assert.deepEqual(passportDateFields(null, "2034-11-19").map((x) => x.key),
    ["p1.expDay", "p1.expMonth", "p1.expYear"]);
  assert.deepEqual(passportDateFields("", "20/11/2024"), []);
  assert.deepEqual(passportDateFields("2024-02-30", "2024-13-01"), []);
});
