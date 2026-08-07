import { AiCoachDashboard } from "@/components/pro/ai-coach/AiCoachDashboard";
import { ReportMarkdownEnhancer } from "@/components/pro/ai-coach/ReportMarkdownEnhancer";
import { TrustStatusEnhancer } from "@/components/pro/ai-coach/TrustStatusEnhancer";

export default function AiProfileCoachPage() {
  return (
    <>
      <AiCoachDashboard />
      <ReportMarkdownEnhancer />
      <TrustStatusEnhancer />
    </>
  );
}
