# Homepage Image Requirements

All files go in `public/marketing/`. Next.js serves them at `/marketing/...`.

---

## Hero — `public/marketing/hero/`

| File | Dimensions | Aspect | Format | Max size | Purpose |
|------|-----------|--------|--------|----------|---------|
| `cover.jpg` | 1920 × 860 px | 21:9 | JPEG / WebP | 200 KB | Full-bleed cinematic shot behind the hero headline. Dark enough for white text overlay. |
| `avatar-1.jpg` | 96 × 96 px | 1:1 | JPEG / WebP | 10 KB | Social proof avatar stack (rendered at 48 px, 2× retina) |
| `avatar-2.jpg` | 96 × 96 px | 1:1 | JPEG / WebP | 10 KB | |
| `avatar-3.jpg` | 96 × 96 px | 1:1 | JPEG / WebP | 10 KB | |
| `avatar-4.jpg` | 96 × 96 px | 1:1 | JPEG / WebP | 10 KB | |

**`cover.jpg` content:** Moody professional wellness/spa scene — hands on back, dim warm lighting, editorial feel. Think dark navy/amber tones to match the site palette.

---

## City Case Studies — `public/marketing/cities/`

Each card renders at 16:10 aspect ratio. Filenames must match the city slug exactly.

| File | Dimensions | Format | Max size | City |
|------|-----------|--------|----------|------|
| `dallas.jpg` | 800 × 500 px | JPEG / WebP | 80 KB | Dallas |
| `miami.jpg` | 800 × 500 px | JPEG / WebP | 80 KB | Miami |
| `new-york.jpg` | 800 × 500 px | JPEG / WebP | 80 KB | New York |
| `los-angeles.jpg` | 800 × 500 px | JPEG / WebP | 80 KB | Los Angeles |
| `chicago.jpg` | 800 × 500 px | JPEG / WebP | 80 KB | Chicago |
| `houston.jpg` | 800 × 500 px | JPEG / WebP | 80 KB | Houston |
| `atlanta.jpg` | 800 × 500 px | JPEG / WebP | 80 KB | Atlanta |
| `washington-dc.jpg` | 800 × 500 px | JPEG / WebP | 80 KB | Washington DC |

**Content:** Recognizable skyline or neighborhood shot for each city. Warm tones work best against the dark card background.

---

## Why Us Split — `public/marketing/why-us/`

| File | Dimensions | Aspect | Format | Max size | Purpose |
|------|-----------|--------|--------|----------|---------|
| `primary.jpg` | 1200 × 900 px | 4:3 | JPEG / WebP | 150 KB | Dominant left panel (58 vw on desktop) — therapist at work or professional portrait |
| `secondary.jpg` | 900 × 900 px | 1:1 | JPEG / WebP | 100 KB | Smaller right panel (42 vw on desktop) — client satisfaction / wellness mood shot |

---

## Therapist Avatars (dynamic — not static files)

Served from Supabase storage via `therapist.avatar_url`. Upload per therapist profile.

| Recommended dimensions | Aspect | Notes |
|----------------------|--------|-------|
| 600 × 750 px | 4:5 portrait | Rendered at 4:5 ratio on the Featured Therapists grid. Falls back to a muted placeholder if null. |

---

## Summary

| Section | Static files | Folder |
|---------|-------------|--------|
| Hero cover | 1 | `public/marketing/hero/` |
| Hero avatars | 4 | `public/marketing/hero/` |
| City cards | 8 | `public/marketing/cities/` |
| Why Us | 2 | `public/marketing/why-us/` |
| **Total** | **15** | |

Therapist profile photos are uploaded dynamically — not included in the 15 above.
