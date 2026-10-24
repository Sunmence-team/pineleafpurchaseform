import React, { useState, useEffect, useRef, useCallback } from "react";
import { FaSearch, FaSpinner } from "react-icons/fa";
import { FaChevronDown, FaXmark } from "react-icons/fa6";
import { api } from "../../helpers/api";
import type { SearchableInputProps } from "../../lib/interfaces";

/**
 * Enhanced SearchableInput component
 * 
 * Capabilities:
 * - Direct API search (with request cancellation via AbortController)
 * - Custom fetcher function (supports TanStack Query or custom services)
 * - Static/preloaded options filtering
 * - Custom option renderer (renderOption prop)
 * - Controlled and uncontrolled value synchronization
 * - Full keyboard navigation (Arrow Up/Down, Enter, Escape)
 * - Clearable button (clearable prop)
 * - Accessible combobox ARIA roles
 */
const SearchableInput = <T extends object | string = any>({
  endpoint,
  fetcher,
  options,
  onSelect,
  onClear,
  onInputChange,
  displayKey = "name" as any,
  getDisplayLabel,
  renderOption,
  queryParam = "search",
  requestMethod = "get",
  transformResponse,
  label,
  placeholder = "Search...",
  className = "",
  inputContClassName = "",
  dataKey,
  initialValue = "",
  value,
  showIcon = true,
  icon,
  fetchOnEmpty = false,
  isSelector = false,
  clearable = false,
  disabled = false,
  readOnly = false,
  debounceMs = 300,
  minChars = fetchOnEmpty ? 0 : 1,
  error: externalError,
}: SearchableInputProps<T>) => {
  const [query, setQuery] = useState(initialValue);
  const [prevInitialValue, setPrevInitialValue] = useState(initialValue);
  const [prevValue, setPrevValue] = useState(value);

  const [results, setResults] = useState<T[]>([]);
  const [loading, setLoading] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const [internalError, setInternalError] = useState<string | null>(null);
  const [activeIndex, setActiveIndex] = useState<number>(-1);

  const isSelecting = useRef(false);
  const isFocusedRef = useRef(false);
  const abortControllerRef = useRef<AbortController | null>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const listRef = useRef<HTMLDivElement>(null);
  const fetcherRef = useRef(fetcher);
  fetcherRef.current = fetcher;
  const transformResponseRef = useRef(transformResponse);
  transformResponseRef.current = transformResponse;

  const getItemDisplayText = useCallback(
    (item: T | null | undefined): string => {
      if (!item) return "";
      if (typeof item === "string") return item;
      if (getDisplayLabel) {
        return getDisplayLabel(item);
      }
      if (typeof displayKey === "function") {
        return displayKey(item);
      }
      if (Array.isArray(displayKey)) {
        for (const key of displayKey) {
          const val = item[key];
          if (val !== undefined && val !== null && String(val).trim() !== "") {
            return String(val);
          }
        }
        return "";
      }
      if (displayKey) {
        const val = item[displayKey as keyof T];
        return val !== undefined && val !== null ? String(val) : "";
      }
      return String(item);
    },
    [displayKey, getDisplayLabel],
  );

  // Sync initialValue when it changes
  if (initialValue !== prevInitialValue) {
    setPrevInitialValue(initialValue);
    setQuery(initialValue);
  }

  // Sync controlled value prop when it changes
  if (value !== undefined && value !== prevValue) {
    setPrevValue(value);
    setQuery(typeof value === "string" ? value : getItemDisplayText(value));
  }

  // Close dropdown on click outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setShowDropdown(false);
        setActiveIndex(-1);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  // Fetch or filter options on query change (with debounce & cancellation)
  useEffect(() => {
    if (disabled || readOnly) return;

    const delayDebounceFn = setTimeout(async () => {
      if (isSelecting.current) {
        isSelecting.current = false;
        return;
      }

      const trimmedQuery = query.trim();

      if (!fetchOnEmpty && trimmedQuery.length < minChars) {
        setResults([]);
        return;
      }

      // Cancel any ongoing network request
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
      const controller = new AbortController();
      abortControllerRef.current = controller;

      // 2. Custom fetcher mode
      if (fetcherRef.current) {
        if (!trimmedQuery && options && options.length > 0) {
          setResults(fetchOnEmpty ? options : []);
          setLoading(false);
          return;
        }
        setLoading(true);
        setInternalError(null);
        try {
          const data = await fetcherRef.current(query, controller.signal);
          if (!controller.signal.aborted) {
            setResults(Array.isArray(data) ? data : []);
            setShowDropdown(true);
          }
        } catch (err: unknown) {
          if (
            (err as Error)?.name !== "CanceledError" &&
            (err as Error)?.name !== "AbortError"
          ) {
            console.error("SearchableInput: fetcher error", err);
            setInternalError("Failed to fetch results");
            setResults([]);
          }
        } finally {
          if (!controller.signal.aborted) {
            setLoading(false);
          }
        }
        return;
      }

      // 1. Static options mode
      if (options) {
        setLoading(false);
        setInternalError(null);
        if (!trimmedQuery) {
          setResults(fetchOnEmpty ? options : []);
        } else {
          const q = trimmedQuery.toLowerCase();
          const filtered = options.filter((item) =>
            getItemDisplayText(item).toLowerCase().includes(q),
          );
          setResults(filtered);
        }
        setShowDropdown(true);
        return;
      }

      // 3. API endpoint mode
      if (endpoint) {
        setLoading(true);
        setInternalError(null);
        try {
          const response = await (requestMethod === "post"
            ? api.post(
                endpoint,
                { [queryParam]: query },
                { signal: controller.signal },
              )
            : api.get(endpoint, {
                params: { [queryParam]: query },
                signal: controller.signal,
              }));

          if (controller.signal.aborted) return;

          let data = response.data;
          if (transformResponseRef.current) {
            data = transformResponseRef.current(data);
          } else if (dataKey) {
            const keys = dataKey.split(".");
            for (const key of keys) {
              if (data && typeof data === "object" && key in data) {
                data = (data as Record<string, unknown>)[key];
              } else {
                data = [];
                break;
              }
            }
          } else if (
            data &&
            typeof data === "object" &&
            "data" in data &&
            Array.isArray((data as { data: unknown }).data)
          ) {
            data = (data as { data: unknown[] }).data;
          }

          if (Array.isArray(data)) {
            setResults(data as T[]);
            setShowDropdown(true);
          } else {
            setResults([]);
            console.warn("SearchableInput: API response is not an array", data);
          }
        } catch (err: unknown) {
          if (
            (err as Error)?.name !== "CanceledError" &&
            (err as Error)?.name !== "AbortError"
          ) {
            console.error("SearchableInput: API error", err);
            setInternalError("Failed to fetch results");
            setResults([]);
          }
        } finally {
          if (!controller.signal.aborted) {
            setLoading(false);
          }
        }
      }
    }, debounceMs);

    return () => {
      clearTimeout(delayDebounceFn);
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, [
    query,
    fetchOnEmpty,
    minChars,
    options,
    endpoint,
    requestMethod,
    queryParam,
    dataKey,
    debounceMs,
    disabled,
    readOnly,
    getItemDisplayText,
  ]);

  // Keep highlighted item in view during keyboard navigation
  useEffect(() => {
    if (activeIndex >= 0 && listRef.current) {
      const activeEl = listRef.current.children[activeIndex] as
        | HTMLElement
        | undefined;
      if (activeEl) {
        activeEl.scrollIntoView({ block: "nearest" });
      }
    }
  }, [activeIndex]);

  const handleSelect = (item: T) => {
    isSelecting.current = true;
    setQuery(getItemDisplayText(item));
    setShowDropdown(false);
    setActiveIndex(-1);
    onSelect(item);
  };

  const handleClear = (e: React.MouseEvent) => {
    e.stopPropagation();
    setQuery("");
    setResults([]);
    setShowDropdown(false);
    setActiveIndex(-1);
    onInputChange?.("");
    onClear?.();
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (disabled || readOnly) return;

    if (e.key === "ArrowDown") {
      e.preventDefault();
      if (!showDropdown) {
        setShowDropdown(true);
        setActiveIndex(0);
      } else if (results.length > 0) {
        setActiveIndex((prev) => (prev < results.length - 1 ? prev + 1 : 0));
      }
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      if (!showDropdown) {
        setShowDropdown(true);
        setActiveIndex(results.length - 1);
      } else if (results.length > 0) {
        setActiveIndex((prev) => (prev > 0 ? prev - 1 : results.length - 1));
      }
    } else if (e.key === "Enter") {
      if (showDropdown && activeIndex >= 0 && results[activeIndex]) {
        e.preventDefault();
        handleSelect(results[activeIndex]);
      }
    } else if (e.key === "Escape") {
      setShowDropdown(false);
      setActiveIndex(-1);
    }
  };

  const displayError = externalError || internalError;

  return (
    <div className={`relative ${className}`} ref={dropdownRef}>
      {label && (
        <label className="block text-sm font-medium text-black mb-1">
          {label}
        </label>
      )}

      <div
        className={`flex items-center h-12.5 px-2 transition-all ${
          disabled ? "opacity-60 cursor-not-allowed bg-gray-100" : ""
        } ${inputContClassName}`}
      >
        <div className="pointer-events-none flex items-center justify-center">
          {loading ? (
            <FaSpinner className="animate-spin text-tableHeading ms-2" />
          ) : (
            showIcon ? (icon || <FaSearch className="text-tableHeading" />) : null
          )}
        </div>

        <input
          type="text"
          role="combobox"
          aria-expanded={showDropdown}
          aria-haspopup="listbox"
          aria-controls="searchable-input-dropdown"
          disabled={disabled}
          readOnly={readOnly}
          className="h-full indent-3 outline-0 w-full focus:outline-none text-xs transition duration-150 ease-in-out bg-transparent disabled:cursor-not-allowed"
          placeholder={placeholder}
          value={query}
          onChange={(e) => {
            const value = e.target.value;
            setQuery(value);
            setActiveIndex(-1);
            onInputChange?.(value);
            setShowDropdown(true);
          }}
          onFocus={() => {
            if (!disabled && !readOnly) {
              if (options && fetchOnEmpty && results.length === 0) {
                setResults(options);
              }
              setShowDropdown(true);
            }
          }}
          onKeyDown={handleKeyDown}
        />

        {clearable && query && !disabled && !readOnly && (
          <button
            type="button"
            aria-label="Clear input"
            className="p-1 hover:text-red-500 text-tableHeading transition cursor-pointer"
            onClick={handleClear}
          >
            <FaXmark size={14} />
          </button>
        )}

        {isSelector && (
          <button
            type="button"
            aria-label="Toggle dropdown"
            disabled={disabled}
            className="cursor-pointer p-1 transition"
            onClick={() => {
              if (disabled || readOnly) return;
              setShowDropdown((prev) => {
                const next = !prev;
                if (next && options && fetchOnEmpty && results.length === 0) {
                  setResults(options);
                }
                return next;
              });
            }}
          >
            <FaChevronDown
              className={`text-tableHeading ${
                showDropdown ? "rotate-180" : ""
              } transition-transform duration-200`}
              size={12}
            />
          </button>
        )}
      </div>

      {showDropdown && (
          <div
            id="searchable-input-dropdown"
            role="listbox"
            ref={listRef}
            className="absolute z-50 mt-1 w-full bg-white shadow-lg max-h-60 rounded-md py-1 text-base border border-black/15 overflow-auto styled-scrollbar focus:outline-none sm:text-sm"
          >
            {displayError && (
              <div className="cursor-default select-none relative py-2 pl-3 pr-9 text-red-500 text-xs">
                {displayError}
              </div>
            )}

            {!displayError && results.length === 0 && !loading && (
              <div className="cursor-default select-none relative py-2 pl-3 pr-9 text-tableHeading text-xs">
                No results found.
              </div>
            )}

            {results.map((item, index) => {
              const isSelected =
                value !== undefined
                  ? typeof value === "string"
                    ? value === getItemDisplayText(item)
                    : value === item
                  : getItemDisplayText(item) === query;
              const isActive = index === activeIndex;

              return (
                <div
                  key={`result_${typeof item === "object" && item !== null ? (item as any).id ?? index : item}_${index}`}
                  role="option"
                  aria-selected={isSelected}
                  className={`cursor-pointer select-none relative py-2 pl-3 pr-9 transition-colors duration-150 ${
                    isActive
                      ? "bg-primary/10 font-medium"
                      : "hover:bg-primary/5 font-normal"
                  }`}
                  onClick={() => handleSelect(item)}
                  onMouseEnter={() => setActiveIndex(index)}
                >
                  {renderOption ? (
                    renderOption(item, isSelected)
                  ) : (
                    <span className="block truncate font-normal duration-100 transition-all">
                      {getItemDisplayText(item)}
                    </span>
                  )}
                </div>
              );
            })}
          </div>
        )}
    </div>
  );
};

export default SearchableInput;
