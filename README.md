# visa-extension-rayong — rayong.toyka.net

TM.7 visa-extension form filler for **Rayong** and **Chiang Saen** immigration.
Forked from `visa-extension-nonthaburi` (non.toyka.net) at commit `e2bb791`
(includes the passport issue/expiry day-swap fix and its tests).

## Differences from the Nonthaburi app

- `src/lib/offices.ts` — one config entry per immigration office. The UI
  "สถานที่ยื่นคำร้อง / Immigration Office" field is now a dropdown
  (Rayong default, Chiang Saen). Only the printed office text changes; the
  template and coordinates are shared. Add a third office by adding one entry.
- `src/lib/tm7-generator.ts` (was `tm7-generator-nonthaburi.ts`), exporting
  `generateTm7Pdf`.
- Template: `public/templates/rayong/tm7-master.pdf`.

## TODO before go-live

- [ ] Replace `public/templates/rayong/tm7-master.pdf` with the Rayong 3-page
      TM.7 (current file is still the 5-page Nonthaburi template). Pages 1–2 are
      identical; **page 3 is different** — re-measure every page-3 coordinate and
      remove/move all draws that target old pages 3–5 (page index ≥ 3 must not be
      referenced anywhere after the change).
- [ ] Confirm the exact office strings in `src/lib/offices.ts` (`formLocation`).
- [ ] Vercel: new project → add domain `rayong.toyka.net`; copy all env vars from
      the non project and set `NEXTAUTH_URL=https://rayong.toyka.net`.
- [ ] Google Cloud Console → OAuth client → add
      `https://rayong.toyka.net/api/auth/callback/google` to Authorized redirect URIs.
- [ ] Cloudflare DNS (zone toyka.net): CNAME `rayong` → `cname.vercel-dns.com`,
      same proxy setting as `bkk` / `non`.

## Dev

```bash
npm install
npm run dev          # http://localhost:3000
npm test             # node --test src/**/*.test.ts
node scripts/preview-rayong.mts   # writes preview-rayong.pdf with dummy data
```
