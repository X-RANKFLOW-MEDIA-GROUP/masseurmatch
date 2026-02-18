import { ShieldAlert } from "lucide-react";

export const SafetyDisclaimer = () => (
  <section className="py-12 border-t border-border">
    <div className="container mx-auto px-4">
      <div className="max-w-4xl mx-auto glass-card p-8">
        <div className="flex items-start gap-4">
          <ShieldAlert className="w-6 h-6 text-muted-foreground flex-shrink-0 mt-0.5" />
          <div className="space-y-3">
            <h3 className="text-sm font-semibold uppercase tracking-widest text-muted-foreground">
              Directory Disclaimer
            </h3>
            <ul className="text-xs text-muted-foreground leading-relaxed space-y-1.5">
              <li>• MasseurMatch is an <strong className="text-foreground">advertising directory only</strong> — we do not provide or arrange massage services.</li>
              <li>• We do <strong className="text-foreground">not verify licenses, credentials, or qualifications</strong> of listed providers.</li>
              <li>• We do <strong className="text-foreground">not guarantee</strong> any services, outcomes, or provider conduct.</li>
              <li>• <strong className="text-foreground">No booking or payments</strong> are processed through this site.</li>
              <li>• Users must be <strong className="text-foreground">18 years or older</strong> to use this directory.</li>
              <li>• <strong className="text-foreground">Adult content is strictly prohibited.</strong></li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  </section>
);
