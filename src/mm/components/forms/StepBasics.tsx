import React from 'react';
import { MASSAGE_THERAPIST_FIELDS } from '../../forms/fields';

export function StepBasics({ values, onChange }: {
  values: Record<string, any>;
  onChange: (field: string, value: any) => void;
}) {
  return (
    <div className="space-y-4">
      {['full_name', 'display_name', 'headline', 'bio_short', 'bio_full', 'experience_start', 'languages'].map((field) => {
        const def = MASSAGE_THERAPIST_FIELDS[field];
        if (!def) return null;
        if (def.type === 'text' || def.type === 'date') {
          return (
            <div key={field}>
              <label className="block font-medium mb-1">{def.label}</label>
              <input
                type={def.type === 'date' ? 'date' : 'text'}
                className="input input-bordered w-full"
                placeholder={def.placeholder}
                value={values[field] || ''}
                onChange={e => onChange(field, e.target.value)}
              />
            </div>
          );
        }
        if (def.type === 'textarea' || def.type === 'richtextarea') {
          return (
            <div key={field}>
              <label className="block font-medium mb-1">{def.label}</label>
              <textarea
                className="textarea textarea-bordered w-full"
                placeholder={def.placeholder}
                value={values[field] || ''}
                onChange={e => onChange(field, e.target.value)}
              />
            </div>
          );
        }
        if (def.type === 'multiselect') {
          return (
            <div key={field}>
              <label className="block font-medium mb-1">{def.label}</label>
              <select
                multiple
                className="select select-bordered w-full"
                value={values[field] || []}
                onChange={e => {
                  const options = Array.from(e.target.selectedOptions).map(o => o.value);
                  onChange(field, options);
                }}
              >
                {def.options.map((opt: string) => (
                  <option key={opt} value={opt}>{opt}</option>
                ))}
              </select>
            </div>
          );
        }
        return null;
      })}
    </div>
  );
}
