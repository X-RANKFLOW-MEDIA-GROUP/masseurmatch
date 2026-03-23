import React from 'react';
import { MASSAGE_THERAPIST_FIELDS } from '../../forms/fields';

export function StepServices({ values, onChange }: {
  values: Record<string, any>;
  onChange: (field: string, value: any) => void;
}) {
  return (
    <div className="space-y-4">
      {['massage_techniques', 'specialties', 'massage_setup', 'mobile_extras', 'incall_amenities', 'additional_services', 'products_used', 'products_sold'].map((field) => {
        const def = MASSAGE_THERAPIST_FIELDS[field];
        if (!def) return null;
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
