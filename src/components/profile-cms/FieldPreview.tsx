"use client";

import React from "react";
import { Check, X } from "lucide-react";
import { cn } from "@/lib/utils";
import type { FieldPreviewProps } from "@/types/profile-fields";
import { FieldType } from "@/types/profile-fields";

function displayValue(value: unknown): string {
  if (value === null || value === undefined || value === "") return "—";
  if (typeof