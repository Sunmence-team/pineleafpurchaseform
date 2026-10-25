import { useMemo } from "react";
import type { IconType } from "react-icons";
import { RxDashboard } from "react-icons/rx";
import {
  BsBuildings,
  BsFillHouseGearFill,
  BsHouses,
  BsShieldExclamation,
  BsCloudSlash,
  BsFileEarmarkPdf,
  BsJournalText,
  BsJournalMedical,
  BsJournalCheck,
} from "react-icons/bs";
import { useBranches } from "../hooks/useBranches";
import type { BranchItem } from "./interfaces";

export interface NavItem {
  name: string;
  icon?: IconType;
  path?: string;
  role: string[];
  children?: NavItem[];
}

export const getNavItems = (branches: BranchItem[] = []): NavItem[] => [
  {
    name: "Dashboard",
    icon: RxDashboard,
    path: "/dashboard/overview",
    role: ["admin", "user"],
  },
  {
    name: "Form Records",
    icon: BsJournalText,
    path: "/dashboard/records",
    role: ["admin", "user"],
  },
  {
    name: "Properties",
    icon: BsHouses,
    path: "/dashboard/properties",
    role: ["admin", "user"],
  },
  {
    name: "Unassigned Entries",
    icon: BsShieldExclamation,
    path: "/dashboard/records/unassigned",
    role: ["admin", "user"],
  },
  {
    name: "Offline Entries",
    icon: BsCloudSlash,
    path: "/dashboard/records/offline",
    role: ["admin", "user"],
  },
  {
    name: "Downloaded Records",
    icon: BsJournalCheck,
    path: "/dashboard/records/downloaded",
    role: ["admin", "user"],
  },
  {
    name: "Document Library",
    icon: BsFileEarmarkPdf,
    path: "/dashboard/documents",
    role: ["admin", "user"],
  },
  {
    name: "Old Records",
    icon: BsJournalMedical,
    path: "/dashboard/old-records",
    role: ["admin", "user"],
  },
  {
    name: "Branches",
    icon: BsBuildings,
    role: ["admin", "user"],
    children: branches.map((branch) => ({
      name: branch.name,
      path: `/dashboard/branch/${branch.id}`,
      role: ["admin", "user"],
    })),
  },
  {
    name: "House Platform Management",
    icon: BsFillHouseGearFill,
    role: ["admin"],
    children: [
      {
        name: "Manage Applicants",
        path: "/dashboard/manage/applicants",
        role: ["admin"],
      },
      {
        name: "Manage Users",
        path: "/dashboard/manage/users",
        role: ["admin"],
      },
      {
        name: "Manage Properties",
        path: "/dashboard/manage/properties",
        role: ["admin"],
      },
      {
        name: "Manage Purchases",
        path: "/dashboard/manage/purchases",
        role: ["admin"],
      },
      {
        name: "Manage Subscriptions",
        path: "/dashboard/manage/subscriptions",
        role: ["admin"],
      },
      {
        name: "Manage Refunds",
        path: "/dashboard/manage/refunds",
        role: ["admin"],
      },
      {
        name: "Flagged Accounts",
        path: "/dashboard/manage/flagged-accounts",
        role: ["admin"],
      },
    ],
  },
];

export const useNavItems = (): NavItem[] => {
  const { data: branches = [] } = useBranches();
  return useMemo(() => getNavItems(branches), [branches]);
};

export const navItems: NavItem[] = getNavItems([]);
