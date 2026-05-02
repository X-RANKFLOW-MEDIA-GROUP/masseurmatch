# Supabase Postgres Best Practices - Contributor Guide

This skill contains Postgres performance optimization references optimized for
AI agents and LLMs. It follows the Agent Skills Open Standard.

## Important Note for MasseurMatch

The commands below (`npm run validate`, `npm run build`) are part of the original skill package.
They DO NOT apply to the MasseurMatch root repository unless explicitly configured.

## Usage in This Repository

Do not rely on this skill for schema correctness.
All database changes must follow the production contract:

`supabase/PRODUCTION_SCHEMA_LOCK.sql`

## Quick Start (Skill Package Only)

```bash
npm install
npm run validate
npm run build
```

## Core Rule

Never implement partial schema fixes.
Always update the full database contract first.
