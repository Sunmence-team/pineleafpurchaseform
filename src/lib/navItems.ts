import type { IconType } from "react-icons";
import { RxDashboard } from "react-icons/rx";
import { BsBuildings, } from "react-icons/bs";
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
    role: ["admin", "sub-admin"],
  },
  {
    name: "Branches",
    icon: BsBuildings,
    role: ["admin", "sub-admin"],
    children: branchOptions.map((branch) => ({
      name: branch.title,
      path: `/dashboard/branch/${branch.keyWord}`,
      role: ["admin", "sub-admin"],
    })),
  },
  {
    name: "House Platform Management",
    icon: BsBuildings,
    role: ["admin", "sub-admin"],
    children: [
      {
        name: "Manage Applicants",
        path: "dashboard/manage/applicants",
        role: ["admin", "sub-admin"]
      },
      {
        name: "Manage Users",
        path: "dashboard/manage/users",
        role: ["admin", "sub-admin"]
      },
      {
        name: "Manage Properties",
        path: "dashboard/manage/properties",
        role: ["admin", "sub-admin"]
      },
      {
        name: "Manage Purchases",
        path: "dashboard/manage/purchases",
        role: ["admin", "sub-admin"]
      },
      {
        name: "Manage Subscriptions",
        path: "dashboard/manage/subscriptions",
        role: ["admin", "sub-admin"]
      },
      {
        name: "Manage Refunds",
        path: "dashboard/manage/refunds",
        role: ["admin", "sub-admin"]
      },
      {
        name: "Flagged Accounts",
        path: "dashboard/manage/flagged-accounts",
        role: ["admin", "sub-admin"]
      },
    ],
  },
];
