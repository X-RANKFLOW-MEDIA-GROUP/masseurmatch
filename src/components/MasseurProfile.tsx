
import React, { useState } from 'react';
import styles from './MasseurProfile.module.css';

// Legacy standalone profile demo values.
const PHONE = '+17623345300';
const PHONE_DISPLAY = '(762) 334-5300';
const STUDIO_LOCATION = 'Oak Lawn & Uptown Dallas, TX 75219';
const MOBILE_RADIUS = 'Up to 10 miles — homes & hotels';
const SERVICE_AREAS = 'Highland Park · University Park · Downtown Dallas · Turtle Creek';
const AMENITIES_STUDIO = [
  '🚿 Shower',
  '🚽 Private Restroom',
  '💧 Bottled Water',
  '🔥 Hot Towels',
  '🎵 Music',
];
const AMENITIES_MOBILE = [
  '🛏 Massage Table',
  '🔥 Hot Towels',
  '🎵 Music',
];
const SPECIALTIES = [
  { name: 'Deep Tissue', featured: true },
  { name: 'Shiatsu', featured: true },
  { name: 'Swedish', featured: true },
  { name: 'AMMA Therapy' },
  { name: 'Hot Stone' },
  { name: 'Lymphatic Drainage' },
  { name: 'Myofascial Release' },
  { name: 'Zero Balancing' },
  { name: 'Cupping' },
  { name: 'Fitness Training' },
];
const RATES = [
  {
    duration: '60 minutes',
    price: 160,
    desc: 'Spa-quality bodywork, tailored to you — blending techniques from AMMA Therapy to Zero Balancing.',
    discount: '10% off Mondays',
  },
  {
    duration: '90 minutes',
    price: 250,
    desc: 'Extended session for deeper therapeutic work, full-body recovery, and complete stress release.',
    discount: 'Best value',
  },
];
const PAYMENTS = ['Apple Pay', 'Venmo', 'Zelle', 'Visa / MC', 'Cash'];
const REVIEWS = [
  {
    location: 'Dallas, TX · In-studio',
    date: 'Oct 23, 2025',
    title: "The best massage therapist in Dallas I've had.",
    body: "His warm smile, sense of humor and strong, confident hands delivered the perfect deep-tissue pressure. The energy was very relaxing, and I left feeling completely recharged. Truly one of a kind, I can't recommend Bruno enough — he's A+!",
  },
  {
    location: 'Dallas, TX · In-studio',
    date: 'Jul 2, 2025',
    title: "He's in a league of his own.",
    body: "Bruno is not only incredibly skilled at deep tissue and relaxation massage, but also one of the sweetest and most charming people you'll ever meet. He always makes me feel at ease and gives great advice on how to keep my body feeling good between sessions.",
  },
  {
    location: 'Dallas, TX · In-studio',
    date: 'Jul 2, 2024',
    title: "A master in his prime doing his best work.",
    body: "His place is clean, purposely dimly lit, quiet except for great music at just the right volume. He's super calm and explains what he's doing. What he's doing is so imaginative and creative that just calling it massage seems inadequate.",
  },
];

function MasseurProfile() {
  // State for AI features (stubbed for now)
  const [aiCareResult, setAiCareResult] = useState('');
  const [aiGiftResult, setAiGiftResult] = useState('');
  const [aiSummary, setAiSummary] = useState('');
  const [aiMatchResult, setAiMatchResult] = useState('');
  // ...other state for chat, etc.

  // Handlers for AI features (stubbed)
  const handleAiCare = () => setAiCareResult('Stay hydrated, rest, and stretch gently!');
  const handleAiGift = () => setAiGiftResult('Enjoy your relaxing massage session!');
  const handleAiSummary = () => setAiSummary('Clients praise Bruno for his skill, warmth, and professionalism. Sessions are deeply relaxing and tailored to individual needs. Many highlight his unique techniques and welcoming environment.');
  const handleAiMatch = () => setAiMatchResult('Based on your needs, I recommend a 90-minute Deep Tissue session for optimal recovery.');

  return (
    <div className={styles.profilePage}>
      {/* NAV */}
      <nav className="nav">
        <div className="nav-logo">Masseur<span>Match</span></div>
        <ul className="nav-links">
          <li><a href="#">Find Therapists</a></li>
          <li><a href="#">Cities</a></li>
          <li><a href="#">For Therapists</a></li>
          <li><a href="#" className="nav-cta">Contact Directly</a></li>
        </ul>
      </nav>

      {/* BREADCRUMB */}
      <div className="breadcrumb">
        <a href="#">Home</a> / <a href="#">Dallas, TX</a> / <a href="#">Gay Massage Dallas</a> / <span>Bruno</span>
      </div>

      {/* HERO */}
      <section className="hero">
        <div className="hero-bg"></div>
        <div className="hero-grid"></div>
        <div className="hero-inner">
          {/* Photo */}
          <div className="photo-col anim-1">
            <div className="photo-frame">
              <div className="photo-placeholder">
                <svg width="56" height="56" viewBox="0 0 56 56" fill="none">
                  <circle cx="28" cy="22" r="11" stroke="white" strokeWidth="1.5" />
                  <path d="M8 48c0-11 9-20 20-20s20 9 20 20" stroke="white" strokeWidth="1.5" strokeLinecap="round" />
                </svg>
                <span>Profile Photo</span>
              </div>
            </div>
            <div className="photo-badge">🇧🇷 Brazilian</div>
            <div className="verified-badge">✓ Verified</div>
          </div>

          {/* Info */}
          <div className="info-col">
            <div className="profile-tags anim-1">
              <span className="ptag ptag-lgbt">🏳️‍🌈 LGBT+ Welcoming</span>
              <span className="ptag ptag-mobile">📍 In-Studio + Mobile</span>
              <span className="ptag ptag-namt">NAMT Member</span>
            </div>
            <h1 className="anim-2">Massage<br /><em>by Bruno</em></h1>
            <div className="subtitle anim-2">Licensed Massage Therapist · Dallas, TX · Oak Lawn & Uptown</div>
            <div className="stars anim-3">
              {Array(5).fill(0).map((_, i) => <span key={i} className="star">★</span>)}
              <span className="review-count">12 verified reviews</span>
            </div>
            <div className="quick-stats anim-3">
              <div className="qs"><div className="qs-val">14<span>yrs</span></div><div className="qs-label">Experience</div></div>
              <div className="qs"><div className="qs-val">8<span> techniques</span></div><div className="qs-label">Specialties</div></div>
              <div className="qs"><div className="qs-val"><span>from </span>$160</div><div className="qs-label">Starting rate</div></div>
              <div className="qs"><div className="qs-val">10<span>mi</span></div><div className="qs-label">Mobile radius</div></div>
            </div>
            <div className="hero-ctas anim-4">
              <a href={`sms:${PHONE}`} className="btn-primary">💬 Text Bruno</a>
              <a href={`tel:${PHONE}`} className="btn-secondary">📞 {PHONE_DISPLAY}</a>
            </div>
          </div>
        </div>
      </section>

      {/* MAIN CONTENT */}
      <div className="main">
        {/* LEFT */}
        <div className="left-col">
          {/* About */}
          <section className="anim-1">
            <div className="sec-label">About</div>
            <div className="sec-title">Brazilian Therapeutic<br />Bodywork in Dallas</div>
            <div className="about-text">
              <p>My name is <strong>Bruno</strong> — a Brazilian massage therapist with <strong>14 years of experience</strong> providing professional therapeutic bodywork in a respectful, inclusive environment.</p>
              <p>Every session is <strong>LGBT+ welcoming</strong> and focuses on physical recovery and stress relief through specialized Deep Tissue therapy for chronic tension, a rhythmic Brazilian Touch for body balance, and Sports Recovery to enhance performance.</p>
              <p>I work from a <strong>private studio in Oak Lawn and Uptown Dallas</strong>, and also offer high-end mobile outcall services to homes and hotels. I directly serve <strong>Highland Park, University Park, Downtown Dallas,</strong> and Turtle Creek.</p>
              <p>Each session delivers a specialized therapeutic experience tailored to your wellness goals.</p>
            </div>
          </section>
          <div className="divider"></div>
          {/* Techniques */}
          <section>
            <div className="sec-label">Specialties</div>
            <div className="sec-title">8 Massage Techniques</div>
            <div className="techniques-grid">
              {SPECIALTIES.map((t, i) => (
                <span key={t.name} className={`technique-pill${t.featured ? ' featured' : ''}`}>{t.name}</span>
              ))}
            </div>
          </section>
          <div className="divider"></div>
          {/* AI After-Care Generator */}
          <section className="anim-2">
            <div className="sec-label">Post-Session Recovery</div>
            <div className="sec-title" style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              ✨ AI After-Care Plan
            </div>
            <div style={{ background: 'rgba(255,138,31,0.05)', border: '1px dashed rgba(255,138,31,0.4)', padding: 24, borderRadius: 4 }}>
              <p style={{ fontSize: 14, color: '#2a3d55', marginBottom: 16 }}>Want to know how to recover after your session? Tell my AI what we worked on, and get a personalized 24-hour recovery plan.</p>
              <div style={{ display: 'flex', gap: 10, marginBottom: 12, flexWrap: 'wrap' }}>
                <select style={{ padding: 10, border: '1px solid rgba(11,31,58,0.1)', borderRadius: 2, fontFamily: 'Outfit, sans-serif', fontSize: 13, outline: 'none', background: 'white', flex: 1, minWidth: 120 }}>
                  <option>Deep Tissue</option>
                  <option>Shiatsu</option>
                  <option>Swedish</option>
                  <option>Sports/Fitness</option>
                </select>
                <input type="text" placeholder="Focus area? (e.g., Lower back)" style={{ padding: 10, border: '1px solid rgba(11,31,58,0.1)', borderRadius: 2, fontFamily: 'Outfit, sans-serif', fontSize: 13, outline: 'none', flex: 2, minWidth: 150 }} />
              </div>
              <button className="btn-secondary" style={{ width: '100%', justifyContent: 'center', fontSize: 13, color: 'var(--navy)', borderColor: 'var(--orange)', background: 'white' }} onClick={handleAiCare}>✨ Generate Recovery Plan</button>
              {aiCareResult && <div style={{ marginTop: 16, paddingTop: 16, borderTop: '1px solid rgba(255,138,31,0.2)', fontSize: 14, color: '#2a3d55', lineHeight: 1.6 }}>{aiCareResult}</div>}
            </div>
          </section>
          <div className="divider"></div>
          {/* Rates */}
          <section>
            <div className="sec-label">Rates & Pricing</div>
            <div className="sec-title">Bruno's Signature Massage</div>
            <div className="rates-grid">
              {RATES.map((r, i) => (
                <div key={i} className="rate-card">
                  <div className="rate-duration">{r.duration}</div>
                  <div className="rate-price"><sup>$</sup>{r.price}</div>
                  <div className="rate-name">{r.desc}</div>
                  <span className="rate-discount">{r.discount}</span>
                </div>
              ))}
            </div>
            <div style={{ marginTop: 16, fontSize: 13, color: '#3a4f6a' }}>
              Discounts available for <strong>active military</strong>, <strong>law enforcement</strong>, and <strong>repeat clients</strong>. Ask Bruno for details.
            </div>
            <div className="payment-methods">
              {PAYMENTS.map(p => <span key={p} className="pay-chip">{p}</span>)}
            </div>
          </section>
          <div className="divider"></div>
          {/* Reviews */}
          <section>
            <div className="sec-label">Client Testimonials</div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
              <div className="sec-title" style={{ marginBottom: 0 }}>What Clients Say</div>
              <button className="btn-secondary" style={{ fontSize: 13, padding: '8px 16px', color: 'var(--navy)', borderColor: 'rgba(255,138,31,0.5)', background: 'rgba(255,138,31,0.05)' }} onClick={handleAiSummary}>✨ AI Summary</button>
            </div>
            {aiSummary && <div style={{ background: '#FFF8F0', borderLeft: '3px solid var(--orange)', padding: 16, marginBottom: 24, borderRadius: '0 4px 4px 0' }}>
              <div style={{ fontFamily: 'DM Mono, monospace', fontSize: 10, color: 'var(--orange)', letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: 6 }}>✨ Generated by Gemini AI</div>
              <div style={{ fontSize: 14, color: '#2a3d55', lineHeight: 1.6 }}>{aiSummary}</div>
            </div>}
            <div className="review-list">
              {REVIEWS.map((r, i) => (
                <div key={i} className="review-card">
                  <div className="review-meta">
                    <span className="review-location">📍 {r.location}</span>
                    <span className="review-date">{r.date}</span>
                  </div>
                  <div className="review-title">"{r.title}"</div>
                  <div className="review-body" data-review="true">{r.body}</div>
                </div>
              ))}
            </div>
            <div className="review-more">
              <a href="#" className="link-more">View all 12 reviews →</a>
            </div>
          </section>
        </div>
        {/* SIDEBAR */}
        <aside className="sidebar">
          {/* AI Matchmaker Card */}
          <div className="info-card anim-1" style={{ border: '1px solid rgba(255,138,31,0.3)', background: 'linear-gradient(180deg, #FCFBF8 0%, #FFF8F0 100%)' }}>
            <div className="info-card-title" style={{ color: 'var(--orange)' }}>✨ AI Therapy Matchmaker</div>
            <p style={{ fontSize: 13, color: '#2a3d55', marginBottom: 12, lineHeight: 1.4 }}>Describe your pain or goals, and my AI will recommend the perfect treatment.</p>
            <textarea placeholder="E.g., My lower back hurts from sitting all day..." style={{ width: '100%', padding: 10, border: '1px solid rgba(11,31,58,0.1)', borderRadius: 2, fontFamily: 'Outfit, sans-serif', fontSize: 13, marginBottom: 10, resize: 'vertical', minHeight: 60, outline: 'none' }} />
            <button className="btn-primary" style={{ width: '100%', justifyContent: 'center', padding: 10, fontSize: 13 }} onClick={handleAiMatch}>✨ Find My Massage</button>
            {aiMatchResult && <div style={{ marginTop: 16, paddingTop: 16, borderTop: '1px solid rgba(255,138,31,0.2)' }}>{aiMatchResult}</div>}
          </div>
          {/* Booking card */}
          <div className="book-card anim-2">
            <div className="book-header">
              <h3>Contact Bruno</h3>
              <p>Text or call directly</p>
            </div>
            <div className="book-body">
              <div className="avail-row">
                <span className="avail-label">Availability</span>
                <span className="avail-val green">● Open today</span>
              </div>
              <div className="avail-row">
                <span className="avail-label">Hours</span>
                <span className="avail-val">12am – 11pm daily</span>
              </div>
              <div className="avail-row">
                <span className="avail-label">Response</span>
                <span className="avail-val">Usually within 1hr</span>
              </div>
              <div className="avail-row">
                <span className="avail-label">Starting at</span>
                <span className="avail-val" style={{ color: 'var(--orange)', fontSize: 18, fontFamily: 'Cormorant Garamond,serif', fontWeight: 600 }}>$160 / 60 min</span>
              </div>
              <a href={`sms:${PHONE}`} className="book-cta">💬 Text Bruno Directly</a>
              <a href={`tel:${PHONE}`} className="book-tel">{PHONE_DISPLAY} — tap to call</a>
            </div>
          </div>
          {/* Location info */}
          <div className="info-card anim-3">
            <div className="info-card-title">Location & Service Area</div>
            <div className="info-row">
              <span className="info-icon">📍</span>
              <div className="info-text">
                <strong>Studio</strong>
                {STUDIO_LOCATION}
              </div>
            </div>
            <div className="info-row">
              <span className="info-icon">🚗</span>
              <div className="info-text">
                <strong>Mobile radius</strong>
                {MOBILE_RADIUS}
              </div>
            </div>
            <div className="info-row">
              <span className="info-icon">🗺️</span>
              <div className="info-text">{SERVICE_AREAS}</div>
            </div>
          </div>
          {/* Amenities */}
          <div className="info-card anim-3">
            <div className="info-card-title">Studio Amenities</div>
            <div className="amenity-grid">
              {AMENITIES_STUDIO.map(a => <span key={a} className="amenity-tag">{a}</span>)}
            </div>
            <div style={{ height: 12 }}></div>
            <div className="info-card-title">Mobile Extras</div>
            <div className="amenity-grid">
              {AMENITIES_MOBILE.map(a => <span key={a} className="amenity-tag">{a}</span>)}
            </div>
          </div>
          {/* AI Gift Note Writer */}
          <div className="info-card anim-4" style={{ borderColor: 'var(--orange)' }}>
            <div className="info-card-title" style={{ color: 'var(--orange)' }}>✨ AI Gift Note Writer</div>
            <p style={{ fontSize: 12, color: '#2a3d55', marginBottom: 12, lineHeight: 1.4 }}>Buying a session for someone else? Let AI write the perfect card message.</p>
            <input type="text" placeholder="To: (Name)" style={{ width: '100%', padding: 8, border: '1px solid rgba(11,31,58,0.1)', borderRadius: 2, fontFamily: 'Outfit, sans-serif', fontSize: 12, marginBottom: 8, outline: 'none' }} />
            <input type="text" placeholder="Occasion: (e.g., Birthday, Stress Relief)" style={{ width: '100%', padding: 8, border: '1px solid rgba(11,31,58,0.1)', borderRadius: 2, fontFamily: 'Outfit, sans-serif', fontSize: 12, marginBottom: 12, outline: 'none' }} />
            <button className="btn-secondary" style={{ width: '100%', justifyContent: 'center', padding: 8, fontSize: 12, color: 'var(--navy)', background: 'rgba(255,138,31,0.1)', border: 'none' }} onClick={handleAiGift}>✨ Draft Message</button>
            {aiGiftResult && <div style={{ marginTop: 12, fontFamily: 'Cormorant Garamond, serif', fontSize: 16, fontStyle: 'italic', color: 'var(--navy)', background: '#FFF8F0', padding: 12, borderRadius: 4, borderLeft: '2px solid var(--orange)' }}>{aiGiftResult}</div>}
          </div>
          {/* Education / affiliation */}
          <div className="info-card anim-4">
            <div className="info-card-title">Credentials</div>
            <div className="info-row">
              <span className="info-icon">🎓</span>
              <div className="info-text">
                <strong>UFRJ — Rio de Janeiro, BR</strong>
                Accounting & Business · 2000–2003
              </div>
            </div>
            <div className="info-row">
              <span className="info-icon">🏅</span>
              <div className="info-text">
                <strong>NAMT Member</strong>
                National Association of Massage Therapists
              </div>
            </div>
          </div>
        </aside>
      </div>
      {/* SEO FOOTER */}
      <div className="seo-footer">
        <div className="seo-footer-inner">
          <h4>Related Searches</h4>
          <div className="seo-links">
            <a href="#" className="seo-link">Gay massage Dallas TX</a>
            <a href="#" className="seo-link">Deep tissue massage Oak Lawn</a>
            <a href="#" className="seo-link">Brazilian massage therapist Dallas</a>
            <a href="#" className="seo-link">LGBT massage Dallas</a>
            <a href="#" className="seo-link">Male massage therapist Dallas</a>
            <a href="#" className="seo-link">Sports massage Uptown Dallas</a>
            <a href="#" className="seo-link">Mobile massage Dallas TX</a>
            <a href="#" className="seo-link">Shiatsu massage Highland Park</a>
            <a href="#" className="seo-link">Massage therapist near Oak Lawn</a>
            <a href="#" className="seo-link">Deep tissue massage near me Dallas</a>
          </div>
        </div>
      </div>
      {/* FOOTER */}
      <footer>
        <div className="footer-logo">Masseur<span>Match</span></div>
        <div className="footer-copy">© 2026 XRankFlow Media Group LLC · Dallas, TX · MasseurMatch.com</div>
      </footer>
    </div>
  );
}

export default MasseurProfile;
