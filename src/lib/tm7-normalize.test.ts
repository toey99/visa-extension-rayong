import { test } from "node:test";
import assert from "node:assert/strict";
import { uppercaseTm7Data } from "./tm7-normalize.ts";

const lower = {
  title: "MR." as const,
  firstName: "john",
  lastName: "smith",
  nationality: "british",
  placeOfBirth: "london",
  passportNo: "ab123",
  passportIssuedAt: "united kingdom",
  fromCountry: "uk",
  portOfArrival: "suvarnabhumi",
  arrivedBy: "airplane",
  visaType: "exemption",
  houseNo: "12/3 moo 4",
  road: "sukhumvit",
  subDistrict: "tha pradu",
  district: "mueang rayong",
  province: "rayong",
  extensionReason: "tourism",
  dateOfBirth: "1990-03-15",
  appointmentDate: "2026-07-20",
  phone: "+66 81 abc",
  postalCode: "21000",
  office: "CHIANG_SAEN" as const,
  extensionDays: 30,
};

test("every free-text field is uppercased", () => {
  const out = uppercaseTm7Data(lower);
  assert.equal(out.firstName, "JOHN");
  assert.equal(out.lastName, "SMITH");
  assert.equal(out.nationality, "BRITISH");
  assert.equal(out.placeOfBirth, "LONDON");
  assert.equal(out.passportNo, "AB123");
  assert.equal(out.passportIssuedAt, "UNITED KINGDOM");
  assert.equal(out.fromCountry, "UK");
  assert.equal(out.portOfArrival, "SUVARNABHUMI");
  assert.equal(out.arrivedBy, "AIRPLANE");
  assert.equal(out.visaType, "EXEMPTION");
  assert.equal(out.houseNo, "12/3 MOO 4");
  assert.equal(out.road, "SUKHUMVIT");
  assert.equal(out.subDistrict, "THA PRADU");
  assert.equal(out.district, "MUEANG RAYONG");
  assert.equal(out.province, "RAYONG");
  assert.equal(out.extensionReason, "TOURISM");
});

test("dates, numbers, phone, postal code, title and office are untouched", () => {
  const out = uppercaseTm7Data(lower);
  assert.equal(out.dateOfBirth, "1990-03-15");
  assert.equal(out.appointmentDate, "2026-07-20");
  assert.equal(out.phone, "+66 81 abc");
  assert.equal(out.postalCode, "21000");
  assert.equal(out.title, "MR.");
  assert.equal(out.office, "CHIANG_SAEN");
  assert.equal(out.extensionDays, 30);
});

test("missing optional fields stay missing and the input is not mutated", () => {
  const input = { title: "MISS" as const, firstName: "a", lastName: "b", nationality: "c", passportNo: "d", office: "RAYONG" as const };
  const out = uppercaseTm7Data(input);
  assert.equal(out.district, undefined);
  assert.equal(input.firstName, "a");
});
