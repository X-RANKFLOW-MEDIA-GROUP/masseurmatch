"use client";

import { useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";

function getLegacyAdminDestination(pathname: string) {
  if (pathname.startsWith("/admin/users")) return "/admin/users";
  if (pathname.startsWith("/admin/reviews")) return "/admin/reviews";
  if (pathname.startsWith("/admin/cities")) return "/admin/cities";
  if (pathname.startsWith("/admin/keywords")) return "/admin/keywords";
  if (pathname.startsWith("/admin/blog")) return "/admin/blog";
  if (pathname.startsWith("/admin/therapists")) return "/admin/therapists";

  return "/admin";
}

export const AdminRoute = () => {
  const pathname = usePathname();
  const router = useRouter();

  useEffect(() => {
    router.replace(getLegacyAdminDestination(pathname));
  }, [pathname, router]);

  return null;
};

