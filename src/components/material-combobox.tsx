"use client";

import { DEFAULT_FILAMENT_TYPES } from "@/lib/filament-types";
import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";

interface MaterialComboboxProps {
  value: string;
  onChange: (value: string) => void;
  usedMaterials?: string[];
  placeholder?: string;
  className?: string;
  id?: string;
  "aria-label"?: string;
  /** When true, shows "All" option to clear the selection (for filter use) */
  allowClear?: boolean;
}

export function MaterialCombobox({
  value,
  onChange,
  usedMaterials = [],
  placeholder = "Material",
  className = "",
  id,
  "aria-label": ariaLabel,
  allowClear = false,
}: MaterialComboboxProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState(value);
  const containerRef = useRef<HTMLDivElement>(null);

  const allOptions = useMemo(() => {
    const defaults = new Set(DEFAULT_FILAMENT_TYPES);
    const used = new Set(usedMaterials);
    return [...defaults, ...used].filter((m) => m.trim()).sort();
  }, [usedMaterials]);

  const filteredOptions = useMemo(() => {
    if (!search.trim()) return allOptions;
    const q = search.trim().toLowerCase();
    return allOptions.filter((m) => m.toLowerCase().includes(q));
  }, [allOptions, search]);

  const canAddCustom =
    search.trim() &&
    !allOptions.some((m) => m.toLowerCase() === search.trim().toLowerCase());

  const handleSelect = useCallback(
    (v: string) => {
      onChange(v);
      setSearch(v);
      setIsOpen(false);
    },
    [onChange]
  );

  const handleBlur = useCallback(() => {
    setTimeout(() => setIsOpen(false), 150);
  }, []);

  useEffect(() => {
    setSearch(value);
  }, [value]);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const handler = (e: MouseEvent) => {
      if (!el.contains(e.target as Node)) setIsOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  return (
    <div ref={containerRef} className="relative">
      <input
        type="text"
        id={id}
        aria-label={ariaLabel}
        aria-expanded={isOpen}
        aria-autocomplete="list"
        role="combobox"
        placeholder={placeholder}
        value={search}
        onChange={(e) => {
          setSearch(e.target.value);
          setIsOpen(true);
        }}
        onFocus={() => setIsOpen(true)}
        onBlur={handleBlur}
        onKeyDown={(e) => {
          if (e.key === "Escape") {
            setIsOpen(false);
            setSearch(value);
          }
          if (e.key === "Enter" && canAddCustom) {
            e.preventDefault();
            handleSelect(search.trim());
          }
        }}
        className={className}
        autoComplete="off"
      />
      {isOpen && (
        <ul
          role="listbox"
          className="absolute z-50 mt-1 max-h-48 w-full overflow-auto rounded-lg border border-[var(--border)] bg-[var(--panel-elevated)] py-1 shadow-lg"
        >
          {allowClear && (
            <li
              role="option"
              aria-selected={!value}
              className="cursor-pointer px-3 py-2 text-body text-[var(--text-muted)] hover:bg-[var(--brand-muted)]"
              onMouseDown={(e) => {
                e.preventDefault();
                handleSelect("");
              }}
            >
              All
            </li>
          )}
          {filteredOptions.map((opt) => (
            <li
              key={opt}
              role="option"
              aria-selected={opt === value}
              className="cursor-pointer px-3 py-2 text-body text-[var(--text)] hover:bg-[var(--brand-muted)]"
              onMouseDown={(e) => {
                e.preventDefault();
                handleSelect(opt);
              }}
            >
              {opt}
            </li>
          ))}
          {canAddCustom && (
            <li
              role="option"
              className="cursor-pointer px-3 py-2 text-body text-[var(--brand)] hover:bg-[var(--brand-muted)]"
              onMouseDown={(e) => {
                e.preventDefault();
                handleSelect(search.trim());
              }}
            >
              Add &quot;{search.trim()}&quot;
            </li>
          )}
          {filteredOptions.length === 0 && !canAddCustom && (
            <li className="px-3 py-2 text-body text-[var(--text-muted)]">
              No matches
            </li>
          )}
        </ul>
      )}
    </div>
  );
}
