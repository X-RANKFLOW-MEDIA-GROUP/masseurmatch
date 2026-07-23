"use client";

import { useState } from "react";
import { Profile, ProfileUpdate } from "@/lib/profile.types";
import { PROFILE_FIELDS_BY_SECTION } from "../_lib/profile-fields";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { AlertCircle, Eye, Check } from "lucide-react";
import { postJson } from "@/app/_lib/client-api";
import { useToast } from "@/hooks/use-toast";

interface BatchEditModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  profiles: Profile[];
  onProfilesUpdate: (profiles: Profile[]) => void;
}

type Operation = "replace" | "add" | "remove";
type FilterOption = "all" | "pending" | "incomplete";

export function BatchEditModal({
  open,
  onOpenChange,
  profiles,
  onProfilesUpdate,
}: BatchEditModalProps) {
  const { toast } = useToast();
  const [selectedField, setSelectedField] = useState<string>("");
  const [operation, setOperation] = useState<Operation>("replace");
  const [value, setValue] = useState<string>("");
  const [filterOption, setFilterOption] = useState<FilterOption>("all");
  const [reason, setReason] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [previewCount, setPreviewCount] = useState(0);

  // Flatten fields for easier selection
  const allFields = Object.values(PROFILE_FIELDS_BY_SECTION).flat();

  const handleFieldChange = (fieldName: string) => {
    setSelectedField(fieldName);
    setValue("");
  };

  const getAffectedProfiles = (): Profile[] => {
    return profiles.filter((p) => {
      if (filterOption === "pending") {
        return !p.approved_at && p.profile_status !== "approved";
      }
      if (filterOption === "incomplete") {
        // Simplified completeness check
        const filledFields = Object.values(p).filter((v) => v !== null && v !== undefined && v !== "").length;
        return (filledFields / 59) < 0.7;
      }
      return true;
    });
  };

  const handlePreview = () => {
    const affected = getAffectedProfiles();
    setPreviewCount(affected.length);
  };

  const handleApply = async () => {
    if (!selectedField || !reason.trim()) {
      toast({
        title: "Missing required fields",
        description: "Please select a field, enter a reason, and try again.",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    try {
      const affected = getAffectedProfiles();
      const updates: Record<string, ProfileUpdate> = {};

      affected.forEach((profile) => {
        const updateData: ProfileUpdate = {};

        if (operation === "replace") {
          (updateData as any)[selectedField] = value || null;
        } else if (operation === "add" && Array.isArray((profile as any)[selectedField])) {
          const currentArray = (profile as any)[selectedField] || [];
          const newValues = value.split(",").map((v) => v.trim()).filter(Boolean);
          (updateData as any)[selectedField] = [...new Set([...currentArray, ...newValues])];
        } else if (operation === "remove" && Array.isArray((profile as any)[selectedField])) {
          const currentArray = (profile as any)[selectedField] || [];
          const valuesToRemove = value.split(",").map((v) => v.trim());
          (updateData as any)[selectedField] = currentArray.filter(
            (item: string) => !valuesToRemove.includes(item)
          );
        }

        updates[profile.id] = updateData;
      });

      const response = await postJson("/api/admin/profiles/batch-update", {
        updates,
        reason,
        actionType: "batch_edit",
      }) as { success: boolean; profiles?: any[]; error?: string };

      if (response.success) {
        const updatedProfiles = response.profiles || [];
        onProfilesUpdate(updatedProfiles);
        toast({
          title: "Batch update successful",
          description: `Updated ${affected.length} profile(s).`,
        });
        onOpenChange(false);
      } else {
        throw new Error(response.error || "Batch update failed");
      }
    } catch (error) {
      console.error("Batch edit error:", error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to update profiles",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Batch Edit Profiles</DialogTitle>
          <DialogDescription>
            Update multiple profiles at once with a single operation
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Field Selection */}
          <div className="space-y-2">
            <label className="text-sm font-semibold">Select Field</label>
            <Select value={selectedField} onValueChange={handleFieldChange}>
              <SelectTrigger>
                <SelectValue placeholder="Choose a field to edit..." />
              </SelectTrigger>
              <SelectContent>
                {Object.entries(PROFILE_FIELDS_BY_SECTION).map(([section, fields]) => (
                  <div key={section}>
                    {fields.map((field) => (
                      <SelectItem key={field} value={field}>
                        {section} - {field}
                      </SelectItem>
                    ))}
                  </div>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Operation Selection */}
          {selectedField && (
            <div className="space-y-2">
              <label className="text-sm font-semibold">Operation</label>
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <input
                    type="radio"
                    id="replace"
                    value="replace"
                    checked={operation === "replace"}
                    onChange={(e) => setOperation(e.target.value as Operation)}
                  />
                  <label htmlFor="replace" className="text-sm cursor-pointer">
                    Replace value
                  </label>
                </div>
                <div className="flex items-center gap-2">
                  <input
                    type="radio"
                    id="add"
                    value="add"
                    checked={operation === "add"}
                    onChange={(e) => setOperation(e.target.value as Operation)}
                  />
                  <label htmlFor="add" className="text-sm cursor-pointer">
                    Add to array (for multi-select fields)
                  </label>
                </div>
                <div className="flex items-center gap-2">
                  <input
                    type="radio"
                    id="remove"
                    value="remove"
                    checked={operation === "remove"}
                    onChange={(e) => setOperation(e.target.value as Operation)}
                  />
                  <label htmlFor="remove" className="text-sm cursor-pointer">
                    Remove from array (for multi-select fields)
                  </label>
                </div>
              </div>
            </div>
          )}

          {/* Value Input */}
          {selectedField && (
            <div className="space-y-2">
              <label className="text-sm font-semibold">Value</label>
              {operation === "add" || operation === "remove" ? (
                <Textarea
                  placeholder="Enter values separated by commas..."
                  value={value}
                  onChange={(e) => setValue(e.target.value)}
                  className="min-h-20"
                />
              ) : (
                <Input
                  placeholder="Enter new value..."
                  value={value}
                  onChange={(e) => setValue(e.target.value)}
                />
              )}
              {(operation === "add" || operation === "remove") && (
                <p className="text-xs text-muted-foreground">
                  Separate multiple values with commas
                </p>
              )}
            </div>
          )}

          {/* Filter Options */}
          <div className="space-y-2">
            <label className="text-sm font-semibold">Apply to</label>
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <input
                  type="radio"
                  id="all"
                  value="all"
                  checked={filterOption === "all"}
                  onChange={(e) => setFilterOption(e.target.value as FilterOption)}
                />
                <label htmlFor="all" className="text-sm cursor-pointer">
                  All selected profiles
                </label>
              </div>
              <div className="flex items-center gap-2">
                <input
                  type="radio"
                  id="pending"
                  value="pending"
                  checked={filterOption === "pending"}
                  onChange={(e) => setFilterOption(e.target.value as FilterOption)}
                />
                <label htmlFor="pending" className="text-sm cursor-pointer">
                  Pending profiles only
                </label>
              </div>
              <div className="flex items-center gap-2">
                <input
                  type="radio"
                  id="incomplete"
                  value="incomplete"
                  checked={filterOption === "incomplete"}
                  onChange={(e) => setFilterOption(e.target.value as FilterOption)}
                />
                <label htmlFor="incomplete" className="text-sm cursor-pointer">
                  Incomplete profiles (&lt;70%)
                </label>
              </div>
            </div>
          </div>

          {/* Reason */}
          <div className="space-y-2">
            <label className="text-sm font-semibold">Reason for change</label>
            <Textarea
              placeholder="Explain why you're making this batch change..."
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              className="min-h-20"
              required
            />
          </div>

          {/* Preview Info */}
          {selectedField && reason && (
            <div className="flex items-start gap-3 p-3 bg-blue-50 border border-blue-200 rounded-lg">
              <AlertCircle className="h-5 w-5 text-blue-600 mt-0.5 flex-shrink-0" />
              <div className="text-sm">
                <p className="font-medium text-blue-900">Preview</p>
                <p className="text-blue-700 mt-1">
                  This change will affect {previewCount > 0 ? previewCount : "0"} profile(s)
                </p>
              </div>
            </div>
          )}

          {/* Actions */}
          <div className="flex gap-2 justify-end">
            <Button
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isLoading}
            >
              Cancel
            </Button>
            <Button
              variant="outline"
              onClick={handlePreview}
              disabled={!selectedField || !reason || isLoading}
              className="gap-2"
            >
              <Eye className="h-4 w-4" />
              Preview
            </Button>
            <Button
              onClick={handleApply}
              disabled={!selectedField || !reason || isLoading}
              className="gap-2"
            >
              <Check className="h-4 w-4" />
              Apply
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
