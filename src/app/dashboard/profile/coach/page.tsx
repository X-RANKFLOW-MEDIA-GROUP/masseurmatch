import { permanentRedirect } from "next/navigation";

export default function LegacyProfileCoachRedirectPage() {
  permanentRedirect("/pro/ai-coach");
}
