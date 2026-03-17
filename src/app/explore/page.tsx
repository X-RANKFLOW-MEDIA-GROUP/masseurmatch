import { permanentRedirect } from "next/navigation";

export default function ExploreRedirectPage() {
  permanentRedirect("/search");
}
