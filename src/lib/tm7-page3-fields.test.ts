import { test } from "node:test";
import assert from "node:assert/strict";
import {
  PAGE3_FIELDS,
  PAGE3_SIZE,
  PAGE3_TITLE_STRIKES,
  page3TextOps,
  type Page3FieldKey,
} from "./tm7-page3-fields.ts";

const entries = Object.entries(PAGE3_FIELDS) as [Page3FieldKey, (typeof PAGE3_FIELDS)[Page3FieldKey]][];

test("every page-3 field and its box lie inside the page", () => {
  for (const [key, f] of entries) {
    assert.ok(f.x >= 0 && f.maxX <= PAGE3_SIZE.width, `${key} x-range outside page`);
    assert.ok(f.y >= 0 && f.y + f.size <= PAGE3_SIZE.height, `${key} y outside page`);
    assert.ok(f.x < f.maxX, `${key} starts past the end of its box`);
  }
});

test("no two page-3 fields share a slot or overlapping box", () => {
  for (let i = 0; i < entries.length; i++) {
    for (let j = i + 1; j < entries.length; j++) {
      const [ka, a] = entries[i];
      const [kb, b] = entries[j];
      assert.ok(!(a.x === b.x && a.y === b.y), `${ka} and ${kb} share a slot`);
      const xOverlap = a.x < b.maxX && b.x < a.maxX;
      const yOverlap = a.y < b.y + b.size && b.y < a.y + a.size;
      assert.ok(!(xOverlap && yOverlap), `${ka} and ${kb} boxes overlap`);
    }
  }
});

test("title strikes stay on the title row, left of the name box", () => {
  for (const [title, segs] of Object.entries(PAGE3_TITLE_STRIKES)) {
    assert.ok(segs.length > 0, `${title} has no strike`);
    for (const s of segs) {
      assert.ok(s.x1 < s.x2, `${title} strike reversed`);
      assert.ok(s.x2 < PAGE3_FIELDS.lastName.x, `${title} strike runs into lastName`);
      assert.ok(Math.abs(s.y - PAGE3_FIELDS.lastName.y) < 3, `${title} strike off the title row`);
    }
  }
});

test("page3TextOps skips empty values and keeps coordinates", () => {
  const ops = page3TextOps({
    printDate: "20 JULY 2026",
    lastName: "SMITH",
    firstName: "",
    age: "36",
    nationality: "BRITISH",
    extensionReason: "TOURISM",
  });
  assert.deepEqual(ops.map((o) => o.key), ["printDate", "lastName", "age", "nationality", "extensionReason"]);
  assert.equal(ops[1].x, PAGE3_FIELDS.lastName.x);
});
