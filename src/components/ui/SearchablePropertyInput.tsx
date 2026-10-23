import React, { useState, useEffect, useRef } from "react";
import { FaSearch, FaSpinner } from "react-icons/fa";
import { propertyApi } from "../../helpers/api";

export interface SearchablePropertyInputProps {
  onSelect: (property: any) => void;
  placeholder?: string;
  className?: string;
  label?: string;
}

const SearchablePropertyInput: React.FC<SearchablePropertyInputProps> = ({
  onSelect,
  placeholder = "Search property by name...",
  className = "",
  label,
}) => {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

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
        const response = await propertyApi.get("/properties/search", {
          params: { name: query.trim(), per_page: 8 },
        });
        const list = response.data?.data?.data || response.data?.data || [];
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

  return (
    <div className="relative w-full" ref={dropdownRef}>
      {label && (
        <label className="block text-xs font-semibold text-gray-600 uppercase tracking-wider mb-1">
          {label}
        </label>
      )}
      <div className="relative">
        <input
          type="text"
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setShowDropdown(true);
          }}
          onFocus={() => {
            if (results.length > 0) setShowDropdown(true);
          }}
          placeholder={placeholder}
          className={`w-full h-11 pl-10 pr-10 text-sm rounded-lg border border-primary/20 bg-white focus:border-primary focus:outline-none transition ${className}`}
        />
        <FaSearch className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 size-3.5" />
        {loading && (
          <FaSpinner className="absolute right-3.5 top-1/2 -translate-y-1/2 text-primary animate-spin size-4" />
        )}
      </div>

      {showDropdown && results.length > 0 && (
        <ul className="absolute z-50 left-0 right-0 mt-1 max-h-60 overflow-y-auto bg-white border border-gray-200 rounded-lg shadow-xl divide-y divide-gray-100">
          {results.map((item) => (
            <li
              key={item.id}
              onClick={() => {
                onSelect(item);
                setQuery("");
                setShowDropdown(false);
              }}
              className="px-4 py-2.5 hover:bg-secondary cursor-pointer transition text-left"
            >
              <p className="text-sm font-semibold text-gray-900">{item.name}</p>
              {item.location && (
                <p className="text-xs text-gray-500">{item.location}</p>
              )}
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
