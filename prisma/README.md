# Prisma folder status

This project currently uses **Supabase + PostgREST** directly for production data access.

The `prisma/schema.prisma` file is kept only as an archived reference and is **not** part of the active runtime stack.

- Do not run `prisma migrate` here.
- Do not run `prisma generate` from this schema for production workflows.

If Prisma is reintroduced in the future, this folder should be revisited with explicit migration docs.
