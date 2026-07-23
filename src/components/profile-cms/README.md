# Profile CMS Components

A comprehensive, reusable component system for managing therapist profile fields in MasseurMatch. Built with premium design standards and full type safety.

## Components

### Field Editors

#### TextFieldEditor
Single or multi-line text input with validation support.

```tsx
import { TextFieldEditor } from "@/components/profile-cms";

<TextFieldEditor
  config={fieldConfig}
  value={value}
  onChange={handleChange}
  errors={validationErrors}
  isSaving={false}
  multiline={false}
  rows={4}
/>
```

**Props:**
- `config: ProfileFieldConfig` - Field configuration
- `value: unknown` - Current field value
- `onChange: (value: unknown) => void` - Change handler
- `errors?: string[]` - Validation errors
- `isSaving?: boolean` - Loading state
- `multiline?: boolean` - Enable textarea (default: false)
- `rows?: number` - Textarea rows (default: 4)

---

#### ArrayFieldEditor
Chip-based input for array fields with add/remove functionality.

```tsx
import { ArrayFieldEditor } from "@/components/profile-cms";

<ArrayFieldEditor
  config={fieldConfig}
  value={["item1", "item2"]}
  onChange={handleChange}
  errors={validationErrors}
/>
```

**Features:**
- Add items with Enter key or button click
- Remove items via chip button
- Respects min/max length validation
- Item counter display

---

#### BooleanFieldEditor
Toggle switch for boolean fields.

```tsx
import { BooleanFieldEditor } from "@/components/profile-cms";

<BooleanFieldEditor
  config={fieldConfig}
  value={true}
  onChange={handleChange}
/>
```

**Features:**
- Radix UI Switch component
- Inline enabled/disabled status
- Full accessibility support

---

#### IntegerFieldEditor
Number input with stepper buttons and min/max constraints.

```tsx
import { IntegerFieldEditor } from "@/components/profile-cms";

<IntegerFieldEditor
  config={fieldConfig}
  value={42}
  onChange={handleChange}
/>
```

**Features:**
- Increment/decrement buttons
- Min/max validation
- Range display
- Respects config.validation limits

---

#### JSONEditor
Textarea for JSON data with formatting and validation.

```tsx
import { JSONEditor } from "@/components/profile-cms";

<JSONEditor
  config={fieldConfig}
  value={{ key: "value" }}
  onChange={handleChange}
  showFormatter={true}
/>
```

**Features:**
- JSON validation indicator
- Format button for pretty-printing
- Copy to clipboard button
- Character count
- Monaco Editor compatible (extensible)

---

### Utility Components

#### FieldRenderer
Automatically renders the correct editor based on field type.

```tsx
import { FieldRenderer } from "@/components/profile-cms";

<FieldRenderer
  config={fieldConfig}
  value={currentValue}
  onChange={handleChange}
  errors={validationErrors}
/>
```

Automatically selects:
- `TEXT` → TextFieldEditor
- `ARRAY` → ArrayFieldEditor
- `BOOLEAN` → BooleanFieldEditor
- `INTEGER` → IntegerFieldEditor
- `JSONB` → JSONEditor
- `SELECT` → Native select element

---

#### SectionHeader
Collapsible section header with metadata.

```tsx
import { SectionHeader } from "@/components/profile-cms";

<SectionHeader
  section="services"
  title="Services & Specialties"
  description="Services offered, specialties, and certifications"
  isExpanded={true}
  onToggle={(expanded) => console.log(expanded)}
/>
```

**Props:**
- `section: FieldSection` - Section ID (basic|services|pricing|marketing|advanced)
- `title?: string` - Custom title (auto-provided)
- `description?: string` - Section description (auto-provided)
- `isExpanded?: boolean` - Controlled expansion state
- `onToggle?: (expanded: boolean) => void` - Expansion change handler

---

#### FieldPreview
Read-only display of field values with type-aware rendering.

```tsx
import { FieldPreview } from "@/components/profile-cms";

<FieldPreview
  config={fieldConfig}
  value={currentValue}
/>
```

**Features:**
- Type-aware formatting (arrays as chips, JSON in code block, etc.)
- Automatic empty state handling
- Full metadata display
- Non-interactive

---

#### AuditTrail
Change log component with expandable details and filtering.

```tsx
import { AuditTrail } from "@/components/profile-cms";

<AuditTrail
  history={editHistory}
  recentOnly={false}
  recentLimit={10}
  onFilterByUser={(userId) => console.log(userId)}
/>
```

**Features:**
- Timeline visualization with dots and connecting lines
- Status indicators (approved, pending, rejected)
- Expandable edit details (before/after values)
- User filtering dropdown
- Timestamps and editor attribution
- Change reason display

---

## Types

All types are exported from `@/types/profile-fields`:

```tsx
import {
  FieldType,
  FieldSection,
  ProfileFieldConfig,
  FieldValidation,
  EditHistory,
  ProfileFieldState,
  ProfileCMSState,
  FieldEditorProps,
  SectionHeaderProps,
  AuditTrailProps,
  FieldPreviewProps,
} from "@/types/profile-fields";
```

### FieldType Enum
- `TEXT` - Text input
- `ARRAY` - Array of strings
- `BOOLEAN` - Toggle/checkbox
- `JSONB` - JSON object/array
- `INTEGER` - Number input
- `SELECT` - Dropdown selection

### FieldSection Enum
- `BASIC` - Basic information
- `SERVICES` - Services & specialties
- `PRICING` - Pricing & rates
- `MARKETING` - Marketing & visibility
- `ADVANCED` - Advanced settings

---

## Usage Example

```tsx
import { useState } from "react";
import {
  FieldRenderer,
  SectionHeader,
  FieldPreview,
  AuditTrail,
} from "@/components/profile-cms";
import {
  FieldType,
  FieldSection,
  type ProfileFieldConfig,
  type EditHistory,
} from "@/types/profile-fields";

export function ProfileCMSExample() {
  const [values, setValues] = useState<Record<string, unknown>>({
    therapistName: "John Doe",
    specialties: ["Deep Tissue", "Swedish"],
    isVerified: true,
    hourlyRate: 75,
    bio: "Professional massage therapist...",
  });

  const fieldConfigs: ProfileFieldConfig[] = [
    {
      id: "therapistName",
      label: "Therapist Name",
      type: FieldType.TEXT,
      section: FieldSection.BASIC,
      helpText: "Your professional name as it appears in listings",
      validation: { required: true, maxLength: 100 },
    },
    {
      id: "specialties",
      label: "Specialties",
      type: FieldType.ARRAY,
      section: FieldSection.SERVICES,
      helpText: "Add massage specialties you offer",
      validation: { required: true, maxLength: 10 },
    },
    {
      id: "isVerified",
      label: "Verified Badge",
      type: FieldType.BOOLEAN,
      section: FieldSection.MARKETING,
      helpText: "Display verification badge on profile",
    },
    {
      id: "hourlyRate",
      label: "Hourly Rate",
      type: FieldType.INTEGER,
      section: FieldSection.PRICING,
      validation: { minValue: 30, maxValue: 500 },
    },
    {
      id: "bio",
      label: "Bio",
      type: FieldType.TEXT,
      section: FieldSection.BASIC,
      multiline: true,
    },
  ];

  const editHistory: EditHistory[] = [
    {
      id: "edit1",
      profileId: "profile123",
      fieldId: "therapistName",
      previousValue: "John",
      newValue: "John Doe",
      timestamp: new Date().toISOString(),
      editedBy: "user123",
      editorEmail: "john@example.com",
      status: "approved",
    },
  ];

  return (
    <div className="space-y-8 max-w-4xl mx-auto p-6">
      {fieldConfigs.map((config) => (
        <div key={config.id}>
          <SectionHeader section={config.section} />

          <div className="mt-4">
            <FieldRenderer
              config={config}
              value={values[config.id]}
              onChange={(newValue) =>
                setValues((prev) => ({
                  ...prev,
                  [config.id]: newValue,
                }))
              }
            />
          </div>

          <div className="mt-4">
            <FieldPreview
              config={config}
              value={values[config.id]}
            />
          </div>
        </div>
      ))}

      <div>
        <h2 className="text-2xl font-bold mb-4">Edit History</h2>
        <AuditTrail history={editHistory} />
      </div>
    </div>
  );
}
```

---

## Styling

All components follow MasseurMatch's premium design standards:
- **Colors**: Uses Tailwind CSS color system (accent, foreground, muted-foreground, etc.)
- **Typography**: Satoshi variable font with consistent type scale
- **Spacing**: 4px-based spacing scale (4, 8, 12, 16, 24, 32, 40, 48, 64px)
- **Icons**: Premium lucide-react icons (never text glyphs)
- **Effects**: Restrained, respects `prefers-reduced-motion`
- **Accessibility**: Full ARIA support, keyboard navigation

---

## Validation

All field editors support the `FieldValidation` interface:

```tsx
interface FieldValidation {
  required?: boolean;
  minLength?: number;
  maxLength?: number;
  minValue?: number;
  maxValue?: number;
  pattern?: string;
  errorMessage?: string;
  validate?: (value: unknown) => boolean | string;
}
```

Pass validation errors via the `errors` prop:

```tsx
const [validationErrors, setValidationErrors] = useState<Record<string, string[]>>({});

<FieldRenderer
  config={config}
  value={values[config.id]}
  onChange={handleChange}
  errors={validationErrors[config.id]}
/>
```

---

## Accessibility

All components include:
- Proper label associations
- ARIA attributes
- Keyboard navigation support
- Focus management
- Error announcements
- Respects `prefers-reduced-motion`

---

## Performance

- Forward refs for direct DOM access
- Memoized callbacks with `useCallback`
- Efficient re-renders with proper dependency arrays
- No unnecessary state updates

---

## License

Part of MasseurMatch premium codebase.
