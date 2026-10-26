import { useLocation } from "react-router-dom";
import { useBranches } from "../hooks/useBranches";
import type { BranchItem } from "./interfaces";

export const ROUTE_TITLES: Record<string, string> = {
  "/dashboard/overview": "Dashboard",
  "/dashboard/records": "Form Records",
  "/dashboard/properties": "Properties",
  "/dashboard/documents": "Document Library",
  "/dashboard/records/unassigned": "Unassigned Entries",
  "/dashboard/records/offline": "Offline Entries",
  "/dashboard/records/downloaded": "Downloaded Entries",
  "/dashboard/old-records": "Old Records",
  "/dashboard/manage/users": "User Management",
  "/dashboard/manage/applicants": "Applicants",
  "/dashboard/manage/properties": "Property Management",
  "/dashboard/manage/properties/create": "Create Property",
  "/dashboard/manage/purchases": "Purchase Management",
  "/dashboard/manage/subscriptions": "Subscriptions",
  "/dashboard/manage/flagged-accounts": "Flagged Accounts",
  "/dashboard/manage/refunds": "Refund Management",
  "/dashboard/settings": "Settings",
};

/**
 * Derives a human-readable page title based on the URL pathname and optional branch list.
 */
export const getPageTitle = (
  pathname: string,
  branches: BranchItem[] = [],
): string => {
  // 1. Direct match in static route map
  if (ROUTE_TITLES[pathname]) {
    return ROUTE_TITLES[pathname];
  }

  // 2. Branch breakdown dynamic route (e.g. /dashboard/branch/1 or /dashboard/branch/LAG_AJAH)
  if (pathname.startsWith("/dashboard/branch/")) {
    const branchKey = decodeURIComponent(pathname.split("/").pop() || "");
    const branch = branches.find(
      (b) =>
        String(b.id).toLowerCase() === branchKey.toLowerCase() ||
        b.name.toLowerCase() === branchKey.toLowerCase(),
    );
    return branch
      ? `${branch.name} Branch`
      : branchKey
        ? `${branchKey} Branch`
        : "Branch Breakdown";
  }

  // 3. Specific dynamic action routes
  if (pathname.startsWith("/view-client/")) return "Client Details";
  if (pathname.startsWith("/edit-client/")) return "Edit Client";

  if (pathname.includes("/manage/users/") && pathname.endsWith("/view")) {
    return "User Details";
  }
  if (pathname.includes("/manage/applicants/") && pathname.endsWith("/view")) {
    return "Applicant Details";
  }
  if (pathname.includes("/manage/properties/") && pathname.endsWith("/edit")) {
    return "Edit Property";
  }
  if (pathname.includes("/manage/properties/") && pathname.endsWith("/view")) {
    return "Property Details";
  }
  if (pathname.includes("/manage/purchases/") && pathname.endsWith("/view")) {
    return "Purchase Details";
  }
  if (pathname.includes("/manage/refunds/") && pathname.endsWith("/view")) {
    return "Refund Details";
  }

  // 4. Fallback: Format the last meaningful segment
  const segments = pathname.split("/").filter(Boolean);
  const last = segments[segments.length - 1];
  if (!last) return "Dashboard";

  return last
    .split("-")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
};

/**
 * Hook to derive page title with branches dynamically fetched via React Query
 */
export const usePageTitle = (pageName?: string): string => {
  const location = useLocation();
  const { data: branches = [] } = useBranches();
  return pageName || getPageTitle(location.pathname, branches);
};
