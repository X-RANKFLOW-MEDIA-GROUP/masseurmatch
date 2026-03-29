import React from 'react';
import { MASSAGE_THERAPIST_FIELDS } from '../../forms/fields';

export function StepAppointmentTypes({ values, onChange }: {
  values: Record<string, any>;
  onChange: (field: string, value: any) => void;
}) {
  return (
    <div className="space-y-4">
      {['offers_incall', 'offers_outcall', 'outcall_radius', 'service_area_cities'].map((field) => {
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
        if (def.type === 'number') {
          return (
            <div key={field}>
              <label className="block font-medium mb-1">{def.label}</label>
              <input
                type="number"
                className="input input-bordered w-full"
                value={values[field] || ''}
                onChange={e => onChange(field, Number(e.target.value))}
              />
              {def.suffix && <span className="ml-2">{def.suffix}</span>}
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
