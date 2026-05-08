# MasseurMatch Wireframe Handoff

## Deliverables

- `/wireframes`
 - Complete wireframe hub for homepage, explore, profile, join, dashboard, admin, legal, and chatbot.
- `/wireframes/prototype`
 - Clickable test flow for `home -> explore -> profile -> join -> dashboard`.
- `/exports/masseurmatch-wireframes-accessibility.css`
 - Exported accessibility stylesheet with reusable tokens and component classes.

## Figma page structure

Create one Figma page named `MasseurMatch Wireframes` with these sections:

1. `WF / Screens`
2. `PROTO / User Test Flow`
3. `COMP / Reusable Components`
4. `A11Y / Tokens and Contrast`
5. `EXPORT / Notes`

## Frame naming

Use this pattern for consistency:

- `WF / Homepage / Desktop`
- `WF / Homepage / Tablet`
- `WF / Homepage / Mobile`
- `WF / Explore / Desktop`
- `WF / Explore / Tablet`
- `WF / Explore / Mobile`
- `WF / Profile / Desktop`
- `WF / Profile / Tablet`
- `WF / Profile / Mobile`
- `WF / Join / Desktop`
- `WF / Join / Tablet`
- `WF / Join / Mobile`
- `WF / Dashboard / Desktop`
- `WF / Dashboard / Tablet`
- `WF / Dashboard / Mobile`
- `WF / Admin / Desktop`
- `WF / Admin / Tablet`
- `WF / Admin / Mobile`
- `WF / Legal / Desktop`
- `WF / Legal / Tablet`
- `WF / Legal / Mobile`
- `WF / Chatbot / Desktop`
- `WF / Chatbot / Tablet`
- `WF / Chatbot / Mobile`
- `PROTO / Home`
- `PROTO / Explore`
- `PROTO / Profile`
- `PROTO / Join`
- `PROTO / Dashboard`

## Auto layout rules

- Desktop frames: 1440px width, 12-column grid, 80px page margins, 32px gutters.
- Tablet frames: 834px width, 8-column grid, 32px margins, 24px gutters.
- Mobile frames: 390px width, 4-column grid, 20px margins, 16px gutters.
- Section padding:
 - Desktop: 24px internal card padding
 - Tablet: 20px internal card padding
 - Mobile: 16px internal card padding
- Vertical rhythm:
 - Desktop: 56px to 80px between major sections
 - Tablet: 40px to 56px
 - Mobile: 24px to 32px

## Prototype interactions

Connect the prototype frames in this order:

1. `PROTO / Home`
 - Primary CTA -> `PROTO / Explore`
 - Spotlight card -> `PROTO / Profile`
 - Knotty prompt `How does the provider side work?` -> `PROTO / Join`
2. `PROTO / Explore`
 - First result card -> `PROTO / Profile`
 - Knotty prompt `Take me to the best matching profile` -> `PROTO / Profile`
3. `PROTO / Profile`
 - Provider CTA -> `PROTO / Join`
 - Secondary CTA -> `PROTO / Explore`
4. `PROTO / Join`
 - Submit CTA -> `PROTO / Dashboard`
 - Secondary CTA -> `PROTO / Profile`
5. `PROTO / Dashboard`
 - Restart test flow -> `PROTO / Home`

Motion notes:

- Screen transition: dissolve and lift, 320ms, cubic-bezier(0.16, 1, 0.3, 1)
- Hover lift on cards and buttons: 160ms to 220ms
- Reduce motion fallback: remove transform and keep opacity-only changes or no animation

## Accessibility notes to carry into Figma

- Add a visible skip-link frame and annotate it as keyboard-only until focus.
- Mark focus rings as 4px with 4px offset using `#0F62FE`.
- Preserve semantic landmarks in annotation notes:
 - `header`
 - `nav`
 - `main`
 - `section`
 - `aside`
 - `footer`
- Add annotations for:
 - `aria-current="step"` on the prototype stepper
 - `aria-pressed` on viewport and auth-state toggles
 - `aria-live="polite"` on Knotty transcript updates
- Keep body copy at 16px minimum and maintain 44px minimum touch targets.

## Core contrast pairs

- `#102A43` on `#F7F4EE`: 13.34:1
- `#102A43` on `#E4ECF7`: 12.30:1
- `#FFFFFF` on `#12325B`: 12.86:1
- `#1F5C4D` on `#EAF8EF`: 7.11:1
- `#7A2E0B` on `#FFF1E8`: 8.55:1
- `#0F62FE` on `#F7F4EE`: 4.56:1

## Component mapping

- Buttons
 - Primary, secondary, ghost
 - Document hover, active, and disabled variants
- Pills
 - Available Now, Visiting Soon, New Profile
 - Include icon plus text, not color alone
- 3D profile card
 - Badge row, service chips, trust block, CTA row
- Forms
 - Input, select, modal, helper text, error state
- Knotty AI
 - Header, prompt chips, transcript, composer, connected actions

## Export stylesheet usage

Use the exported stylesheet as the implementation source of truth for:

- `--wf-color-*` tokens
- `--wf-space-*` spacing
- `--wf-radius-*` radius
- `.wf-button-*`
- `.wf-pill-*`
- `.wf-profile-card-3d`
- `.wf-input`, `.wf-select`, `.wf-textarea`
- `.wf-modal`
- `.wf-chat-*`

## Implementation note

The repo includes the working reference implementation in the Next app. Figma should mirror the route content rather than invent parallel naming or spacing scales.
