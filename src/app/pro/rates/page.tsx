import { redirect } from "next/navigation";

export default function ProviderRatesRedirect() {
  redirect("/pro/listing#pricing");
}
