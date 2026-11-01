// Immigration offices this app can generate TM.7 packets for.
//
// Both offices accept the same document layout, so one template and one set
// of coordinates serve all of them — only the text printed in the
// "สถานที่ยื่นคำร้อง / Form Location" boxes changes.
//
// To add another office that uses the same form: add one entry here. Nothing
// else needs to change.

export const OFFICES = {
  RAYONG: {
    id: "RAYONG",
    label: "Rayong",
    labelThai: "ระยอง",
    // Exact text printed on the form.
    formLocation: "RAYONG",
  },
  CHIANG_SAEN: {
    id: "CHIANG_SAEN",
    label: "Chiang Saen",
    labelThai: "เชียงแสน",
    formLocation: "CHIANG SAEN",
  },
} as const;

export type OfficeId = keyof typeof OFFICES;

export const OFFICE_LIST = Object.values(OFFICES);

export const DEFAULT_OFFICE: OfficeId = "RAYONG";

export function isOfficeId(v: string): v is OfficeId {
  return v in OFFICES;
}
