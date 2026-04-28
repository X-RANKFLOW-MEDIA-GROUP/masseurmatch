# Demand Index Integration Guide

This guide explains how to integrate the demand index system into the web app.

## Where to use

- City pages
- Search results
- Therapist cards
- Hero sections
- Admin analytics

## Basic usage

```ts
import {
  sortTherapistsByDemand,
  getDemandHeroCopy,
  getContactActionPriority,
  getDemandSeoMetadata,
} from "@/lib/demand-index"
```

## Example

```ts
const demandScore = 81

const sorted = sortTherapistsByDemand(therapists, demandScore)

const hero = getDemandHeroCopy(city, demandScore)

const seo = getDemandSeoMetadata(city, demandScore)
```

## Recommended behavior

When demand >= 80:

- Show "Available now" badges
- Prioritize call and text buttons
- Track clicks separately
- Show upsell to therapists

## Tracking

Use the event helpers for analytics tracking.

## Safety

Only show "Available now" if availability is confirmed.
