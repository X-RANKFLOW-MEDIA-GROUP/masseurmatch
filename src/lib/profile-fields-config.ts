/**
 * Comprehensive Profile Fields Configuration
 * Centralized configuration for all 59 therapist profile fields
 * organized by section with validation schemas and metadata
 */

import { z } from 'zod'

export enum FieldType {
  TEXT = 'text',
  TEXTAREA = 'textarea',
  ARRAY = 'array',
  BOOLEAN = 'boolean',
  JSONB = 'jsonb',
  INTEGER = 'integer',
  DECIMAL = 'decimal',
  SELECT = 'select',
  MULTISELECT = 'multiselect',
  URL = 'url',
  EMAIL = 'email',
  DATE = 'date',
}

export enum FieldSection {
  BASIC = 'basic',
  SERVICES = 'services',
  PRICING = 'pricing',
  MARKETING = 'marketing',
  ADVANCED = 'advanced',
}

export interface FieldChoice {
  value: string | number
  label: string
  description?: string
}

export interface ProfileFieldDefinition {
  /** Unique field identifier (database column name) */
  key: string
  /** Human-readable field label for UI */
  label: string
  /** Field data type */
  type: FieldType
  /** Section this field belongs to */
  section: FieldSection
  /** Help text displayed in UI */
  help: string
  /** Zod validation schema */
  validationSchema: z.ZodType<unknown>
  /** Options for select/multiselect fields */
  choices?: FieldChoice[]
  /** Whether only admins can edit */
  adminOnly: boolean
  /** Whether this field can be edited by the user */
  editable: boolean
  /** Whether this field must have a value */
  required: boolean
  /** Display order within section */
  order?: number
  /** Placeholder text for input fields */
  placeholder?: string
  /** Default value */
  defaultValue?: unknown
  /** Additional metadata */
  metadata?: Record<string, unknown>
}

/**
 * Validation schemas - reusable Zod patterns for common field types
 */
const schemas = {
  // Text fields
  displayName: z
    .string()
    .min(1, 'Display name is required')
    .max(100, 'Display name must be 100 characters or less'),

  fullName: z
    .string()
    .min(1, 'Full name is required')
    .max(150, 'Full name must be 150 characters or less'),

  slug: z
    .string()
    .regex(/^[a-z0-9-]+$/, 'Slug must contain only lowercase letters, numbers, and hyphens')
    .min(3, 'Slug must be at least 3 characters')
    .max(100, 'Slug must be 100 characters or less'),

  email: z.string().email('Invalid email address'),

  url: z.string().url('Invalid URL').optional().or(z.literal('')),

  biography: z
    .string()
    .max(2000, 'Biography must be 2000 characters or less')
    .optional(),

  tagline: z
    .string()
    .max(200, 'Tagline must be 200 characters or less')
    .optional(),

  // Numeric fields
  yearsExperience: z
    .number()
    .int('Years of experience must be a whole number')
    .min(0, 'Years of experience cannot be negative')
    .max(70, 'Years of experience must be 70 or less')
    .optional(),

  startingPrice: z
    .number()
    .positive('Starting price must be greater than 0')
    .optional(),

  outcallRadius: z
    .number()
    .int('Radius must be a whole number')
    .positive('Radius must be greater than 0')
    .optional(),

  // Array fields
  arrayOfStrings: z.array(z.string()).optional(),

  arrayOfJSON: z.array(z.record(z.unknown())).optional(),

  // Boolean fields
  booleanField: z.boolean().optional(),

  // Select/multiselect
  selectField: z.string().optional(),

  multiSelectField: z.array(z.string()).optional(),

  // JSON fields
  jsonObject: z.record(z.unknown()).optional(),

  jsonArray: z.array(z.record(z.unknown())).optional(),

  // SEO fields
  seoTitle: z
    .string()
    .max(60, 'SEO title should be 60 characters or less for optimal display')
    .optional(),

  seoDescription: z
    .string()
    .max(160, 'SEO description should be 160 characters or less for optimal display')
    .optional(),

  seoKeywords: z
    .array(z.string())
    .max(10, 'Maximum 10 keywords')
    .optional(),
}

/**
 * Complete field configuration array with 59 fields
 */
export const PROFILE_FIELDS_CONFIG: ProfileFieldDefinition[] = [
  // ============================================================================
  // BASIC SECTION (10 fields)
  // ============================================================================

  {
    key: 'display_name',
    label: 'Display Name',
    type: FieldType.TEXT,
    section: FieldSection.BASIC,
    help: 'The name shown on your profile (can be different from legal name)',
    validationSchema: schemas.displayName,
    adminOnly: false,
    editable: true,
    required: true,
    order: 1,
    placeholder: 'e.g., Marcus T.',
  },

  {
    key: 'full_name',
    label: 'Full Legal Name',
    type: FieldType.TEXT,
    section: FieldSection.BASIC,
    help: 'Your complete legal name (used for internal records only)',
    validationSchema: schemas.fullName,
    adminOnly: false,
    editable: true,
    required: true,
    order: 2,
  },

  {
    key: 'avatar_url',
    label: 'Profile Photo',
    type: FieldType.URL,
    section: FieldSection.BASIC,
    help: 'High-quality professional photo (recommended 400x500px minimum)',
    validationSchema: schemas.url,
    adminOnly: false,
    editable: true,
    required: false,
    order: 3,
  },

  {
    key: 'email',
    label: 'Email Address',
    type: FieldType.EMAIL,
    section: FieldSection.BASIC,
    help: 'Primary contact email (not displayed publicly)',
    validationSchema: schemas.email,
    adminOnly: false,
    editable: true,
    required: true,
    order: 4,
  },

  {
    key: 'slug',
    label: 'Profile URL Slug',
    type: FieldType.TEXT,
    section: FieldSection.BASIC,
    help: 'Unique URL identifier (e.g., masseurmatch.com/therapists/your-slug)',
    validationSchema: schemas.slug,
    adminOnly: false,
    editable: true,
    required: true,
    order: 5,
    placeholder: 'e.g., marcus-denver',
  },

  {
    key: 'bio',
    label: 'Biography',
    type: FieldType.TEXTAREA,
    section: FieldSection.BASIC,
    help: 'Tell visitors about yourself, your approach, and specialties',
    validationSchema: schemas.biography,
    adminOnly: false,
    editable: true,
    required: false,
    order: 6,
    placeholder: 'Share your background, philosophy, and what makes your practice unique...',
  },

  {
    key: 'location',
    label: 'Service Location',
    type: FieldType.TEXT,
    section: FieldSection.BASIC,
    help: 'City and state where you primarily operate',
    validationSchema: z.string().max(100).optional(),
    adminOnly: false,
    editable: true,
    required: false,
    order: 7,
    placeholder: 'e.g., Denver, CO',
  },

  {
    key: 'verified',
    label: 'Profile Verified',
    type: FieldType.BOOLEAN,
    section: FieldSection.BASIC,
    help: 'Indicates whether profile has been reviewed and verified',
    validationSchema: schemas.booleanField,
    adminOnly: true,
    editable: false,
    required: false,
    order: 8,
  },

  {
    key: 'created_at',
    label: 'Profile Created',
    type: FieldType.DATE,
    section: FieldSection.BASIC,
    help: 'Date this profile was created',
    validationSchema: z.string().datetime().optional(),
    adminOnly: true,
    editable: false,
    required: false,
    order: 9,
  },

  {
    key: 'updated_at',
    label: 'Last Updated',
    type: FieldType.DATE,
    section: FieldSection.BASIC,
    help: 'Date this profile was last modified',
    validationSchema: z.string().datetime().optional(),
    adminOnly: true,
    editable: false,
    required: false,
    order: 10,
  },

  // ============================================================================
  // SERVICES SECTION (14 fields)
  // ============================================================================

  {
    key: 'education',
    label: 'Education & Training',
    type: FieldType.ARRAY,
    section: FieldSection.SERVICES,
    help: 'Schools, certifications, and formal training programs completed',
    validationSchema: schemas.arrayOfJSON,
    adminOnly: false,
    editable: true,
    required: false,
    order: 1,
  },

  {
    key: 'training',
    label: 'Specialized Training',
    type: FieldType.MULTISELECT,
    section: FieldSection.SERVICES,
    help: 'Select all specialized training you have completed',
    validationSchema: schemas.multiSelectField,
    adminOnly: false,
    editable: true,
    required: false,
    order: 2,
    choices: [
      { value: 'deep_tissue', label: 'Deep Tissue Therapy' },
      { value: 'swedish', label: 'Swedish Massage' },
      { value: 'sports', label: 'Sports Massage' },
      { value: 'thai', label: 'Thai Massage' },
      { value: 'shiatsu', label: 'Shiatsu' },
      { value: 'myofascial_release', label: 'Myofascial Release' },
      { value: 'trigger_point', label: 'Trigger Point Therapy' },
      { value: 'hot_stone', label: 'Hot Stone Massage' },
      { value: 'aromatherapy', label: 'Aromatherapy Massage' },
    ],
  },

  {
    key: 'certifications',
    label: 'Professional Certifications',
    type: FieldType.MULTISELECT,
    section: FieldSection.SERVICES,
    help: 'Select your professional credentials and certifications',
    validationSchema: schemas.multiSelectField,
    adminOnly: false,
    editable: true,
    required: false,
    order: 3,
    choices: [
      { value: 'lmt', label: 'Licensed Massage Therapist (LMT)' },
      { value: 'nctmb', label: 'NCTMB Certified' },
      { value: 'massage_school', label: 'Massage School Diploma' },
      { value: 'anatomy_physiology', label: 'Anatomy & Physiology Certified' },
    ],
  },

  {
    key: 'massage_setup',
    label: 'Massage Setup & Equipment',
    type: FieldType.MULTISELECT,
    section: FieldSection.SERVICES,
    help: 'What equipment and setup you use in your practice',
    validationSchema: schemas.multiSelectField,
    adminOnly: false,
    editable: true,
    required: false,
    order: 4,
    choices: [
      { value: 'professional_table', label: 'Professional Massage Table' },
      { value: 'hot_stones', label: 'Hot Stone Equipment' },
      { value: 'massage_chair', label: 'Massage Chair' },
      { value: 'aromatherapy_diffuser', label: 'Aromatherapy Diffuser' },
      { value: 'heating_pads', label: 'Heating Pads/Blankets' },
    ],
  },

  {
    key: 'incall_amenities',
    label: 'In-Call Amenities',
    type: FieldType.MULTISELECT,
    section: FieldSection.SERVICES,
    help: 'Amenities available at your in-call location',
    validationSchema: schemas.multiSelectField,
    adminOnly: false,
    editable: true,
    required: false,
    order: 5,
    choices: [
      { value: 'private_entrance', label: 'Private Entrance' },
      { value: 'restroom', label: 'Private Restroom' },
      { value: 'parking', label: 'Parking Available' },
      { value: 'wheelchair_accessible', label: 'Wheelchair Accessible' },
      { value: 'noise_controlled', label: 'Noise-Controlled Room' },
      { value: 'lounge_area', label: 'Lounge Area' },
    ],
  },

  {
    key: 'mobile_extras',
    label: 'Mobile/Outcall Extras',
    type: FieldType.MULTISELECT,
    section: FieldSection.SERVICES,
    help: 'Special services or items you bring for mobile appointments',
    validationSchema: schemas.multiSelectField,
    adminOnly: false,
    editable: true,
    required: false,
    order: 6,
    choices: [
      { value: 'portable_table', label: 'Portable Massage Table' },
      { value: 'linens_provided', label: 'Linens & Towels Provided' },
      { value: 'heating_elements', label: 'Heating Elements' },
      { value: 'music_system', label: 'Portable Music System' },
    ],
  },

  {
    key: 'products_used',
    label: 'Products & Oils Used',
    type: FieldType.MULTISELECT,
    section: FieldSection.SERVICES,
    help: 'Types of products and oils you use during massage',
    validationSchema: schemas.multiSelectField,
    adminOnly: false,
    editable: true,
    required: false,
    order: 7,
    choices: [
      { value: 'organic_oils', label: 'Organic Massage Oils' },
      { value: 'unscented', label: 'Unscented Products' },
      { value: 'fragrance_free', label: 'Fragrance-Free Products' },
      { value: 'hypoallergenic', label: 'Hypoallergenic Products' },
      { value: 'vegan_cruelty_free', label: 'Vegan & Cruelty-Free' },
    ],
  },

  {
    key: 'products_sold',
    label: 'Retail Products Available',
    type: FieldType.MULTISELECT,
    section: FieldSection.SERVICES,
    help: 'Retail products you offer for purchase',
    validationSchema: schemas.multiSelectField,
    adminOnly: false,
    editable: true,
    required: false,
    order: 8,
    choices: [
      { value: 'massage_oils', label: 'Massage Oils & Balms' },
      { value: 'essential_oils', label: 'Essential Oils' },
      { value: 'recovery_products', label: 'Recovery Products' },
      { value: 'skincare', label: 'Skincare Products' },
    ],
  },

  {
    key: 'studio_amenities',
    label: 'Studio Amenities',
    type: FieldType.MULTISELECT,
    section: FieldSection.SERVICES,
    help: 'General studio amenities and facilities',
    validationSchema: schemas.multiSelectField,
    adminOnly: false,
    editable: true,
    required: false,
    order: 9,
    choices: [
      { value: 'wifi', label: 'WiFi Available' },
      { value: 'water_station', label: 'Water Station' },
      { value: 'changing_room', label: 'Changing Room' },
      { value: 'shower', label: 'Shower Available' },
    ],
  },

  {
    key: 'affiliations',
    label: 'Professional Affiliations',
    type: FieldType.MULTISELECT,
    section: FieldSection.SERVICES,
    help: 'Professional organizations and groups you belong to',
    validationSchema: schemas.multiSelectField,
    adminOnly: false,
    editable: true,
    required: false,
    order: 10,
    choices: [
      { value: 'amta', label: 'American Massage Therapy Association (AMTA)' },
      { value: 'abmp', label: 'Associated Bodywork & Massage Professionals (ABMP)' },
      { value: 'nctmb', label: 'NCTMB Affiliate' },
      { value: 'local_business', label: 'Local Business Association' },
    ],
  },

  {
    key: 'specializations',
    label: 'Practice Specializations',
    type: FieldType.MULTISELECT,
    section: FieldSection.SERVICES,
    help: 'Your areas of professional specialization',
    validationSchema: schemas.multiSelectField,
    adminOnly: false,
    editable: true,
    required: false,
    order: 11,
    choices: [
      { value: 'relaxation', label: 'Relaxation & Stress Relief' },
      { value: 'injury_recovery', label: 'Injury Recovery' },
      { value: 'athletes', label: 'Athletic Performance' },
      { value: 'chronic_pain', label: 'Chronic Pain Management' },
      { value: 'posture', label: 'Posture & Alignment' },
    ],
  },

  {
    key: 'modality_types',
    label: 'Massage Modalities',
    type: FieldType.MULTISELECT,
    section: FieldSection.SERVICES,
    help: 'Types of massage techniques you offer',
    validationSchema: schemas.multiSelectField,
    adminOnly: false,
    editable: true,
    required: false,
    order: 12,
    choices: [
      { value: 'relaxation', label: 'Relaxation Massage' },
      { value: 'therapeutic', label: 'Therapeutic Massage' },
      { value: 'clinical', label: 'Clinical Massage' },
      { value: 'wellness', label: 'Wellness Massage' },
    ],
  },

  {
    key: 'target_audience',
    label: 'Target Clientele',
    type: FieldType.MULTISELECT,
    section: FieldSection.SERVICES,
    help: 'Types of clients you specialize in serving',
    validationSchema: schemas.multiSelectField,
    adminOnly: false,
    editable: true,
    required: false,
    order: 13,
    choices: [
      { value: 'general_public', label: 'General Public' },
      { value: 'athletes', label: 'Athletes' },
      { value: 'seniors', label: 'Seniors' },
      { value: 'lgbtq_affirming', label: 'LGBTQ+ Affirming' },
      { value: 'individuals_with_disabilities', label: 'Individuals with Disabilities' },
    ],
  },

  {
    key: 'health_credentials',
    label: 'Health Professional Credentials',
    type: FieldType.MULTISELECT,
    section: FieldSection.SERVICES,
    help: 'Any additional healthcare-related credentials',
    validationSchema: schemas.multiSelectField,
    adminOnly: false,
    editable: true,
    required: false,
    order: 14,
    choices: [
      { value: 'bls_cpr', label: 'BLS/CPR Certified' },
      { value: 'first_aid', label: 'First Aid Certified' },
      { value: 'physical_therapy', label: 'Physical Therapy Related' },
    ],
  },

  // ============================================================================
  // PRICING SECTION (13 fields)
  // ============================================================================

  {
    key: 'pricing_sessions',
    label: 'Session Pricing',
    type: FieldType.JSONB,
    section: FieldSection.PRICING,
    help: 'Pricing for different session lengths (60min, 90min, 120min, etc.)',
    validationSchema: schemas.jsonObject,
    adminOnly: false,
    editable: true,
    required: false,
    order: 1,
  },

  {
    key: 'regular_discounts',
    label: 'Regular Client Discounts',
    type: FieldType.TEXTAREA,
    section: FieldSection.PRICING,
    help: 'Describe any discounts for recurring clients or packages',
    validationSchema: z.string().max(500).optional(),
    adminOnly: false,
    editable: true,
    required: false,
    order: 2,
  },

  {
    key: 'day_of_week_discount',
    label: 'Day-of-Week Discounts',
    type: FieldType.TEXTAREA,
    section: FieldSection.PRICING,
    help: 'E.g., weekday discounts, off-peak pricing',
    validationSchema: z.string().max(500).optional(),
    adminOnly: false,
    editable: true,
    required: false,
    order: 3,
  },

  {
    key: 'weekly_special',
    label: 'Weekly Special Offers',
    type: FieldType.TEXTAREA,
    section: FieldSection.PRICING,
    help: 'Current promotional offers or limited-time specials',
    validationSchema: z.string().max(500).optional(),
    adminOnly: false,
    editable: true,
    required: false,
    order: 4,
  },

  {
    key: 'business_hours',
    label: 'Business Hours',
    type: FieldType.JSONB,
    section: FieldSection.PRICING,
    help: 'Your availability by day of week (e.g., {"monday": "10:00-18:00"})',
    validationSchema: schemas.jsonObject,
    adminOnly: false,
    editable: true,
    required: false,
    order: 5,
  },

  {
    key: 'incall',
    label: 'In-Call Service Available',
    type: FieldType.BOOLEAN,
    section: FieldSection.PRICING,
    help: 'Whether you offer in-call services at your location',
    validationSchema: schemas.booleanField,
    adminOnly: false,
    editable: true,
    required: false,
    order: 6,
  },

  {
    key: 'outcall',
    label: 'Outcall/Mobile Service Available',
    type: FieldType.BOOLEAN,
    section: FieldSection.PRICING,
    help: 'Whether you offer mobile massage at client locations',
    validationSchema: schemas.booleanField,
    adminOnly: false,
    editable: true,
    required: false,
    order: 7,
  },

  {
    key: 'traveling',
    label: 'Traveling Services',
    type: FieldType.BOOLEAN,
    section: FieldSection.PRICING,
    help: 'Whether you travel to different cities for work',
    validationSchema: schemas.booleanField,
    adminOnly: false,
    editable: true,
    required: false,
    order: 8,
  },

  {
    key: 'visiting',
    label: 'Visiting Service Information',
    type: FieldType.TEXTAREA,
    section: FieldSection.PRICING,
    help: 'Details about which cities/regions you visit and when',
    validationSchema: z.string().max(1000).optional(),
    adminOnly: false,
    editable: true,
    required: false,
    order: 9,
  },

  {
    key: 'starting_price',
    label: 'Starting Price',
    type: FieldType.DECIMAL,
    section: FieldSection.PRICING,
    help: 'Minimum session price (in USD)',
    validationSchema: schemas.startingPrice,
    adminOnly: false,
    editable: true,
    required: false,
    order: 10,
    placeholder: '60.00',
  },

  {
    key: 'outcall_radius_miles',
    label: 'Outcall Service Radius',
    type: FieldType.INTEGER,
    section: FieldSection.PRICING,
    help: 'Maximum distance you travel for outcall services (in miles)',
    validationSchema: schemas.outcallRadius,
    adminOnly: false,
    editable: true,
    required: false,
    order: 11,
    placeholder: '15',
  },

  {
    key: 'deposit_required',
    label: 'Deposit Policy',
    type: FieldType.TEXTAREA,
    section: FieldSection.PRICING,
    help: 'Describe any deposit requirements or cancellation fees',
    validationSchema: z.string().max(500).optional(),
    adminOnly: false,
    editable: true,
    required: false,
    order: 12,
  },

  {
    key: 'cancellation_policy',
    label: 'Cancellation Policy',
    type: FieldType.TEXTAREA,
    section: FieldSection.PRICING,
    help: 'Your cancellation and rescheduling policies',
    validationSchema: z.string().max(1000).optional(),
    adminOnly: false,
    editable: true,
    required: false,
    order: 13,
  },

  // ============================================================================
  // MARKETING SECTION (12 fields)
  // ============================================================================

  {
    key: 'seo_title',
    label: 'Page Title (SEO)',
    type: FieldType.TEXT,
    section: FieldSection.MARKETING,
    help: 'Page title for search engines (60 chars max recommended)',
    validationSchema: schemas.seoTitle,
    adminOnly: false,
    editable: true,
    required: false,
    order: 1,
    placeholder: 'Licensed Massage Therapist in Denver | LGBTQ+ Affirming',
  },

  {
    key: 'seo_description',
    label: 'Meta Description (SEO)',
    type: FieldType.TEXTAREA,
    section: FieldSection.MARKETING,
    help: 'Page description for search engines (160 chars max recommended)',
    validationSchema: schemas.seoDescription,
    adminOnly: false,
    editable: true,
    required: false,
    order: 2,
    placeholder: 'Professional therapeutic massage services in Denver. LGBTQ+ affirming, accepting new clients.',
  },

  {
    key: 'presentation_video_url',
    label: 'Introduction Video',
    type: FieldType.URL,
    section: FieldSection.MARKETING,
    help: 'YouTube or Vimeo link to your introduction video',
    validationSchema: schemas.url,
    adminOnly: false,
    editable: true,
    required: false,
    order: 3,
  },

  {
    key: 'social_media',
    label: 'Social Media Links',
    type: FieldType.JSONB,
    section: FieldSection.MARKETING,
    help: 'Links to your social profiles (Instagram, Facebook, LinkedIn, etc.)',
    validationSchema: schemas.jsonObject,
    adminOnly: false,
    editable: true,
    required: false,
    order: 4,
  },

  {
    key: 'tagline',
    label: 'Profile Tagline',
    type: FieldType.TEXT,
    section: FieldSection.MARKETING,
    help: 'Short catchy phrase about your services (200 chars max)',
    validationSchema: schemas.tagline,
    adminOnly: false,
    editable: true,
    required: false,
    order: 5,
    placeholder: 'Therapeutic massage for athletes and active lifestyles',
  },

  {
    key: 'booking_platform',
    label: 'Booking Platform',
    type: FieldType.SELECT,
    section: FieldSection.MARKETING,
    help: 'Where clients can book appointments with you',
    validationSchema: schemas.selectField,
    adminOnly: false,
    editable: true,
    required: false,
    order: 6,
    choices: [
      { value: 'direct_email', label: 'Direct Email' },
      { value: 'direct_phone', label: 'Direct Phone' },
      { value: 'acuity', label: 'Acuity Scheduling' },
      { value: 'mindbody', label: 'Mindbody' },
      { value: 'calend_ly', label: 'Calendly' },
      { value: 'square', label: 'Square Appointments' },
      { value: 'custom_website', label: 'Custom Website' },
    ],
  },

  {
    key: 'booking_url',
    label: 'Booking Link',
    type: FieldType.URL,
    section: FieldSection.MARKETING,
    help: 'Direct link to your booking page or calendar',
    validationSchema: schemas.url,
    adminOnly: false,
    editable: true,
    required: false,
    order: 7,
  },

  {
    key: 'segments',
    label: 'Marketing Segments',
    type: FieldType.MULTISELECT,
    section: FieldSection.MARKETING,
    help: 'Select segments for targeted marketing campaigns',
    validationSchema: schemas.multiSelectField,
    adminOnly: true,
    editable: false,
    required: false,
    order: 8,
    choices: [
      { value: 'featured', label: 'Featured Therapist' },
      { value: 'premium', label: 'Premium Member' },
      { value: 'new_profile', label: 'New Profile' },
      { value: 'highly_rated', label: 'Highly Rated' },
    ],
  },

  {
    key: 'keyword_slugs',
    label: 'Keyword Slugs',
    type: FieldType.ARRAY,
    section: FieldSection.MARKETING,
    help: 'Keywords associated with your profile for search',
    validationSchema: schemas.arrayOfStrings,
    adminOnly: false,
    editable: true,
    required: false,
    order: 9,
  },

  {
    key: 'media_files',
    label: 'Media Gallery',
    type: FieldType.ARRAY,
    section: FieldSection.MARKETING,
    help: 'URLs to additional photos and media (studio, setup, etc.)',
    validationSchema: schemas.arrayOfStrings,
    adminOnly: false,
    editable: true,
    required: false,
    order: 10,
  },

  {
    key: 'testimonials',
    label: 'Client Testimonials',
    type: FieldType.ARRAY,
    section: FieldSection.MARKETING,
    help: 'Positive reviews and testimonials from clients',
    validationSchema: schemas.arrayOfJSON,
    adminOnly: false,
    editable: true,
    required: false,
    order: 11,
  },

  {
    key: 'featured_offer',
    label: 'Featured Special Offer',
    type: FieldType.TEXTAREA,
    section: FieldSection.MARKETING,
    help: 'Highlight a special promotion or offer on your profile',
    validationSchema: z.string().max(500).optional(),
    adminOnly: false,
    editable: true,
    required: false,
    order: 12,
  },

  // ============================================================================
  // ADVANCED SECTION (10 fields)
  // ============================================================================

  {
    key: 'custom_faq',
    label: 'Custom FAQ',
    type: FieldType.ARRAY,
    section: FieldSection.ADVANCED,
    help: 'Frequently asked questions and answers specific to your practice',
    validationSchema: schemas.arrayOfJSON,
    adminOnly: false,
    editable: true,
    required: false,
    order: 1,
  },

  {
    key: 'is_demo',
    label: 'Demo Profile',
    type: FieldType.BOOLEAN,
    section: FieldSection.ADVANCED,
    help: 'Marks this as a demonstration profile (not a real therapist)',
    validationSchema: schemas.booleanField,
    adminOnly: true,
    editable: false,
    required: false,
    order: 2,
  },

  {
    key: 'profile_completeness',
    label: 'Profile Completeness Score',
    type: FieldType.DECIMAL,
    section: FieldSection.ADVANCED,
    help: 'Percentage of profile fields that have been filled (0-100)',
    validationSchema: z.number().min(0).max(100).optional(),
    adminOnly: true,
    editable: false,
    required: false,
    order: 3,
  },

  {
    key: 'years_experience',
    label: 'Years of Experience',
    type: FieldType.INTEGER,
    section: FieldSection.ADVANCED,
    help: 'How many years you have been practicing massage therapy',
    validationSchema: schemas.yearsExperience,
    adminOnly: false,
    editable: true,
    required: false,
    order: 4,
    placeholder: '5',
  },

  {
    key: 'seo_keywords',
    label: 'SEO Keywords',
    type: FieldType.ARRAY,
    section: FieldSection.ADVANCED,
    help: 'Keywords for search engine optimization (comma-separated or array)',
    validationSchema: schemas.seoKeywords,
    adminOnly: false,
    editable: true,
    required: false,
    order: 5,
  },

  {
    key: 'profile_status',
    label: 'Profile Status',
    type: FieldType.SELECT,
    section: FieldSection.ADVANCED,
    help: 'Current status of the profile in the system',
    validationSchema: schemas.selectField,
    adminOnly: true,
    editable: false,
    required: false,
    order: 6,
    choices: [
      { value: 'draft', label: 'Draft' },
      { value: 'submitted', label: 'Submitted for Review' },
      { value: 'approved', label: 'Approved' },
      { value: 'active', label: 'Active' },
      { value: 'suspended', label: 'Suspended' },
      { value: 'archived', label: 'Archived' },
    ],
  },

  {
    key: 'quality_score',
    label: 'Quality Score',
    type: FieldType.DECIMAL,
    section: FieldSection.ADVANCED,
    help: 'Internal metric for profile quality and completeness (0-100)',
    validationSchema: z.number().min(0).max(100).optional(),
    adminOnly: true,
    editable: false,
    required: false,
    order: 7,
  },

  {
    key: 'premium_features',
    label: 'Premium Features Enabled',
    type: FieldType.MULTISELECT,
    section: FieldSection.ADVANCED,
    help: 'Advanced features available to this profile',
    validationSchema: schemas.multiSelectField,
    adminOnly: true,
    editable: true,
    required: false,
    order: 8,
    choices: [
      { value: 'featured_listing', label: 'Featured Listing' },
      { value: 'priority_search', label: 'Priority in Search' },
      { value: 'advanced_analytics', label: 'Advanced Analytics' },
      { value: 'custom_domain', label: 'Custom Domain' },
      { value: 'video_badge', label: 'Video Badge' },
    ],
  },

  {
    key: 'subscription_status',
    label: 'Subscription Status',
    type: FieldType.SELECT,
    section: FieldSection.ADVANCED,
    help: 'Subscription or membership level status',
    validationSchema: schemas.selectField,
    adminOnly: true,
    editable: true,
    required: false,
    order: 9,
    choices: [
      { value: 'free', label: 'Free' },
      { value: 'basic', label: 'Basic' },
      { value: 'premium', label: 'Premium' },
      { value: 'pro', label: 'Professional' },
    ],
  },

  {
    key: 'certifications_verified',
    label: 'Certifications Verified',
    type: FieldType.BOOLEAN,
    section: FieldSection.ADVANCED,
    help: 'Whether professional certifications have been verified',
    validationSchema: schemas.booleanField,
    adminOnly: true,
    editable: true,
    required: false,
    order: 10,
  },
]

/**
 * Helper function to get fields by section
 */
export function getFieldsBySection(
  section: FieldSection,
): ProfileFieldDefinition[] {
  return PROFILE_FIELDS_CONFIG.filter((field) => field.section === section).sort(
    (a, b) => (a.order ?? 999) - (b.order ?? 999),
  )
}

/**
 * Helper function to get a single field by key
 */
export function getFieldByKey(key: string): ProfileFieldDefinition | undefined {
  return PROFILE_FIELDS_CONFIG.find((field) => field.key === key)
}

/**
 * Helper function to get all editable fields
 */
export function getEditableFields(): ProfileFieldDefinition[] {
  return PROFILE_FIELDS_CONFIG.filter((field) => field.editable)
}

/**
 * Helper function to get all required fields
 */
export function getRequiredFields(): ProfileFieldDefinition[] {
  return PROFILE_FIELDS_CONFIG.filter((field) => field.required)
}

/**
 * Helper function to get all admin-only fields
 */
export function getAdminOnlyFields(): ProfileFieldDefinition[] {
  return PROFILE_FIELDS_CONFIG.filter((field) => field.adminOnly)
}

/**
 * Helper function to validate a field value
 */
export function validateFieldValue(
  key: string,
  value: unknown,
): { valid: boolean; error?: string } {
  const field = getFieldByKey(key)
  if (!field) {
    return { valid: false, error: `Field "${key}" not found` }
  }

  try {
    field.validationSchema.parse(value)
    return { valid: true }
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Validation failed'
    return { valid: false, error: message }
  }
}

/**
 * Type export for using field definitions in components
 */
export type FieldDefinition = ProfileFieldDefinition
