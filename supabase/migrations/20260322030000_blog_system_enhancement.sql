-- ============================================================================
-- Blog System Enhancement: add category, author, read_time, cover_image
-- Extends the existing blog_posts table for full editorial workflow
-- ============================================================================

ALTER TABLE public.blog_posts
  ADD COLUMN IF NOT EXISTS category       text DEFAULT 'Wellness Tips',
  ADD COLUMN IF NOT EXISTS author_name    text DEFAULT 'MasseurMatch Editorial',
  ADD COLUMN IF NOT EXISTS author_title   text DEFAULT 'Wellness & Inclusivity Editor',
  ADD COLUMN IF NOT EXISTS read_time_min  integer DEFAULT 5,
  ADD COLUMN IF NOT EXISTS cover_image    text,
  ADD COLUMN IF NOT EXISTS cover_alt      text,
  ADD COLUMN IF NOT EXISTS is_featured    boolean NOT NULL DEFAULT false;

-- Index for fast listing queries
CREATE INDEX IF NOT EXISTS idx_blog_posts_published_at
  ON public.blog_posts (published_at DESC);

CREATE INDEX IF NOT EXISTS idx_blog_posts_category
  ON public.blog_posts (category);

CREATE INDEX IF NOT EXISTS idx_blog_posts_featured
  ON public.blog_posts (is_featured)
  WHERE is_featured = true;

CREATE INDEX IF NOT EXISTS idx_blog_posts_tags
  ON public.blog_posts USING gin (tags);

-- Enable RLS
ALTER TABLE public.blog_posts ENABLE ROW LEVEL SECURITY;

-- Public can read all published posts
DROP POLICY IF EXISTS "blog_posts_public_read" ON public.blog_posts;
CREATE POLICY "blog_posts_public_read"
  ON public.blog_posts FOR SELECT
  USING (true);

-- Only admins can insert/update/delete
DROP POLICY IF EXISTS "blog_posts_admin_write" ON public.blog_posts;
CREATE POLICY "blog_posts_admin_write"
  ON public.blog_posts FOR ALL TO authenticated
  USING (public.is_admin());

-- Seed initial editorial content for LGBTQ+ SEO strategy
INSERT INTO public.blog_posts (slug, title, excerpt, seo_description, content, tags, category, published_at)
VALUES
  (
    'lgbtq-affirming-massage-guide',
    'How to Find an LGBTQ+-Affirming Massage Therapist',
    'Your therapeutic environment matters. Learn what signals to look for and what questions to ask when searching for an inclusive therapist.',
    'Guide to finding LGBTQ+-affirming massage therapists. What to look for, questions to ask, and how MasseurMatch verifies inclusive practice.',
    '[{"type":"paragraph","content":"Finding a massage therapist who genuinely understands and respects your identity isn''t just a preference — it''s a safety requirement. For LGBTQ+ individuals, the vulnerability of bodywork makes the therapeutic relationship uniquely important."},{"type":"h2","content":"What Does ''LGBTQ+-Affirming'' Actually Mean?"},{"type":"paragraph","content":"An affirming therapist goes beyond tolerance. They have specific training in working with diverse bodies and identities, use inclusive intake forms, and create an environment where you don''t have to educate your provider about your basic humanity."},{"type":"h2","content":"Key Signals to Look For"},{"type":"ul","content":["Gender-neutral intake forms that ask for pronouns","Visible LGBTQ+ affirming signage or website language","Explicit non-discrimination policies","Training certifications in inclusive bodywork","Reviews from other LGBTQ+ clients"]},{"type":"h2","content":"Questions to Ask Before Booking"},{"type":"ul","content":["Do you have experience working with LGBTQ+ clients?","What does your intake process look like?","How do you handle draping for clients with diverse body types?","Are you trained in trauma-informed touch?"]},{"type":"callout","content":"On MasseurMatch, therapists who have completed LGBTQ+-inclusive training and meet our affirming practice standards display a verified badge on their profile. Use the LGBTQ+ Affirming filter in search to find them instantly."},{"type":"h2","content":"Why Platform Verification Matters"},{"type":"paragraph","content":"Anyone can claim to be inclusive. MasseurMatch requires therapists to demonstrate their commitment through documented training, adherence to our community guidelines, and ongoing accountability through the review system."}]',
    ARRAY['LGBTQ+', 'affirming care', 'massage therapy', 'gay massage', 'inclusive bodywork'],
    'LGBTQ+ Health',
    '2025-03-08T09:00:00Z'
  ),
  (
    'trans-inclusive-bodywork',
    'Trans-Inclusive Bodywork: What Therapists Need to Know',
    'Creating genuine safety for transgender clients requires more than good intentions. Practical guidance for therapists committed to inclusive practice.',
    'Comprehensive guide for massage therapists on trans-inclusive bodywork practices, intake processes, and creating genuine safety for transgender clients.',
    '[{"type":"paragraph","content":"Transgender and non-binary clients often face unique barriers to accessing bodywork. Discomfort with traditional intake processes, anxiety about misgendering, and past experiences of discrimination can make the prospect of massage therapy feel inaccessible — even when it would be profoundly beneficial."},{"type":"h2","content":"Start with Your Intake Process"},{"type":"paragraph","content":"Your intake form is the first signal a client receives about your practice. Replace ''Male/Female'' checkboxes with open-ended gender identity fields. Ask for pronouns. Include a question about areas of the body the client would prefer not to have touched — without requiring justification."},{"type":"h2","content":"Language and Communication"},{"type":"ul","content":["Use the client''s stated name and pronouns consistently","Ask about touch preferences without making assumptions about the body","Never comment on a client''s body in ways that reference their transition","Frame all communication around the client''s comfort and agency"]},{"type":"h2","content":"Draping and Body Work"},{"type":"paragraph","content":"Standard draping protocols should work for all clients, but be prepared to adapt. Some trans clients may want additional draping in certain areas. Others may have post-surgical considerations. The key is asking, not assuming."},{"type":"callout","content":"A simple question like ''Is there anything about your body or comfort that would be helpful for me to know before we start?'' creates space without requiring disclosure."},{"type":"h2","content":"Continuing Education"},{"type":"paragraph","content":"Seek out specific training in trans-inclusive bodywork. Organizations like the National LGBTQ+ Task Force and the Gay and Lesbian Medical Association offer resources. MasseurMatch partners with certified trainers to provide ongoing education for platform therapists."}]',
    ARRAY['trans', 'LGBTQ+', 'inclusive bodywork', 'transgender massage', 'therapist training'],
    'LGBTQ+ Health',
    '2025-01-22T09:00:00Z'
  ),
  (
    'deep-tissue-vs-swedish',
    'Deep Tissue vs Swedish Massage: Which Is Right for You?',
    'Two of the most popular massage modalities serve very different purposes. Break down the key differences before your next booking.',
    'Compare deep tissue and Swedish massage techniques, benefits, and ideal use cases. Learn which modality is right for your wellness goals.',
    '[{"type":"paragraph","content":"Deep tissue and Swedish massage are the two most commonly requested modalities, but they serve fundamentally different purposes. Understanding the difference helps you book the right session and communicate effectively with your therapist."},{"type":"h2","content":"Swedish Massage: The Foundation"},{"type":"paragraph","content":"Swedish massage uses long, flowing strokes (effleurage), kneading (petrissage), and rhythmic tapping to promote general relaxation and improve circulation. Pressure is typically light to moderate."},{"type":"ul","content":["Best for: stress relief, general relaxation, first-time clients","Pressure: light to moderate","Session length: 60–90 minutes is ideal","Recovery: minimal; most people feel relaxed immediately"]},{"type":"h2","content":"Deep Tissue: Targeted Relief"},{"type":"paragraph","content":"Deep tissue massage uses slower, more concentrated strokes targeting the deeper layers of muscle and fascia. It''s designed to break up adhesions (knots) and relieve chronic tension patterns."},{"type":"ul","content":["Best for: chronic pain, sports recovery, repetitive strain injuries","Pressure: firm to deep","Session length: 60–90 minutes; can be intense","Recovery: some soreness for 24–48 hours is normal"]},{"type":"h2","content":"Which Should You Choose?"},{"type":"paragraph","content":"If you''re new to massage or primarily seeking relaxation, start with Swedish. If you have specific pain points, chronic tension, or athletic recovery needs, deep tissue is likely more effective."},{"type":"callout","content":"Many therapists blend techniques within a single session. You can always start with Swedish pressure and ask your therapist to go deeper in specific areas if needed."}]',
    ARRAY['deep tissue', 'swedish', 'modalities', 'massage comparison', 'wellness'],
    'Wellness Tips',
    '2025-02-28T09:00:00Z'
  ),
  (
    'massage-anxiety-relief',
    'Massage Therapy as an Anxiety Relief Tool: What the Research Says',
    'The evidence for massage as a clinical stress intervention is growing. We break down the latest research in accessible language.',
    'Research-backed guide on how massage therapy reduces anxiety and stress. Clinical evidence, mechanisms, and practical recommendations.',
    '[{"type":"paragraph","content":"Anxiety disorders affect over 40 million adults in the United States alone. While therapy and medication remain frontline treatments, a growing body of research supports massage therapy as a meaningful complementary intervention."},{"type":"h2","content":"What the Research Shows"},{"type":"paragraph","content":"A 2020 meta-analysis published in the Journal of Clinical Psychology found that massage therapy significantly reduced anxiety symptoms across 17 randomized controlled trials, with effects comparable to psychotherapy for generalized anxiety."},{"type":"paragraph","content":"The mechanism appears to involve multiple pathways: decreased cortisol, increased serotonin and dopamine, activation of the parasympathetic nervous system, and the simple but powerful effect of safe, consensual human touch."},{"type":"h2","content":"Types of Massage Most Effective for Anxiety"},{"type":"ul","content":["Swedish massage: gentle, rhythmic techniques that promote deep relaxation","Craniosacral therapy: light-touch approach targeting the central nervous system","Aromatherapy massage: combining touch with calming essential oils","Myofascial release: addresses tension stored in connective tissue"]},{"type":"h2","content":"Practical Recommendations"},{"type":"paragraph","content":"Research suggests sessions of 60 minutes or longer produce the most significant anxiety reduction. Regular sessions (weekly or biweekly) show cumulative benefits over time, with many participants reporting sustained improvement after 8–12 sessions."},{"type":"callout","content":"Massage therapy works best as part of a holistic approach to anxiety management, not as a replacement for mental health treatment. If you experience clinical anxiety, continue working with your mental health provider."}]',
    ARRAY['anxiety', 'research', 'wellness', 'mental health', 'stress relief'],
    'Wellness Tips',
    '2025-01-30T09:00:00Z'
  )
ON CONFLICT (slug) DO UPDATE SET
  title = EXCLUDED.title,
  excerpt = EXCLUDED.excerpt,
  seo_description = EXCLUDED.seo_description,
  content = EXCLUDED.content,
  tags = EXCLUDED.tags,
  category = EXCLUDED.category;
