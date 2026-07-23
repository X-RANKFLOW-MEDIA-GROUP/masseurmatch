"use client";

import { Profile } from "@/lib/profile.types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { AlertCircle, ArrowRight } from "lucide-react";

interface ProfileDiffToolProps {
  profileAId: string;
  profileBId: string;
  profiles: Profile[];
}

export function ProfileDiffTool({
  profileAId,
  profileBId,
  profiles,
}: ProfileDiffToolProps) {
  const profileA = profiles.find((p) => p.id === profileAId);
  const profileB = profiles.find((p) => p.id === profileBId);

  if (!profileA || !profileB) {
    return (
      <div className="p-4 bg-red-50 border border-red-200 rounded-lg flex gap-2">
        <AlertCircle className="h-5 w-5 text-red-600 flex-shrink-0 mt-0.5" />
        <div className="text-sm text-red-700">
          One or both profiles could not be found.
        </div>
      </div>
    );
  }

  const getDifferences = () => {
    const differences: Array<{
      field: string;
      valueA: any;
      valueB: any;
    }> = [];

    const allKeys = new Set([
      ...Object.keys(profileA),
      ...Object.keys(profileB),
    ]);

    allKeys.forEach((key) => {
      const valA = (profileA as any)[key];
      const valB = (profileB as any)[key];

      if (JSON.stringify(valA) !== JSON.stringify(valB)) {
        differences.push({
          field: key,
          valueA: valA,
          valueB: valB,
        });
      }
    });

    return differences;
  };

  const differences = getDifferences();

  const formatValue = (value: any): string => {
    if (value === null || value === undefined) return "—";
    if (typeof value === "boolean") return value ? "Yes" : "No";
    if (Array.isArray(value)) return value.join(", ");
    if (typeof value === "object") return JSON.stringify(value, null, 2);
    return String(value);
  };

  const displayNameA = profileA.display_name || profileA.full_name || "Unnamed";
  const displayNameB = profileB.display_name || profileB.full_name || "Unnamed";

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          Profile Comparison: {displayNameA} vs {displayNameB}
        </CardTitle>
        <div className="text-sm text-muted-foreground mt-2">
          Found {differences.length} difference{differences.length !== 1 ? "s" : ""}
        </div>
      </CardHeader>
      <CardContent>
        {differences.length === 0 ? (
          <div className="p-4 bg-green-50 border border-green-200 rounded-lg text-center">
            <p className="text-sm font-medium text-green-900">No differences found</p>
            <p className="text-xs text-green-700 mt-1">These profiles appear to be identical</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm border-collapse">
              <thead>
                <tr className="border-b border-border bg-secondary/30">
                  <th className="px-4 py-3 text-left font-semibold">Field</th>
                  <th className="px-4 py-3 text-left font-semibold w-2/5">{displayNameA}</th>
                  <th className="px-4 py-3 text-center w-8">
                    <ArrowRight className="h-4 w-4 inline" />
                  </th>
                  <th className="px-4 py-3 text-left font-semibold w-2/5">{displayNameB}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {differences.map((diff, index) => (
                  <tr key={index} className="hover:bg-secondary/10">
                    <td className="px-4 py-3 font-medium text-xs bg-secondary/5">
                      {diff.field}
                    </td>
                    <td className="px-4 py-3 max-h-24 overflow-y-auto">
                      <code className="text-xs bg-red-50 text-red-900 p-2 rounded block break-words whitespace-pre-wrap">
                        {formatValue(diff.valueA)}
                      </code>
                    </td>
                    <td className="px-4 py-3 text-center">
                      <ArrowRight className="h-4 w-4 text-muted-foreground inline" />
                    </td>
                    <td className="px-4 py-3 max-h-24 overflow-y-auto">
                      <code className="text-xs bg-green-50 text-green-900 p-2 rounded block break-words whitespace-pre-wrap">
                        {formatValue(diff.valueB)}
                      </code>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
