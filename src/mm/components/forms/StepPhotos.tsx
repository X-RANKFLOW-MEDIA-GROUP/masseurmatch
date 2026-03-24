import React from 'react';
import { MASSAGE_THERAPIST_FIELDS } from '../../forms/fields';

export function StepPhotos({ values, onChange }: {
  values: Record<string, any>;
  onChange: (field: string, value: any) => void;
}) {
  // Simples: só campos de upload/url
  return (
    <div className="space-y-4">
      {['profile_photo', 'gallery_photos', 'cover_photo', 'video_intro'].map((field) => {
        const def = MASSAGE_THERAPIST_FIELDS[field];
        if (!def) return null;
        if (def.type === 'image' || def.type === 'multiimage' || def.type === 'url') {
          return (
            <div key={field}>
              <label className="block font-medium mb-1">{def.label}</label>
              <input
                type={def.type === 'url' ? 'url' : 'file'}
                className="input input-bordered w-full"
                multiple={def.type === 'multiimage'}
                onChange={e => {
                  if (def.type === 'multiimage') {
                    const files = Array.from(e.target.files || []);
                    onChange(field, files);
                  } else if (def.type === 'image') {
                    const file = e.target.files?.[0];
                    onChange(field, file);
                  } else {
                    onChange(field, e.target.value);
                  }
                }}
              />
            </div>
          );
        }
        return null;
      })}
    </div>
  );
}
