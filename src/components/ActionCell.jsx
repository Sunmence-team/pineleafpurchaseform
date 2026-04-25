import React, { useState, useEffect, useRef } from "react";
import { FaEye } from "react-icons/fa6";
import { FiEdit, FiTrash2 } from "react-icons/fi";
import { TfiMore } from "react-icons/tfi";
import { useFloating, offset, flip, shift, autoUpdate, FloatingPortal } from '@floating-ui/react';

const ActionCell = ({
  rowId,
  onEdit,
  onDelete,
  onView,
  canView = false,
}) => {
  const [open, setOpen] = useState(false);
  const dropdownRef = useRef(null);

  const { refs, floatingStyles } = useFloating({
    open,
    onOpenChange: setOpen,
    placement: 'bottom-end',
    middleware: [offset(10), flip(), shift()],
    whileElementsMounted: autoUpdate,
  });

  // Handle clicking outside since Portal moves it out of the local DOM tree
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        // Only close if the click isn't inside the floating element itself
        const floatingEl = refs.floating.current;
        if (floatingEl && floatingEl.contains(event.target)) return;
        
        setOpen(false);
      }
    };

    if (open) document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [open, refs.floating]);

  return (
    <div className="flex justify-center items-center" ref={dropdownRef}>
      <div 
        ref={refs.setReference} 
        className={`hover:bg-primary/10 w-10 h-10 flex items-center justify-center rounded-lg cursor-pointer ${open ? "bg-primary/20" : ""}`}
        onClick={() => setOpen(!open)}
      >
        <TfiMore size={20} className="rotate-90 text-primary" />
      </div>

      {/* 2. Wrap the menu in FloatingPortal */}
      {open && (
        <FloatingPortal>
          <div 
            ref={refs.setFloating}
            style={{ ...floatingStyles, zIndex: 9999 }} // Ensure it's above everything
            className="flex flex-col bg-white rounded shadow-xl border border-gray-100 min-w-32 text-xs"
          >
            {(canView || onView) && (
              <button
                className="flex items-center gap-2 px-3 py-2 hover:bg-gray-100 cursor-pointer"
                onClick={() => { onView?.(rowId); setOpen(false); }}
              >
                <FaEye /> View
              </button>
            )}
            {onEdit && (
              <button
                className="flex items-center gap-2 px-3 py-2 hover:bg-gray-100 cursor-pointer"
                onClick={() => { onEdit(rowId); setOpen(false); }}
              >
                <FiEdit /> Edit
              </button>
            )}
            {onDelete && (
              <button
                className="flex items-center gap-2 px-3 py-2 hover:bg-gray-100 cursor-pointer text-red-600 border-t border-gray-50"
                onClick={() => { onDelete(rowId); setOpen(false); }}
              >
                <FiTrash2 /> Delete
              </button>
            )}
          </div>
        </FloatingPortal>
      )}
    </div>
  );
};

export default ActionCell;