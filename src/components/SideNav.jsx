import React, { useState } from "react";
import assets from "../assets/assests";
import { NavLink } from "react-router-dom";
import { FaX } from "react-icons/fa6";
import { IoChevronDown } from "react-icons/io5";

const SideNav = ({ openMenu, setOpenMenu, branches, isLoading }) => {
  if (!openMenu) return null;

  const [openDropMenu, setOpenDropMenu] = useState(false);
  const [openDropHMMenu, setOpenDropHMMenu] = useState(false);

  const houseManagementNavigation = [
    {
      name: "Manage Applicants",
      relativeRoute: "manage/applicants",
    },
    {
      name: "Manage Users",
      relativeRoute: "manage/users",
    },
    {
      name: "Manage Properties",
      relativeRoute: "manage/properties",
    },
    {
      name: "Manage Purchases",
      relativeRoute: "manage/purchases",
    },
    {
      name: "Manage Subscriptions",
      relativeRoute: "manage/subscriptions",
    },
    {
      name: "Flagged Accounts",
      relativeRoute: "manage/flagged-accounts",
    },
  ];

  const role = localStorage.getItem("role").toLowerCase();

  return (
    <div className="fixed top-0 left-0 z-99999 w-full h-full bg-black/50">
      <div className="bg-white lg:w-1/5 md:1/2 w-full h-full flex flex-col md:px-6 py-2 px-4">
        <div className="flex items-center mb-4 justify-between">
          <img
            src={assets.logo}
            className="w-10 h-10 md:w-18 md:h-18"
            alt="Logo"
          />
          <button
            type="button"
            onClick={() => setOpenMenu(false)}
            className="text-lg cursor-pointer"
          >
            <FaX />
          </button>
        </div>
        <ul className="flex flex-col pe-1 gap-4 h-[88%] overflow-y-scroll styled-scrollbar">
          {role === "admin" ? (
            <>
              <NavLink
                to={"/dashboard"}
                end
                className={({ isActive }) =>
                  `py-3 text-sm flex items-center px-4 rounded-md font-medium ${isActive ? "bg-secClr text-white" : ""}`
                }
                onClick={() => setOpenMenu(false)}
              >
                Dashboard
              </NavLink>
              <div className="space-y-2">
                <div
                  className={`flex items-center gap-3 w-full text-black px-4 py-3 cursor-pointer text-sm rounded-md ${openDropMenu ? "bg-secClr text-white" : ""}`}
                  title={"branches"}
                  onClick={() => setOpenDropMenu(!openDropMenu)}
                >
                  <div className={`flex items-center w-full h-full gap-2`}>
                    <span>Branches</span>
                  </div>
                  <IoChevronDown
                    className={`transition-transform ${
                      openDropMenu ? "rotate-180" : ""
                    }`}
                  />
                </div>
                {openDropMenu && (
                  <div
                    className={`border-l border-secClr/30 lg:pl-2 flex flex-col`}
                  >
                    {branches.map((branch) => (
                      <NavLink
                        to={`/dashboard/branch/${branch.keyWord}`}
                        className={({ isActive }) =>
                          `h-10 flex items-center px-4 last:border-b-0 border-b border-secClr/30 text-xs ${isActive ? "bg-secClr text-white" : "hover:bg-secClr/30"}`
                        }
                        onClick={() => setOpenMenu(false)}
                      >
                        {branch.title}
                      </NavLink>
                    ))}
                  </div>
                )}
              </div>
              <div className="space-y-2">
                <div
                  className={`flex items-center gap-3 w-full text-black px-4 py-3 cursor-pointer text-sm rounded-md ${openDropHMMenu ? "bg-secClr text-white" : ""}`}
                  title={"branches"}
                  onClick={() => setOpenDropHMMenu(!openDropHMMenu)}
                >
                  <div className={`flex items-center w-full h-full gap-2`}>
                    <span>House Platform Management</span>
                  </div>
                  <IoChevronDown
                    className={`transition-transform ${
                      openDropHMMenu ? "rotate-180" : ""
                    }`}
                  />
                </div>
                {openDropHMMenu && (
                  <div
                    className={`border-l border-secClr/30 lg:pl-2 flex flex-col`}
                  >
                    {houseManagementNavigation.map((nav) => (
                      <NavLink
                        to={`/dashboard/${nav.relativeRoute}`}
                        key={`/dashboard/${nav.relativeRoute}`}
                        className={({ isActive }) =>
                          `h-10 flex items-center px-4 last:border-b-0 border-b border-secClr/30 text-xs ${isActive ? "bg-secClr text-white" : "hover:bg-secClr/30"}`
                        }
                        onClick={() => setOpenMenu(false)}
                      >
                        {nav.name}
                      </NavLink>
                    ))}
                  </div>
                )}
              </div>
            </>
          ) : (
            <>
              <NavLink
                to={"/dashboard"}
                end
                className={({ isActive }) =>
                  `py-3 text-sm flex items-center px-4 rounded-md font-medium ${isActive ? "bg-secClr text-white" : ""}`
                }
                onClick={() => setOpenMenu(false)}
              >
                Dashboard
              </NavLink>
              <div className="space-y-2">
                <div
                  className={`flex items-center gap-3 w-full text-black px-4 py-3 cursor-pointer text-sm rounded-md ${openDropMenu ? "bg-secClr text-white" : ""}`}
                  title={"branches"}
                  onClick={() => setOpenDropMenu(!openDropMenu)}
                >
                  <div className={`flex items-center w-full h-full gap-2`}>
                    <span>Branches</span>
                  </div>
                  <IoChevronDown
                    className={`transition-transform ${
                      openDropMenu ? "rotate-180" : ""
                    }`}
                  />
                </div>
                {openDropMenu && (
                  <div
                    className={`border-l border-secClr/30 lg:pl-2 flex flex-col`}
                  >
                    {branches.map((branch) => (
                      <NavLink
                        to={`/dashboard/branch/${branch.keyWord}`}
                        className={({ isActive }) =>
                          `h-10 flex items-center px-4 last:border-b-0 border-b border-secClr/30 text-xs ${isActive ? "bg-secClr text-white" : "hover:bg-secClr/30"}`
                        }
                        onClick={() => setOpenMenu(false)}
                      >
                        {branch.title}
                      </NavLink>
                    ))}
                  </div>
                )}
              </div>
            </>
          )}
        </ul>
      </div>
    </div>
  );
};

export default SideNav;
