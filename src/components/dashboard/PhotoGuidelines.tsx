import { useState } from "react";
import {
  Camera,
  CheckCircle2,
  Star,
  AlertTriangle,
  XCircle,
  Lightbulb,
  ChevronDown,
  ChevronUp,
  Info,
} from "lucide-react";

const Section = ({
  icon: Icon,
  title,
  variant,
  children,
}: {
  icon: React.ElementType;
  title: string;
  variant: "require" | "recommend" | "special" | "prohibit" | "tip";
  children: React.ReactNode;
}) => {
  const colors: Record<string, string> = {
    require: "text-primary border-primary/30 bg-primary/5",
    recommend: "text-success border-success/30 bg-success/5",
    special: "text-warning border-warning/30 bg-warning/5",
    prohibit: "text-destructive border-destructive/30 bg-destructive/5",
    tip: "text-accent-foreground border-accent bg-accent/30",
  };

  return (
    <div className={`rounded-lg border p-4 ${colors[variant]}`}>
      <h4 className="flex items-center gap-2 text-sm font-semibold mb-2">
        <Icon className="w-4 h-4 flex-shrink-0" />
        {title}
      </h4>
      <div className="text-xs text-muted-foreground leading-relaxed space-y-1.5">
        {children}
      </div>
    </div>
  );
};

export const PhotoGuidelines = () => {
  const [expanded, setExpanded] = useState(false);

  return (
    <div className="glass-card overflow-hidden">
      {/* Header — always visible */}
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full flex items-center justify-between px-4 py-3 text-left hover:bg-muted/30 transition-colors"
      >
        <div className="flex items-center gap-2">
          <Camera className="w-4 h-4 text-primary" />
          <span className="text-sm font-semibold">Ad Photo Guidelines</span>
        </div>
        {expanded ? (
          <ChevronUp className="w-4 h-4 text-muted-foreground" />
        ) : (
          <ChevronDown className="w-4 h-4 text-muted-foreground" />
        )}
      </button>

      {expanded && (
        <div className="px-4 pb-4 space-y-4">
          {/* Requirements */}
          <Section icon={CheckCircle2} title="Requirements" variant="require">
            <ul className="space-y-1.5 list-disc list-inside">
              <li>You must be wearing professional attire.</li>
              <li>
                The tone of your photos must be professional. This is not social
                media.
              </li>
              <li>
                Your face must be clearly visible in your primary photo.
                <sup className="text-[9px]">1</sup> No sunglasses, deep shadows
                or blurring.
              </li>
            </ul>
          </Section>

          {/* Highly Recommended */}
          <Section icon={Star} title="Highly Recommended" variant="recommend">
            <ul className="space-y-1.5 list-disc list-inside">
              <li>
                Include at least one photo of your massage table and/or studio.
              </li>
              <li>
                In your primary photo, wear a shirt that's a solid color, with no
                patterns or logos.
              </li>
              <li>
                Upload photos that are shot/cropped in portrait format (taller
                than they are wide) or square.
              </li>
              <li>
                Avoid visible retouching (with Facetune, etc.) and noticeable
                filters, especially those that affect saturation.
              </li>
            </ul>
          </Section>

          {/* Special Considerations */}
          <Section
            icon={AlertTriangle}
            title="Special Considerations"
            variant="special"
          >
            <p>
              You can upload up to two shirtless photos to show your commitment
              to health and wellness provided that:
            </p>
            <ul className="space-y-1 list-disc list-inside ml-2 mt-1">
              <li>The photo is in position 5 or higher</li>
              <li>
                The setting is a beach, yoga studio, gym, or
                mountain/park/trail
              </li>
              <li>
                You are wearing tasteful, mainstream shorts/pants/bottoms
              </li>
              <li>
                The tone of the photo is classy/tasteful — what you'd see from a
                mainstream influencer focused on fitness, health and wellness
              </li>
            </ul>
          </Section>

          {/* Prohibited */}
          <Section icon={XCircle} title="Prohibited" variant="prohibit">
            <ul className="space-y-1.5 list-disc list-inside">
              <li>
                Any photo that signals an intention to commit, solicit, promote
                or encourage a criminal act and/or violate the Advertiser
                Agreement.
              </li>
              <li>
                Unprofessional, unsuitable or irrelevant dress/attire, grooming,
                body language, settings, cropping, camera angles, or subject
                matter.
              </li>
              <li>
                Selfies taken in a mirror with the phone/camera showing.
              </li>
              <li>Photos with superimposed text or graphical elements.</li>
              <li>
                Photos of people other than you (except photos of you performing
                massage<sup className="text-[9px]">2</sup>).
              </li>
              <li>
                Photos showing the massage therapist on a table as if they were
                the client.
              </li>
              <li>
                Photos that our image filtering services identify as
                inappropriate.<sup className="text-[9px]">3</sup>
              </li>
              <li>Blurry or poor-quality images.</li>
              <li>
                Stock photos or images copyrighted by another person.
              </li>
              <li>Collages or photos that combine multiple images.</li>
              <li>
                Decorative borders, or black/white bars on top or bottom.
              </li>
            </ul>
          </Section>

          {/* Tips */}
          <Section icon={Lightbulb} title="Tips" variant="tip">
            <ul className="space-y-1.5 list-disc list-inside">
              <li>
                Take photos against blurred and/or visually simple backgrounds
                to keep the focus on you. Many cameras offer portrait mode.
              </li>
              <li>
                Upload files at least 500 pixels wide. Any file directly from a
                camera/phone should suffice.
              </li>
              <li>
                Our software may not detect your face if the photo is from an
                unusual angle or if you aren't in the foreground.
              </li>
              <li>
                Use your phone's built-in photo editor or another app to crop or
                re-orient photos.
              </li>
            </ul>
          </Section>

          {/* Footnotes */}
          <div className="border-t border-border pt-3 space-y-2">
            <p className="text-[10px] text-muted-foreground leading-relaxed">
              <sup>1</sup> If you have extreme privacy concerns (for instance,
              if you live in a community where homophobia is prevalent), we
              offer an exception: rather than posting photos of yourself, you
              can post photos of your empty massage studio. Under this
              exception, you are not allowed to post any photos of yourself —
              only photos of your empty studio/massage room.
            </p>
            <p className="text-[10px] text-muted-foreground leading-relaxed">
              <sup>2</sup> Photos of you performing massage are accepted only if
              (a) the client's face is not visible; (b) the client's body is
              draped in a professional manner; and (c) you have the client's
              written permission on file (e.g., in an email).
            </p>
            <p className="text-[10px] text-muted-foreground leading-relaxed">
              <sup>3</sup> All photos are screened by image filtering services.
              If deemed inappropriate, they are rejected. Image filtering is
              fairly accurate, but false positives may occur. We ask that you
              simply try another photo. Our staff cannot override the software's
              verdict in order to protect our site's ranking and categorization
              on search engines.
            </p>
          </div>
        </div>
      )}
    </div>
  );
};
