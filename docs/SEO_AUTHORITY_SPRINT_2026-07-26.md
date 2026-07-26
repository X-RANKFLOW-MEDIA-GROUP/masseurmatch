# MasseurMatch SEO Authority Sprint — 2026-07-26

Related epic: #604

## Source material

This sprint is based on:

- the Semrush Keyword Gap PDF exported on July 24, 2026;
- the CEO strategy attached to issue #604;
- the current production route and sitemap architecture.

The four uploaded `ideas_www.masseurmatch.com_20260726*.xlsx` workbooks contain only the `Priority` column header and no idea rows. They therefore cannot support additional keyword-level implementation until a populated export is supplied.

## Keyword-gap baseline

The supplied Semrush report shows approximately:

- 80 organic keywords for MasseurMatch;
- 6.8K for MasseurFinder;
- 2.6K for RentMasseur;
- 1.6K missing keywords;
- 7.6K untapped keywords.

The visible query sample supports immediate emphasis on Dallas male-massage intent, with additional Chicago and Indianapolis opportunities.

## Changes in this sprint

### One canonical city URL

The canonical public city pattern remains:

```text
/[city-slug]
```

Legacy paths now redirect to that route:

```text
/cities/[city]
/states/[state]/cities/[city]
```

State pages link directly to the canonical short city URLs. This removes competing internal-link signals and reduces indexable duplication.

### Stronger city pages

The canonical city template now supports curated local intent content. Dallas, Chicago, and Indianapolis receive unique:

- metadata;
- introductions;
- FAQs;
- nearby-city links.

All other city pages retain a safe data-driven fallback.

### Inventory-gated indexation

This sprint preserves the existing rule that a city requires at least one real approved public profile before entering the sitemap. Empty markets remain followable but noindex and absent from the sitemap.

### Directory-correct structured data

City pages use `CollectionPage`, `ItemList`, `BreadcrumbList`, and visible FAQ markup. They no longer represent MasseurMatch itself as a local massage business in every city.

### Homepage authority positioning

The homepage hero now states the national directory proposition directly and links users into the state hierarchy. City-discovery copy no longer implies that every listed city already has verified inventory.

## Anti-doorway rules

This release does not generate a Cartesian product of cities, neighborhoods, techniques, hotels, airports, and session types.

A future page family must remain blocked from indexation unless it has:

- real matching public provider inventory;
- a distinct canonical intent;
- useful unique local information;
- internal links;
- no material duplication or cannibalization.

## Next controlled releases

1. Link provider techniques to eligible city-technique pages.
2. Add a formal page-eligibility score for neighborhood and technique intersections.
3. Segment the sitemap when URL volume requires it.
4. Build landmark and airport pages only from maintained service-area data.
5. Import a populated Semrush ideas export and map every recommendation to an existing canonical route, an approved new route, or a rejected doorway/duplicate candidate.
