import React from 'react';
import { MASSAGE_THERAPIST_FIELDS } from '../../forms/fields';
import { TRUST_LABELS } from '../../utils/trustLabels';

export function StepTrust({ values, onChange }: {
  values: Record<string, any>;
  onChange: (field: string, value: any) => void;
}) {
  return (
    <div className="space-y-4">
      {['tier', 'is_verified_profile', 'lgbtq_friendly', 'visiting_soon', 'top_rated'].map((field) => {
        const def = MASSAGE_THERAPIST_FIELDS[field];
        if (!def) return null;
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
                {def.options.map((opt: string) => (
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
        return null;
      })}
      <div>
        <label className="block font-medium mb-1">Trust Badges (permitidos)</label>
        <ul className="list-disc ml-6">
          {TRUST_LABELS.map(label => <li key={label}>{label}</li>)}
        </ul>
      </div>
    </div>
  );
}
