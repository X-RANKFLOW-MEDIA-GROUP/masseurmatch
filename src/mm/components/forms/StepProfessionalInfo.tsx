import React from 'react';
import { MASSAGE_THERAPIST_FIELDS } from '../../forms/fields';

export function StepProfessionalInfo({ values, onChange }: {
  values: Record<string, any>;
  onChange: (field: string, value: any) => void;
}) {
  // Simple repeater for education/licenses
  const renderRepeater = (field: string) => {
    const items = values[field] || [];
    const def = MASSAGE_THERAPIST_FIELDS[field];
    return (
      <div className="mb-4">
        <label className="block font-medium mb-1">{def.label}</label>
        {items.map((item: any, idx: number) => (
          <div key={idx} className="flex gap-2 mb-2">
            {def.fields.map((f: string) => (
              <input
                key={f}
                type={f.includes('date') ? 'date' : 'text'}
                className="input input-bordered"
                placeholder={f}
                value={item[f] || ''}
                onChange={e => {
                  const newItems = [...items];
                  newItems[idx] = { ...newItems[idx], [f]: e.target.value };
                  onChange(field, newItems);
                }}
              />
            ))}
            <button type="button" onClick={() => {
              const newItems = items.filter((_: any, i: number) => i !== idx);
              onChange(field, newItems);
            }}>Remove</button>
          </div>
        ))}
        <button type="button" onClick={() => {
          onChange(field, [...items, {}]);
        }}>Add</button>
      </div>
    );
  };

  return (
    <div className="space-y-4">
      {['years_experience'].map((field) => {
        const def = MASSAGE_THERAPIST_FIELDS[field];
        if (!def) return null;
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
            </div>
          );
        }
        return null;
      })}
      {['education', 'licenses'].map(renderRepeater)}
      {['affiliations'].map((field) => {
        const def = MASSAGE_THERAPIST_FIELDS[field];
        if (!def) return null;
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
