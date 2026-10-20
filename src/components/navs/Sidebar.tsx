import React, { useState } from "react";
import { NavLink } from "react-router-dom";
import { useLocation } from "react-router-dom";
import { FiChevronDown, FiLogOut } from "react-icons/fi";
import { MdSettings } from "react-icons/md";
import { navItems } from "../../lib/navItems";
import Modal from "../modals/Modal";
import { useUser } from "../../hooks/useUser";
import assets from "../../assets/assets";

const Sidebar = ({
  setIsOpen,
}: {
  setIsOpen: React.Dispatch<React.SetStateAction<boolean>>;
}) => {
  const [showLogOutModal, setShowLogOutModal] = useState<boolean>(false);
  const [openGroups, setOpenGroups] = useState<Record<string, boolean>>({});
  const { role, logout } = useUser();
  const location = useLocation();

  const canAccess = (roles: string[]) =>
    roles.map((r) => r.toLowerCase()).includes(role?.toLowerCase() ?? "");

  const filteredLinks = navItems.filter(
    (navItem) =>
      canAccess(navItem.role) ||
      navItem.children?.some((child) => canAccess(child.role)),
  );

  return (
    <div className="bg-secondary border-r border-primary/10 lg:w-full md:w-3/5 w-4/5 h-full px-2 py-4 md:pt-0 pt-8 flex flex-col">
      <div className="flex items-center gap-4 px-4 border-b border-primary/10">
        <img
          src={assets.logo}
          alt="Pineleaf Estates logo"
          className="h-16 w-auto"
        />
        <h3 className="text-xl font-medium text-black">Pineleaf</h3>
      </div>
      <ul className="px-4 lg:mt-4 mt-8 flex flex-col gap-2 h-4/5 overflow-y-scroll no-scrollbar pb-6">
        {filteredLinks.map((item, index) => {
          const visibleChildren = item.children?.filter((child) =>
            canAccess(child.role),
          );
          const hasChildren = Boolean(visibleChildren?.length);
          const isGroupActive = Boolean(
            visibleChildren?.some((child) => location.pathname === child.path),
          );
          const isGroupOpen = openGroups[item.name] ?? isGroupActive;

          if (hasChildren) {
            return (
              <li key={item.name}>
                <button
                  type="button"
                  className={`flex w-full items-center gap-2 text-black transition-all duration-300 border-0 hover:bg-white hover:font-semibold hover:text-primary hover:shadow-md px-4 py-2.5 rounded-md cursor-pointer text-[11px] ${
                    isGroupActive
                      ? "bg-white text-primary font-semibold shadow-md border border-primary/5"
                      : ""
                  }`}
                  onClick={() =>
                    setOpenGroups((prev) => ({
                      ...prev,
                      [item.name]: !(prev[item.name] ?? isGroupActive),
                    }))
                  }
                >
                  <span>
                    <item.icon size={13} />
                  </span>
                  <span className="flex-1 text-left">{item.name}</span>
                  <FiChevronDown
                    size={13}
                    className={`transition-transform duration-300 ${
                      isGroupOpen ? "rotate-180" : ""
                    }`}
                  />
                </button>

                {isGroupOpen && (
                  <div className="ml-6 mt-2 flex flex-col gap-1 border-l border-primary/10 pl-4">
                    {visibleChildren?.map((child) => (
                      <NavLink
                        key={child.path}
                        to={child.path}
                        end
                        className={({ isActive }) =>
                          `rounded-md px-3 py-2 text-[11px] transition-all duration-300 hover:bg-white hover:font-semibold hover:text-primary ${
                            isActive
                              ? "bg-white text-primary font-semibold"
                              : "text-black"
                          }`
                        }
                        onClick={() => setIsOpen(false)}
                      >
                        {child.name}
                      </NavLink>
                    ))}
                  </div>
                )}
              </li>
            );
          }

          if (!item.path) return null;

          return (
            <NavLink
              key={index}
              to={item.path}
              end
              className={({
                isActive,
              }) => `flex items-center gap-2 text-black transition-all duration-300 border-0 hover:bg-white hover:font-semibold hover:text-primary hover:shadow-md px-4 py-2.5 rounded-md cursor-pointer text-[11px] ${
                isActive
                  ? "bg-white text-primary font-semibold shadow-md border border-primary/5"
                  : ""
              }
              `}
              onClick={() => setIsOpen(false)}
            >
              <span>
                <item.icon size={13} />
              </span>
              <span>{item.name}</span>
            </NavLink>
          );
        })}
      </ul>

      <ul className="px-2 pt-2 border-t border-tableHeading/20 flex flex-col gap-1 justify-end mt-auto">
        <li>
          <NavLink
            to="/dashboard/settings"
            className={({ isActive }) =>
              `flex items-center gap-3 text-black transition-all duration-300 px-4 py-2.5 rounded-md border-0 cursor-pointer text-[11px] hover:bg-white hover:font-semibold hover:text-primary hover:shadow-md ${
                isActive
                  ? "bg-white text-primary font-semibold shadow-md border border-primary/5"
                  : ""
              }`
            }
          >
            <MdSettings size={13} />
            <span>Settings</span>
          </NavLink>
        </li>

        <li>
          <button
            onClick={() => setShowLogOutModal(true)}
            className="flex items-center gap-3 text-black transition-all duration-300 px-4 py-2.5 rounded-md cursor-pointer text-[11px] hover:bg-white hover:font-semibold hover:text-primary hover:shadow-md w-full text-left"
          >
            <FiLogOut size={13} />
            <span>Logout</span>
          </button>
        </li>
      </ul>

      {showLogOutModal && (
        <Modal onClose={() => setShowLogOutModal(false)} customMode>
          <div className="flex items-center flex-col bg-white rounded-xl py-6 px-8">
            <h3 className="font-medium text-lg text-red-700">
              Are you sure you want to logout?
            </h3>
            <div className="flex w-full mt-8 items-center gap-6">
              <button
                type="button"
                onClick={() => setShowLogOutModal(false)}
                className="bg-secondary text-xs rounded-md font-medium border border-primary/10 w-1/2 h-10 cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={logout}
                className="bg-red-500 text-xs rounded-md font-medium text-white w-1/2 h-10 cursor-pointer"
              >
                Yes, Logout
              </button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};

export default Sidebar;
