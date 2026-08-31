# Tide — Web

Browser port of the Tide breathing app (Expo Router + React Native Web).

```
npm install
npm run web        # dev server
npm run build:web  # static export to dist/
npm test
npm run typecheck
```

Ported from the native app at `../breathing-app`. See `.scratch/breathing-app-web/issues/`
in that repo for the ticket breakdown driving this port.

## Deviation from the native app

The native app's `CONTEXT.md` (Pattern Picker entry) reaches Statistics via a
"Statistics" row inside the Pattern Picker's Customize sheet. This web port
deliberately does it differently: the Pattern Picker's header has its own
Statistics icon (`src/app/index.tsx`), and the Customize sheet
(`src/components/pattern-picker-settings-sheet.tsx`) has no Statistics row
at all. This was an explicit instruction for the web port (ticket 07), not
an oversight — noting it here since the native app's `CONTEXT.md` still
describes the native behavior and wasn't (and shouldn't be) changed to
match.
