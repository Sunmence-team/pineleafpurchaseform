import React, { useState, useRef, useEffect } from "react";
import { FaChevronDown } from "react-icons/fa6";
import type { ActionButtonProps } from "../../lib/interfaces";

export interface DropdownActionItem {
  label: string;
  action?: () => void;
  onClick?: () => void;
  icon?: React.ReactNode;
  disabled?: boolean;
}

export interface ActionDropdownButtonProps extends ActionButtonProps {
  items?: DropdownActionItem[];
  dropdownClassName?: string;
  dropdownPlacement?: "left" | "right";
}

const ActionButton: React.FC<ActionDropdownButtonProps> = ({
  text,
  loadingText,
  icon,
  loading,
  action,
  onClick,
  disabled,
  buttonStyle = "",
  overideBg = false,
  items,
  dropdownClassName = "",
  dropdownPlacement = "right",
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const hasDropdown = Boolean(items && items.length > 0);

  useEffect(() => {
    if (!isOpen) return;

    const handleClickOutside = (event: MouseEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen]);

  const handleMainClick = () => {
    if (disabled || loading) return;
    if (hasDropdown) {
      setIsOpen((prev) => !prev);
    } else if (onClick || action) {
      (onClick || action)?.();
    }
  };

  const buttonElement = (
    <button
      className={`${overideBg ? "" : `action-btn`} text-white h-10 px-4 min-w-25 rounded-md text-sm flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer ${buttonStyle}`}
      type="button"
      onClick={handleMainClick}
      disabled={disabled || loading}
      aria-expanded={hasDropdown ? isOpen : undefined}
      aria-haspopup={hasDropdown ? "menu" : undefined}
    >
      {icon && !loading && icon}
      {loading && (
        <span
          className={`size-4 border-2 border-white border-t-transparent rounded-full animate-spin`}
        ></span>
      )}
      <span>{loading && loadingText ? loadingText : text}</span>
      {hasDropdown && (
        <FaChevronDown
          className={`size-3 transition-transform duration-200 ${isOpen ? "rotate-180" : ""}`}
        />
      )}
    </button>
  );

  if (!hasDropdown) {
    return buttonElement;
  }

  return (
    <div ref={containerRef} className="relative inline-block text-left">
      {buttonElement}

      {isOpen && (
        <div
          className={`absolute ${
            dropdownPlacement === "right" ? "right-0" : "left-0"
          } mt-2 min-w-[220px] bg-white border border-gray-100 rounded-xl shadow-xl z-50 py-1.5 overflow-hidden animate-in fade-in zoom-in-95 ${dropdownClassName}`}
          role="menu"
        >
          {items?.map((item, index) => (
            <button
              key={index}
              type="button"
              disabled={item.disabled}
              onClick={() => {
                setIsOpen(false);
                (item.onClick || item.action)?.();
              }}
              className="w-full text-left px-4 py-2.5 text-xs md:text-sm font-medium text-gray-700 hover:bg-gray-50 hover:text-primary transition flex items-center gap-2.5 cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
              role="menuitem"
            >
              {item.icon && <span className="text-gray-500">{item.icon}</span>}
              <span>{item.label}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export default ActionButton;
