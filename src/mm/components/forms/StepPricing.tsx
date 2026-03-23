import React from 'react';
import { MASSAGE_THERAPIST_FIELDS } from '../../forms/fields';

export function StepPricing({ values, onChange }: {
  values: Record<string, any>;
  onChange: (field: string, value: any) => void;
}) {
  // Simple repeater for rates
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
                type={f.includes('price') || f.includes('duration') ? 'number' : 'text'}
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
      {['starting_rate', 'rates_incall', 'rates_outcall', 'discounts', 'weekly_specials', 'rate_disclaimer', 'payment_methods'].map((field) => {
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
        if (def.type === 'repeater') {
          return renderRepeater(field);
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
