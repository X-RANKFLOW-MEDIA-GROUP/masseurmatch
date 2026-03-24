import React from 'react';
import { MASSAGE_THERAPIST_FIELDS } from '../../forms/fields';

export function StepLocation({ values, onChange }: {
  values: Record<string, any>;
  onChange: (field: string, value: any) => void;
}) {
  return (
    <div className="space-y-4">
      {['city', 'state', 'neighborhood', 'location_description', 'zip_code', 'is_mappable', 'landmarks'].map((field) => {
        const def = MASSAGE_THERAPIST_FIELDS[field];
        if (!def) return null;
        if (def.type === 'text') {
          return (
            <div key={field}>
              <label className="block font-medium mb-1">{def.label}</label>
              <input
                type="text"
                className="input input-bordered w-full"
                placeholder={def.placeholder}
                value={values[field] || ''}
                onChange={e => onChange(field, e.target.value)}
              />
            </div>
          );
        }
        if (def.type === 'textarea') {
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
        if (def.type === 'select') {
          return (
            <div key={field}>
              <label className="block font-medium mb-1">{def.label}</label>
              <select
                className="select select-bordered w-full"
                value={values[field] || ''}
                onChange={e => onChange(field, e.target.value)}
              >
                <option value="">Select...</option>
                {(def.options || []).map((opt: string) => (
                  <option key={opt} value={opt}>{opt}</option>
                ))}
              </select>
            </div>
          );
        }
        if (def.type === 'boolean') {
          return (
            <div key={field} className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={!!values[field]}
                onChange={e => onChange(field, e.target.checked)}
              />
              <label>{def.label}</label>
            </div>
          );
        }
        if (def.type === 'multitag') {
          return (
            <div key={field}>
              <label className="block font-medium mb-1">{def.label}</label>
              <input
                type="text"
                className="input input-bordered w-full"
                placeholder={def.placeholder}
                value={(values[field] || []).join(', ')}
                onChange={e => onChange(field, e.target.value.split(',').map((v: string) => v.trim()).filter(Boolean))}
              />
              <small>Separe por vírgula</small>
            </div>
          );
        }
        return null;
      })}
    </div>
  );
}
