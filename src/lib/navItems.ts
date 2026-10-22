import type { IconType } from "react-icons";
import { RxDashboard } from "react-icons/rx";
import {
  BsBuildings,
  BsFillHouseGearFill,
  BsHouses,
  BsShieldExclamation,
  BsCloudSlash,
  BsFileEarmarkPdf,
} from "react-icons/bs";
import { branchOptions } from "./branchList";

export interface NavItem {
  name: string;
  icon?: IconType;
  path?: string;
  role: string[];
  children?: NavItem[];
}

export const navItems: NavItem[] = [
  {
    name: "Dashboard",
    icon: RxDashboard,
    path: "/dashboard/overview",
    role: ["admin", "user"],
  },
  {
    name: "Properties",
    icon: BsHouses,
    path: "/dashboard/properties",
    role: ["admin", "user"],
  },
  {
    name: "Document Library",
    icon: BsFileEarmarkPdf,
    path: "/dashboard/documents",
    role: ["admin", "user"],
  },
  {
    name: "Unassigned Entries",
    icon: BsShieldExclamation,
    path: "/dashboard/entries/unassigned",
    role: ["admin", "user"],
  },
  {
    name: "Offline Entries",
    icon: BsCloudSlash,
    path: "/dashboard/entries/offline",
    role: ["admin", "user"],
  },
  {
    name: "Branches",
    icon: BsBuildings,
    role: ["admin", "user"],
    children: branchOptions.map((branch) => ({
      name: branch.title,
      path: `/dashboard/branch/${branch.keyWord}`,
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
        path: "dashboard/manage/applicants",
        role: ["admin"],
      },
      {
        name: "Manage Users",
        path: "dashboard/manage/users",
        role: ["admin"],
      },
      {
        name: "Manage Properties",
        path: "dashboard/manage/properties",
        role: ["admin"],
      },
      {
        name: "Manage Purchases",
        path: "dashboard/manage/purchases",
        role: ["admin"],
      },
      {
        name: "Manage Subscriptions",
        path: "dashboard/manage/subscriptions",
        role: ["admin"],
      },
      {
        name: "Manage Refunds",
        path: "dashboard/manage/refunds",
        role: ["admin"],
      },
      {
        name: "Flagged Accounts",
        path: "dashboard/manage/flagged-accounts",
        role: ["admin"],
      },
    ],
  },
];
