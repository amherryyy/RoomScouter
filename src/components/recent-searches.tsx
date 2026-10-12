"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import type { InputHTMLAttributes } from "react";
import { UiIcon } from "./ui-icon";

type SavedSearch = { href: string; label: string; savedAt: number };
type SearchHistoryInputProps = Pick<InputHTMLAttributes<HTMLInputElement>, "id" | "name" | "defaultValue" | "maxLength" | "placeholder">;

const STORAGE_KEY = "roomscouter:recent-searches:v1";
const MAX_SEARCHES = 5;
const TYPE_LABELS: Record<string, string> = {
  bedspace: "Bedspace",
  shared_room: "Shared room",
  private_room: "Private room",
  studio: "Studio",
};
const dateFormatter = new Intl.DateTimeFormat("en-PH", { dateStyle: "medium" });

function readHistory(): SavedSearch[] {
  try {
    const parsed: unknown = JSON.parse(window.localStorage.getItem(STORAGE_KEY) ?? "[]");
    if (!Array.isArray(parsed)) return [];
    return parsed.filter((item): item is SavedSearch =>
      item !== null && typeof item === "object"
      && typeof item.href === "string" && /^\/(browse|map)(\?|$)/.test(item.href)
      && typeof item.label === "string" && typeof item.savedAt === "number",
    ).slice(0, MAX_SEARCHES).map((item) => ({
      ...item,
      label: describeSearch(new URL(item.href, window.location.origin).searchParams),
    }));
  } catch {
    return [];
  }
}

function describeSearch(params: URLSearchParams): string {
  const parts: string[] = [];
  const query = params.get("q")?.trim();
  const barangay = params.get("barangay")?.trim();
  const rent = params.get("maximumRent");
  const type = params.get("roomType");
  const distance = params.get("maximumDistance");
  const rooms = Number(params.get("minimumRooms") ?? 1);
  if (query) parts.push('"' + query.slice(0, 70) + '"');
  if (barangay) parts.push(barangay);
  if (rent) parts.push("Up to PHP " + Number(rent).toLocaleString("en-PH") + "/month");
  if (type && TYPE_LABELS[type]) parts.push(TYPE_LABELS[type]);
  if (Number.isFinite(rooms) && rooms > 1) parts.push(rooms + " or more rooms");
  if (distance) parts.push("Within " + distance + " km of NVSU");
  if (params.has("facility") || params.has("utility")) parts.push("Additional filters");
  return parts.join(" | ") || "All available rooms";
}

export function SearchHistoryTracker() {
  useEffect(() => {
    const capture = (event: Event) => {
      const form = event.target;
      if (!(form instanceof HTMLFormElement)) return;
      const action = new URL(form.action, window.location.origin);
      if (action.origin !== window.location.origin || !["/browse", "/map"].includes(action.pathname)) return;
      const formData = new FormData(form);
      const params = new URLSearchParams();
      for (const name of ["q", "barangay", "maximumRent", "minimumRooms", "roomType", "facility", "utility", "maximumDistance"]) {
        const value = formData.get(name);
        if (typeof value === "string" && value.trim() && !(name === "minimumRooms" && value === "1")) params.set(name, value.trim());
      }
      const href = action.pathname + (params.size ? "?" + params.toString() : "");
      const next = [{ href, label: describeSearch(params), savedAt: Date.now() }, ...readHistory().filter((item) => item.href !== href)].slice(0, MAX_SEARCHES);
      try {
        window.localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
        window.dispatchEvent(new Event("roomscouter:search-history-updated"));
      } catch {
        // Search still works if this browser blocks local storage.
      }
    };
    window.addEventListener("submit", capture, true);
    return () => window.removeEventListener("submit", capture, true);
  }, []);

  return null;
}

export function SearchHistoryInput({ defaultValue = "", ...inputProps }: SearchHistoryInputProps) {
  const [value, setValue] = useState(String(defaultValue));
  const [searches, setSearches] = useState<SavedSearch[]>([]);
  const [open, setOpen] = useState(false);

  useEffect(() => setValue(String(defaultValue)), [defaultValue]);

  useEffect(() => {
    const refresh = () => setSearches(readHistory());
    refresh();
    window.addEventListener("storage", refresh);
    window.addEventListener("roomscouter:search-history-updated", refresh);
    return () => {
      window.removeEventListener("storage", refresh);
      window.removeEventListener("roomscouter:search-history-updated", refresh);
    };
  }, []);

  const suggestions = useMemo(() => {
    const query = value.trim().toLocaleLowerCase();
    if (!query) return searches;
    return searches.filter((search) => search.label.toLocaleLowerCase().includes(query));
  }, [searches, value]);
  const suggestionsId = inputProps.id ? `${inputProps.id}-history-suggestions` : undefined;

  return (
    <div className="search-history-input">
      <input
        {...inputProps}
        name={inputProps.name ?? "q"}
        value={value}
        autoComplete="off"
        aria-expanded={open && suggestions.length > 0}
        aria-controls={suggestionsId}
        onChange={(event) => setValue(event.currentTarget.value)}
        onFocus={() => setOpen(true)}
        onKeyDown={(event) => { if (event.key === "Escape") setOpen(false); }}
        onBlur={(event) => {
          if (!event.currentTarget.parentElement?.contains(event.relatedTarget as Node | null)) setOpen(false);
        }}
      />
      {open && suggestions.length > 0 ? (
        <div className="search-history-suggestions">
          <p className="search-history-suggestions-title">Recent searches</p>
          <ul id={suggestionsId} aria-label="Recent searches">
            {suggestions.map((search) => (
              <li key={search.href}>
                <Link className="search-history-suggestion" href={search.href}>
                  <UiIcon className="ui-icon" name="search" />
                  <span>{search.label}</span>
                </Link>
              </li>
            ))}
          </ul>
        </div>
      ) : null}
    </div>
  );
}

export function RecentSearches() {
  const [searches, setSearches] = useState<SavedSearch[]>([]);
  useEffect(() => {
    const refresh = () => setSearches(readHistory());
    refresh();
    window.addEventListener("storage", refresh);
    window.addEventListener("roomscouter:search-history-updated", refresh);
    return () => {
      window.removeEventListener("storage", refresh);
      window.removeEventListener("roomscouter:search-history-updated", refresh);
    };
  }, []);

  function save(next: SavedSearch[]) {
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
      window.dispatchEvent(new Event("roomscouter:search-history-updated"));
    } catch {
      // Keep the visible list usable if browser storage is unavailable.
    }
    setSearches(next);
  }

  function clear() {
    try {
      window.localStorage.removeItem(STORAGE_KEY);
      window.dispatchEvent(new Event("roomscouter:search-history-updated"));
      window.dispatchEvent(new Event("storage"));
    } catch {
      // The panel remains usable if browser storage is unavailable.
    }
    setSearches([]);
  }

  return (
    <section className="account-section recent-search-history" aria-labelledby="recent-searches-title">
      <details className="recent-searches-dropdown">
        <summary>
          <span className="recent-searches-heading">
            <span className="eyebrow">On this device</span>
            <span className="recent-searches-title" id="recent-searches-title">Recent searches</span>
          </span>
          <span className="recent-searches-summary-meta">
            <span>{searches.length}</span>
            <UiIcon className="ui-icon" name="chevron-down" />
          </span>
        </summary>
        <div className="recent-searches-panel">
          {searches.length ? (
            <ul className="recent-searches-list">
              {searches.map((search) => (
                <li key={search.href}>
                  <div className="recent-search-item">
                    <Link href={search.href}>
                      <UiIcon className="ui-icon" name="search" />
                      <span><strong>{search.label}</strong><small>Searched {dateFormatter.format(new Date(search.savedAt))}</small></span>
                    </Link>
                    <button className="recent-search-remove" type="button" onClick={() => save(searches.filter((item) => item.href !== search.href))} aria-label={"Remove search: " + search.label}>Remove</button>
                  </div>
                </li>
              ))}
            </ul>
          ) : <p className="recent-searches-empty">Your recent searches will appear here.</p>}
          <div className="recent-searches-footer">
            <p>Only this browser stores these searches.</p>
            {searches.length ? <button className="text-link" type="button" onClick={clear}>Clear history</button> : null}
          </div>
        </div>
      </details>
    </section>
  );
}
