# Knowledge Base Index — Sand AI

This folder contains structured reference material that Sand AI loads on-demand based on keywords in the user's message. Files are NOT loaded all-at-once — `chat.js` scans the conversation, matches keywords, and injects only the relevant `.md` files into the system prompt.

## How to add a new file

1. Pick a slug (e.g. `azimut`, `boat-lagoon-yachting`)
2. Create `knowledge/[category]/[slug].md` following `_TEMPLATE.md`
3. Add keywords to `BRAND_KEYWORDS` in `netlify/functions/chat.js`
4. Commit + push → Netlify rebuilds, file is auto-included via `included_files` in `netlify.toml`

## Priority research queue

### P1 — Top 10 brands TBF will showcase (do these first)

- [x] `yachts/azimut.md` — seed exists, needs deep-research enrichment
- [ ] `yachts/sunseeker.md`
- [ ] `yachts/princess.md`
- [ ] `yachts/sanlorenzo.md`
- [ ] `yachts/jeanneau.md`
- [ ] `yachts/wally.md`
- [ ] `yachts/axopar.md`
- [ ] `yachts/saxdor.md`
- [ ] `yachts/de-antonio.md`
- [ ] `yachts/chris-craft.md`

### P2 — Thai market specifics (Claude doesn't know these well)

- [ ] `thai-market/boat-lagoon-yachting.md` — TBF venue operator + Princess/Numarine/Sirena dealer
- [ ] `thai-market/asia-yachting.md` — Sunseeker/Riva/Pershing in Asia
- [ ] `thai-market/east-marine.md`
- [ ] `thai-market/thai-marine.md`
- [ ] `thai-market/dch-marine.md`
- [ ] `thai-market/phuket-marinas.md` — Boat Lagoon vs Yacht Haven vs Ao Po Grand Marina vs Royal Phuket Marina
- [ ] `thai-market/thai-hnwi-segments.md` — Family-office buyers, charter-first owners, Bangkok vs Phuket residents
- [ ] `thai-market/boat-import-thailand.md` — Duty/VAT/registration/flag options

### P3 — Brand depth (after P1 done)

- [ ] `yachts/ferretti.md`
- [ ] `yachts/pershing.md`
- [ ] `yachts/riva.md`
- [ ] `yachts/benetti.md`
- [ ] `yachts/beneteau.md`
- [ ] `yachts/lagoon.md` (catamaran)
- [ ] `yachts/fountaine-pajot.md`
- [ ] `yachts/sunreef.md`
- [ ] `yachts/oyster.md`
- [ ] `yachts/swan.md` (Nautor's Swan)
- [ ] `yachts/feadship.md`
- [ ] `yachts/lurssen.md`
- [ ] `yachts/heesen.md`
- [ ] `yachts/williams-tenders.md`
- [ ] `yachts/seabob.md`

### P4 — TBF history & context

- [ ] `tbf-history/edition-1-yacht-haven.md`
- [ ] `tbf-history/edition-2-boat-lagoon.md` — most recent show with full data
- [ ] `tbf-history/exhibitor-roster-2024-26.md`
- [ ] `tbf-history/visitor-profile.md` — VIP behavior, geographic mix

### P5 — Industry calendar & cross-references

- [ ] `events/asia-circuit.md` — Singapore, Hong Kong, Indonesia (Bali/Batam) shows
- [ ] `events/european-circuit.md` — Cannes, Monaco, Genoa, Düsseldorf
- [ ] `events/regatta-season.md` — Phuket King's Cup, Bali Regatta, Hong Kong Vinhomes
- [ ] `events/tibs-context.md` — Thailand International Boat Show (competitor handling)

### P6 — Technical/operational topics

- [ ] `specs/motor-yacht-pricing-tiers.md` — typical USD ranges by LOA
- [ ] `specs/sea-trial-protocol.md` — what's expected, who attends, how it's structured
- [ ] `specs/marina-rates-asia.md` — berth costs across major Asian marinas
- [ ] `specs/yacht-charter-thailand.md` — bareboat/crewed/day-charter rules

## Format rules (CRITICAL — read before writing)

- Each file: **400-700 words** target (Sand reads concise, not encyclopedic)
- Use `_TEMPLATE.md` structure
- **No owner names, no confidential pricing**
- **Source attribution** if web-researched ("Per Azimut.com, Sep 2025")
- **"Last updated" date** at top of every file
- Keep tone factual — Sand will translate to her voice

## After research session writes files

Once a batch is ready (e.g. 5 brand files done):
1. Tell me in this session
2. I'll update `BRAND_KEYWORDS` map in `chat.js`
3. Commit + push → live in 30 seconds
