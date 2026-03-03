import React from "react";
import assets from "../assets/assests";
import { NavLink } from "react-router-dom";
import { FaX } from "react-icons/fa6";
import { IoChevronDown } from "react-icons/io5";

const SideNav = ({ openMenu, setOpenMenu, branches, isLoading }) => {
  if (!openMenu) return null;


  const [openDropMenu, setOpenDropMenu] = useState(false)

  return (
    <div className="fixed top-0 left-0 z-99999 w-full h-full bg-black/50">
      <div className="bg-white lg:w-1/5 md:1/2 w-full h-full flex flex-col md:p-8 p-4">
        <div className="flex items-center justify-between">
          <img
            src={assets.logo}
            className="w-8 h-8 md:w-10 md:h-10"
            alt="Logo"
          />
          <button
            type="button"
            onClick={() => setOpenMenu(false)}
            className="text-xl cursor-pointer"
          >
            <FaX />
          </button>
        </div>
        <ul className="grid gap-4">
            <NavLink
                to={"/dashboard"}
                className={({ isActive }) =>
                    `h-10 px-4 rounded-lg font-medium ${isActive ? "bg-primary" : ""}`
                }
            >
                Dashboard
            </NavLink>
            <div className="flex gap-3">
                <div
                    className={`w-[calc(100%-16px)] flex items-center gap-3 text-black dark:text-light-tetiary px-4 py-3 hover:bg-light-tetiary hover:dark:bg-dark-tetiary hover:text-primary hover:font-semibold cursor-pointer rounded-md text-xs ${
                        openMenu &&
                        "bg-light-tetiary dark:bg-dark-tetiary text-primary font-semibold border border-primary/2"
                    }`}
                    title={item.name}
                    onClick={() => setOpenDropMenu(openMenu ? null : item.name)}
                >
                <div
                    className={`flex items-center w-full h-full gap-2`}
                >
                    <span>Branches</span>
                </div>
                <IoChevronDown
                    className={`transition-transform ${
                        isOpen ? "rotate-180" : ""
                    }`}
                />
                </div>
            </div>
          {branches.map((branch) => (
            <NavLink
              to={`/dashboard/branch/${branch.keyWord}`}
              className={({ isActive }) =>
                `h-10 px-4 rounded-lg ${isActive ? "bg-primary" : ""}`
              }
            >
              {branch.title}
            </NavLink>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default SideNav;
