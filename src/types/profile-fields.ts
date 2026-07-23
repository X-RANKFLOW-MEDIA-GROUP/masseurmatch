/**
 * Profile CMS Type Definitions
 * Comprehensive types for managing therapist profile fields, validation, and edit history
 */

export enum FieldType {
  TEXT = "text",
  ARRAY = "array",
  BOOLEAN = "boolean",
  JSONB = "jsonb",
  INTEGER = "integer",
  SELECT = "select",
}

export enum FieldSection {
  BASIC = "basic",
  SERVICES = "services",
  PRICING = "pricing",
  MARKETING = "marketing",
  ADVANCED = "advanced",
}

export interface FieldValidation {
  /** Whether the field is required */
  required?: boolean;
  /** Minimum length for text/array fields */
  minLength?: number;
  /** Maximum length for text/array fields */
  maxLength?: number;
  /** Minimum value for integer fields */
  minValue?: number;
  /** Maximum value for integer fields */
  maxValue?: number;
  /** Regular expression pattern for text validation */
  pattern?: string;
  /** Custom validation message */
  errorMessage?: string;
  /** Custom validation function */
  validate?: (value: unknown) => boolean | string;
}

export interface ProfileFieldConfig {
  /** Unique field identifier */
  id: string;
  /** Human-readable field label */
  label: string;
  /** Help text displayed below the label */
  helpText?: string;
  /** The type of field */
  type: FieldType;
  /** Which section this field belongs to */
  section: FieldSection;
  /** Whether the field is read-only */
  readOnly?: boolean;
  /** Whether the field is visible in the UI */
  visible?: boolean;
  /** Display order within section */
  order?: number;
  /** Field-specific options (for select fields) */
  options?: Array<{
    value: string | number;
    label: string;
    description?: string;
  }>;
  /** Placeholder text */
  placeholder?: string;
  /** Default value for the field */
  defaultValue?: unknown;
  /** Validation rules */
  validation?: FieldValidation;
  /** Additional metadata */
  metadata?: Record<string, unknown>;
}

export interface EditHistory {
  /** Unique identifier for this edit */
  id: string;
  /** ID of the profile being edited */
  profileId: string;
  /** ID of the field that was changed */
  fieldId: string;
  /** The previous value before edit */
  previousValue: unknown;
  /** The new value after edit */
  newValue: unknown;
  /** Timestamp of the edit */
  timestamp: string; // ISO 8601
  /** User ID who made the edit */
  editedBy: string;
  /** User's email who made the edit */
  editorEmail?: string;
  /** Optional reason or note for the change */
  changeReason?: string;
  /** Status: pending, approved, rejected */
  status?: "pending" | "approved" | "rejected";
}

export interface ProfileFieldState {
  /** Current field configuration */
  config: ProfileFieldConfig;
  /** Current field value */
  value: unknown;
  /** Whether the field has been modified */
  isDirty: boolean;
  /** Field-level validation errors */
  errors: string[];
  /** Whether the field is currently being saved */
  isSaving: boolean;
  /** Last successful save timestamp */
  lastSaved?: string; // ISO 8601
}

export interface ProfileCMSState {
  /** All field configurations keyed by section */
  fields: Record<FieldSection, ProfileFieldConfig[]>;
  /** Current field values keyed by field ID */
  values: Record<string, unknown>;
  /** Field validation states */
  fieldStates: Record<string, ProfileFieldState>;
  /** Whether any fields have been modified */
  isDirty: boolean;
  /** Global validation errors */
  errors: Record<string, string[]>;
  /** Whether currently saving */
  isSaving: boolean;
  /** Edit history for audit trail */
  editHistory: EditHistory[];
}

export interface FieldEditorProps {
  /** Field configuration */
  config: ProfileFieldConfig;
  /** Current field value */
  value: unknown;
  /** Called when value changes */
  onChange: (value: unknown) => void;
  /** Validation errors for this field */
  errors?: string[];
  /** Whether the field is in saving state */
  isSaving?: boolean;
  /** Additional CSS classes */
  className?: string;
}

export interface SectionHeaderProps {
  /** Section identifier */
  section: FieldSection;
  /** Human-readable section title */
  title: string;
  /** Optional description of the section */
  description?: string;
  /** Whether the section is expanded */
  isExpanded?: boolean;
  /** Called when expand/collapse changes */
  onToggle?: (expanded: boolean) => void;
  /** Additional CSS classes */
  className?: string;
}

export interface AuditTrailProps {
  /** Edit history records to display */
  history: EditHistory[];
  /** Whether to show only recent changes */
  recentOnly?: boolean;
  /** Number of recent items to show (default: 10) */
  recentLimit?: number;
  /** Called when filtering by user */
  onFilterByUser?: (userId: string) => void;
  /** Additional CSS classes */
  className?: string;
}

export interface FieldPreviewProps {
  /** Field configuration */
  config: ProfileFieldConfig;
  /** Field value to display */
  value: unknown;
  /** Additional CSS classes */
  className?: string;
}
