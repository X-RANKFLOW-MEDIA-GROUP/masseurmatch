CREATE UNIQUE INDEX IF NOT EXISTS uq_moderation_queue_target_id
  ON public.moderation_queue(target_id);

UPDATE public.moderation_queue mq
SET
  status = pp.moderation_status,
  moderation_reason = COALESCE(pp.moderation_reason, mq.moderation_reason),
  updated_at = timezone('utc'::text, now())
FROM public.profile_photos pp
WHERE mq.target_id = pp.id::text
  AND mq.item_type = 'photo'
  AND (
    mq.status IS DISTINCT FROM pp.moderation_status
    OR (pp.moderation_reason IS NOT NULL AND mq.moderation_reason IS DISTINCT FROM pp.moderation_reason)
  );

INSERT INTO public.moderation_queue (
  content_type, profile_id, user_id, target_id, item_type, source, status,
  priority, moderation_provider, moderation_reason, snapshot
)
SELECT
  'photo', pp.profile_id, pp.user_id, pp.id, 'photo', 'profile_photos_sync',
  COALESCE(pp.moderation_status, 'pending'), 0, 'system', pp.moderation_reason,
  jsonb_strip_nulls(jsonb_build_object(
    'photoId', pp.id,
    'imageUrl', COALESCE(pp.url, pp.storage_path),
    'isPrimary', pp.is_primary,
    'sortOrder', pp.sort_order
  ))
FROM public.profile_photos pp
WHERE pp.id IS NOT NULL
  AND NOT EXISTS (SELECT 1 FROM public.moderation_queue mq WHERE mq.target_id = pp.id::text);

CREATE OR REPLACE FUNCTION public.sync_profile_photo_moderation_queue()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.moderation_queue (
    content_type, profile_id, user_id, target_id, item_type, source, status,
    priority, moderation_provider, moderation_reason, snapshot
  )
  VALUES (
    'photo', NEW.profile_id, NEW.user_id, NEW.id, 'photo', 'profile_photos_sync',
    COALESCE(NEW.moderation_status, 'pending'), 0, 'system', NEW.moderation_reason,
    jsonb_strip_nulls(jsonb_build_object(
      'photoId', NEW.id,
      'imageUrl', COALESCE(NEW.url, NEW.storage_path),
      'isPrimary', NEW.is_primary,
      'sortOrder', NEW.sort_order
    ))
  )
  ON CONFLICT (target_id)
  DO UPDATE SET
    profile_id = EXCLUDED.profile_id,
    user_id = EXCLUDED.user_id,
    content_type = 'photo',
    item_type = 'photo',
    status = EXCLUDED.status,
    moderation_reason = EXCLUDED.moderation_reason,
    updated_at = timezone('utc'::text, now());
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_sync_profile_photo_moderation_queue ON public.profile_photos;
CREATE TRIGGER trg_sync_profile_photo_moderation_queue
AFTER UPDATE OF moderation_status, moderation_reason ON public.profile_photos
FOR EACH ROW
WHEN (
  OLD.moderation_status IS DISTINCT FROM NEW.moderation_status
  OR OLD.moderation_reason IS DISTINCT FROM NEW.moderation_reason
)
EXECUTE FUNCTION public.sync_profile_photo_moderation_queue();
