import { errorResponse, RouteError } from "@/app/api/_lib/http";

export async function POST() {
  return errorResponse(
    new RouteError(
      410,
      "Profile and review import requests are no longer available. Your MasseurMatch profile can be managed directly from the provider dashboard.",
    ),
  );
}
