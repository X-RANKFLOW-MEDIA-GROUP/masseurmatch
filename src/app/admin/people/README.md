# People CRM implementation notes

This route currently consolidates the existing account and therapist management surfaces.

The next implementation pass should replace the two stacked legacy managers with a unified person table and detail view. Keep `profile_photos` as the complete photo source, and use `moderation_queue` only for moderation workflow state.
