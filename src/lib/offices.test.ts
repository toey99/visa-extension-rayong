import { test } from "node:test";
import assert from "node:assert/strict";
import { DEFAULT_OFFICE, OFFICE_IDS, isOfficeId, officeFormLocation } from "./offices.ts";

test("only RAYONG and CHIANG_SAEN are offered", () => {
  assert.deepEqual(OFFICE_IDS, ["RAYONG", "CHIANG_SAEN"]);
  assert.ok(OFFICE_IDS.includes(DEFAULT_OFFICE));
});

test("each office prints its own location text", () => {
  assert.equal(officeFormLocation("RAYONG"), "RAYONG");
  assert.equal(officeFormLocation("CHIANG_SAEN"), "CHIANG SAEN");
});

test("anything else is rejected, including old locations", () => {
  for (const v of ["BANGKOK", "NONTHABURI", "", "rayong", undefined, null, "toString"]) {
    assert.equal(isOfficeId(v), false, String(v));
  }
  assert.throws(() => officeFormLocation("BANGKOK" as never));
});
