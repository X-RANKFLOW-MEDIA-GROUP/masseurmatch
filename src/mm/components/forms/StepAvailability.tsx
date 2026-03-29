import React from 'react';
import { MASSAGE_THERAPIST_FIELDS } from '../../forms/fields';

export function StepAvailability({ values, onChange }: {
  values: Record<string, any>;
  onChange: (field: string, value: any) => void;
}) {
  // Simple weekly schedule input
  const renderSchedule = (field: string) => {
    const days = ['monday','tuesday','wednesday','thursday','friday','saturday','sunday'];
    const schedule = values[field] || {};
    return (
      <div className="mb-4">
        <label className="block font-medium mb-1">{MASSAGE_THERAPIST_FIELDS[field].label}</label>
        <table className="table w-full">
          <thead><tr><th>Day</th><th>Enabled</th><th>Start</th><th>End</th></tr></thead>
          <tbody>
            {days.map(day => (
              <tr key={day}>
                <td className="capitalize">{day}</td>
                <td><input type="checkbox" checked={schedule[day]?.enabled || false} onChange={e => {
                  onChange(field, { ...schedule, [day]: { ...schedule[day], enabled: e.target.checked } });
                }} /></td>
                <td><input type="time" value={schedule[day]?.start || ''} onChange={e => {
                  onChange(field, { ...schedule, [day]: { ...schedule[day], start: e.target.value } });
                }} /></td>
                <td><input type="time" value={schedule[day]?.end || ''} onChange={e => {
                  onChange(field, { ...schedule, [day]: { ...schedule[day], end: e.target.value } });
                }} /></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  };

  return (
    <div className="space-y-4">
      {['incall_hours', 'outcall_hours'].map(renderSchedule)}
      {['available_now', 'available_today', 'same_day_booking'].map((field) => {
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
        return null;
      })}
    </div>
  );
}
