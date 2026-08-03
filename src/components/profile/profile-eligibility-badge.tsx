"use client";

import { Badge } from "@/components/ui/badge";
import { AlertCircle, CheckCircle, Clock, XCircle } from "lucide-react";
import type { ProfileViewModel } from "./profile-utils";
import { calculateProfileSeoCompleteness, getProfileIndexEligibility } from "@/lib/profile-seo-completeness";

interface ProfileEligibilityBadgeProps {
  profile: ProfileViewModel;
  showScore?: boolean;
}

export function ProfileEligibilityBadge({
  profile,
  showScore = true,
}: ProfileEligibilityBadgeProps) {
  const completeness = calculateProfileSeoCompleteness(profile);
  const eligibility = getProfileIndexEligibility(profile);

  if (!showScore) {
    return null;
  }

  const scoreColor =
    completeness.level === "excellent"
      ? "bg-green-100 text-green-800"
      : completeness.level === "good"
        ? "bg-blue-100 text-blue-800"
        : completeness.level === "basic"
          ? "bg-yellow-100 text-yellow-800"
          : "bg-red-100 text-red-800";

  const statusIcon =
    eligibility.eligible && completeness.level === "excellent" ? (
      <CheckCircle className="w-4 h-4" />
    ) : eligibility.eligible ? (
      <AlertCircle className="w-4 h-4" />
    ) : (
      <XCircle className="w-4 h-4" />
    );

  return (
    <div className="flex items-center gap-2">
      <Badge className={`${scoreColor} flex items-center gap-1`}>
        {statusIcon}
        <span>{completeness.score}/100</span>
      </Badge>
      {eligibility.eligible && (
        <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
          <CheckCircle className="w-3 h-3 mr-1" />
          Indexable
        </Badge>
      )}
      {!eligibility.eligible && (
        <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200">
          <Clock className="w-3 h-3 mr-1" />
          Not ready
        </Badge>
      )}
    </div>
  );
}

interface ProfileEligibilityDetailsProps {
  profile: ProfileViewModel;
}

export function ProfileEligibilityDetails({ profile }: ProfileEligibilityDetailsProps) {
  const completeness = calculateProfileSeoCompleteness(profile);
  const eligibility = getProfileIndexEligibility(profile);

  return (
    <div className="space-y-4 rounded-lg border border-gray-200 bg-white p-4">
      <div>
        <h4 className="font-semibold text-sm mb-2">SEO Completeness</h4>
        <div className="flex items-center gap-2 mb-3">
          <div className="flex-1 bg-gray-100 rounded-full h-2 overflow-hidden">
            <div
              className={`h-full ${
                completeness.level === "excellent"
                  ? "bg-green-500"
                  : completeness.level === "good"
                    ? "bg-blue-500"
                    : completeness.level === "basic"
                      ? "bg-yellow-500"
                      : "bg-red-500"
              }`}
              style={{ width: `${completeness.score}%` }}
            />
          </div>
          <span className="text-sm font-semibold">{completeness.score}%</span>
        </div>
      </div>

      <div>
        <h4 className="font-semibold text-sm mb-2">Indexing Status</h4>
        <div className="flex items-start gap-2">
          {eligibility.eligible ? (
            <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
          ) : (
            <AlertCircle className="w-5 h-5 text-amber-500 flex-shrink-0 mt-0.5" />
          )}
          <p className="text-sm text-gray-700">{eligibility.reason}</p>
        </div>
      </div>

      {completeness.missingItems.length > 0 && (
        <div>
          <h4 className="font-semibold text-sm mb-2 text-red-700">Missing Items</h4>
          <ul className="space-y-1">
            {completeness.missingItems.map((item) => (
              <li key={item} className="text-sm text-gray-600 flex items-start gap-2">
                <span className="text-red-500 mt-0.5">•</span>
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {completeness.suggestions.length > 0 && (
        <div>
          <h4 className="font-semibold text-sm mb-2 text-blue-700">Suggestions</h4>
          <ul className="space-y-1">
            {completeness.suggestions.map((suggestion) => (
              <li key={suggestion} className="text-sm text-gray-600 flex items-start gap-2">
                <span className="text-blue-500 mt-0.5">→</span>
                <span>{suggestion}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      <div>
        <h4 className="font-semibold text-sm mb-2">Completion Checklist</h4>
        <div className="space-y-1">
          {completeness.checklist.map((item) => (
            <div key={item.item} className="flex items-center gap-2 text-sm">
              {item.complete ? (
                <CheckCircle className="w-4 h-4 text-green-500 flex-shrink-0" />
              ) : (
                <XCircle className="w-4 h-4 text-gray-300 flex-shrink-0" />
              )}
              <span className={item.complete ? "text-gray-700" : "text-gray-400"}>
                {item.item}
              </span>
              <span className="text-xs text-gray-500 ml-auto">+{item.points}pts</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
