import { KnottyImessageOptInCard } from "@/components/pro/KnottyImessageOptInCard";
import { AiCoachDashboard } from "@/components/pro/ai-coach/AiCoachDashboard";
import { ReportMarkdownEnhancer } from "@/components/pro/ai-coach/ReportMarkdownEnhancer";
import { TrustStatusEnhancer } from "@/components/pro/ai-coach/TrustStatusEnhancer";

export default function AiProfileCoachPage() {
  return (
    <>
      <div className="bg-[#FBFAF8] px-4 pt-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-[1920px]">
          <KnottyImessageOptInCard />
        </div>
      </div>
      <AiCoachDashboard />
      <ReportMarkdownEnhancer />
      <TrustStatusEnhancer />
    </>
  );
}
