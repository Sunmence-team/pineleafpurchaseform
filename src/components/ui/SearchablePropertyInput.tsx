import React, { useState, useEffect, useRef } from "react";
import { FaSearch, FaSpinner } from "react-icons/fa";
import { api } from "../../helpers/api";

export interface SearchablePropertyInputProps {
  value?: string;
  selectedItem?: any;
  onSelect: (property: any) => void;
  onClear?: () => void;
  placeholder?: string;
  className?: string;
  inputContClassName?: string;
  label?: string;
  disabled?: boolean;
  clearable?: boolean;
  icon?: React.ReactNode;
  onBlur?: () => void;
}

const SearchablePropertyInput: React.FC<SearchablePropertyInputProps> = ({
  value,
  selectedItem,
  onSelect,
  onClear,
  placeholder = "Search property by name...",
  className = "",
  inputContClassName = "",
  label,
  disabled = false,
  clearable = false,
  icon,
  onBlur,
}) => {
  const [query, setQuery] = useState(
    selectedItem?.name ? selectedItem.name : (value || ""),
  );
  const [results, setResults] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const isInteractingWithDropdown = useRef<boolean>(false);

  useEffect(() => {
    if (selectedItem?.name) {
      setQuery(selectedItem.name);
    } else if (value !== undefined) {
      setQuery(value);
    }
  }, [value, selectedItem]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setShowDropdown(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    if (!query.trim()) {
      setResults([]);
      return;
    }

    const timer = setTimeout(async () => {
      setLoading(true);
      try {
        const response = await api.get("/properties/search", {
          params: { name: query.trim(), per_page: 10 },
        });
        const list = response.data?.data?.data || [];
        setResults(Array.isArray(list) ? list : []);
        setShowDropdown(true);
      } catch (err) {
        console.error("Error searching properties:", err);
      } finally {
        setLoading(false);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [query]);

  const handleClear = () => {
    setQuery("");
    setShowDropdown(false);
    if (onClear) {
      onClear();
    }
  };

  return (
    <div className="relative w-full" ref={dropdownRef}>
      {label && (
        <label className="block text-xs font-semibold text-gray-600 uppercase tracking-wider mb-1">
          {label}
        </label>
      )}
      <div
        className={
          inputContClassName ||
          "relative flex items-center"
        }
      >
        {icon ? (
          icon
        ) : (
          <FaSearch className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 size-3.5" />
        )}
        <input
          type="text"
          value={query}
          disabled={disabled}
          onChange={(e) => {
            setQuery(e.target.value);
            setShowDropdown(true);
          }}
          onFocus={() => {
            setShowDropdown(true);
          }}
          onBlur={() => {
            if (!isInteractingWithDropdown.current && onBlur) {
              onBlur();
            }
          }}
          placeholder={placeholder}
          className={
            className ||
            `w-full h-11 ${
              icon ? "pl-2" : "pl-10"
            } pr-10 text-sm rounded-lg border border-primary/20 bg-white focus:border-primary focus:outline-none transition`
          }
        />
        <div className="absolute right-3.5 top-1/2 -translate-y-1/2 flex items-center gap-1.5">
          {loading && (
            <FaSpinner className="text-primary animate-spin size-4" />
          )}
          {clearable && query && !loading && (
            <button
              type="button"
              onClick={handleClear}
              className="text-gray-400 hover:text-gray-600 focus:outline-none"
            >
              &times;
            </button>
          )}
        </div>
      </div>

      {showDropdown && results.length > 0 && (
        <ul
          className="absolute z-50 left-0 right-0 mt-1 max-h-60 overflow-y-auto styled-scrollbar bg-white border border-primary/10 rounded-lg shadow-xl divide-y divide-primary/20"
          onMouseDown={() => {
            isInteractingWithDropdown.current = true;
          }}
          onMouseUp={() => {
            setTimeout(() => {
              isInteractingWithDropdown.current = false;
            }, 100);
          }}
        >
          {results.map((item) => (
            <li
              key={item.id}
              onClick={() => {
                onSelect(item);
                setShowDropdown(false);
              }}
              className="px-4 py-2.5 hover:bg-secondary cursor-pointer transition text-left"
            >
              <p className="text-sm font-semibold text-gray-900">{item.name}</p>
            </li>
          ))}
        </ul>
      )}

      {showDropdown && !loading && query.trim() && results.length === 0 && (
        <div className="absolute z-50 left-0 right-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg p-3 text-center text-xs text-gray-500">
          No matching properties found
        </div>
      )}
    </div>
  );
};

export default SearchablePropertyInput;
