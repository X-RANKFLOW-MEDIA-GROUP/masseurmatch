"use client";

import { Phone, Mail, MessageCircle } from "lucide-react";
import type { PublicTherapist } from "@/app/_lib/directory";
import { ContactForm } from "@/components/contact/ContactForm";
import { useState } from "react";

interface PremiumProfileContactProps {
  profile: PublicTherapist;
}

export function PremiumProfileContact({ profile }: PremiumProfileContactProps) {
  const [showForm, setShowForm] = useState(false);

  // Default to showing email and phone
  const allowedMethods = {
    email: true,
    phone: !!profile.phone,
    whatsapp: false,
  };

  return (
    <section className="pp-section pp-fade-in" id="contact">
      <div className="pp-section-header">
        <h2 className="pp-section-title">Get in Touch</h2>
      </div>

      <div className="grid md:grid-cols-2 gap-6 mb-8">
        {/* Direct Contact Methods */}
        <div className="space-y-4">
          <h3 className="font-semibold text-lg mb-4">Direct Contact</h3>

          {/* Email */}
          <a
            href={`mailto:${profile.contact_email}`}
            className="flex items-start gap-4 p-4 rounded-lg border border-[var(--glass-border)] bg-[var(--cream-dim)] hover:bg-[var(--cream)] transition-colors"
          >
            <Mail className="w-5 h-5 text-[var(--orange)] flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-medium">Email</p>
              <p className="text-sm text-[var(--text-muted)]">{profile.contact_email}</p>
            </div>
          </a>

          {/* Phone */}
          {profile.phone && (
            <a
              href={`tel:${profile.phone}`}
              className="flex items-start gap-4 p-4 rounded-lg border border-[var(--glass-border)] bg-[var(--cream-dim)] hover:bg-[var(--cream)] transition-colors"
            >
              <Phone className="w-5 h-5 text-[var(--orange)] flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-medium">Phone</p>
                <p className="text-sm text-[var(--text-muted)]">{profile.phone}</p>
              </div>
            </a>
          )}

          {/* Call-to-action for form */}
          <button
            onClick={() => setShowForm(!showForm)}
            className="w-full flex items-center justify-center gap-2 p-4 rounded-lg bg-[var(--orange)] text-white font-medium hover:opacity-90 transition-opacity"
          >
            <MessageCircle className="w-5 h-5" />
            {showForm ? "Hide Contact Form" : "Send a Message"}
          </button>
        </div>

        {/* Contact Form */}
        {showForm && (
          <div>
            <ContactForm
              therapistId={profile.id}
              therapistName={profile.display_name || profile.full_name}
              therapistEmail={profile.contact_email}
              allowedMethods={allowedMethods}
            />
          </div>
        )}
      </div>

      {/* Response Time Info */}
      <div className="p-4 rounded-lg bg-[var(--cream-dim)] border border-[var(--glass-border)]">
        <p className="text-sm text-[var(--text-muted)]">
          <strong>Response time:</strong> Most therapists respond within 24 hours. Reach out via their preferred contact method for the fastest response.
        </p>
      </div>
    </section>
  );
}
