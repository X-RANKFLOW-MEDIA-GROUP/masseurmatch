import React from 'react';
import { MASSAGE_THERAPIST_FIELDS } from '../../forms/fields';

export function StepContact({ values, onChange }: {
  values: Record<string, any>;
  onChange: (field: string, value: any) => void;
}) {
  return (
    <div className="space-y-4">
      {['phone_number', 'show_email_button', 'email_address', 'booking_link', 'whatsapp_number', 'telegram_handle'].map((field) => {
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
        if (def.type === 'phone' || def.type === 'email' || def.type === 'url' || def.type === 'text') {
          return (
            <div key={field}>
              <label className="block font-medium mb-1">{def.label}</label>
              <input
                type={def.type === 'email' ? 'email' : def.type === 'url' ? 'url' : 'text'}
                className="input input-bordered w-full"
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
