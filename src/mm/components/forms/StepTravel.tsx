import React from 'react';
import { MASSAGE_THERAPIST_FIELDS } from '../../forms/fields';

export function StepTravel({ values, onChange }: {
  values: Record<string, any>;
  onChange: (field: string, value: any) => void;
}) {
  return (
    <div className="space-y-4">
      {['is_traveling', 'travel_cities', 'travel_dates', 'travel_note'].map((field) => {
        const def = MASSAGE_THERAPIST_FIELDS[field];
        if (!def) return null;
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
        if (def.type === 'daterange') {
          return (
            <div key={field}>
              <label className="block font-medium mb-1">{def.label}</label>
              <input
                type="date"
                value={values[field]?.start || ''}
                onChange={e => onChange(field, { ...values[field], start: e.target.value })}
              />
              <span className="mx-2">até</span>
              <input
                type="date"
                value={values[field]?.end || ''}
                onChange={e => onChange(field, { ...values[field], end: e.target.value })}
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
        return null;
      })}
    </div>
  );
}
