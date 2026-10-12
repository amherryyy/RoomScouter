"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

type SavedSearch = { href: string; label: string; savedAt: number };
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
    ).slice(0, MAX_SEARCHES);
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
  if (query) parts.push("“" + query.slice(0, 70) + "”");
  if (barangay) parts.push(barangay);
  if (rent) parts.push("Up to ₱" + Number(rent).toLocaleString("en-PH") + "/month");
  if (type && TYPE_LABELS[type]) parts.push(TYPE_LABELS[type]);
  if (Number.isFinite(rooms) && rooms > 1) parts.push(rooms + " or more rooms");
  if (distance) parts.push("Within " + distance + " km of NVSU");
  if (params.has("facility") || params.has("utility")) parts.push("Additional filters");
  return parts.join(" · ") || "All available rooms";
}

export function RecentSearches() {
  const [searches, setSearches] = useState<SavedSearch[]>([]);
  const [ready, setReady] = useState(false);
  useEffect(() => {
    const refresh = () => setSearches(readHistory());
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
        setSearches(next);
      } catch {
        // The search still works if this browser blocks local storage.
      }
    };
    refresh();
    setReady(true);
    window.addEventListener("storage", refresh);
    window.addEventListener("submit", capture, true);
    return () => {
      window.removeEventListener("storage", refresh);
      window.removeEventListener("submit", capture, true);
    };
  }, []);

  function save(next: SavedSearch[]) {
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
    } catch {
      // Keep the visible list usable if browser storage is unavailable.
    }
    setSearches(next);
  }

  if (!ready || searches.length === 0) return null;
  return (
    <section className="account-section recent-search-history" aria-labelledby="recent-searches-title">
      <div className="section-heading">
        <p className="eyebrow">On this device</p>
        <h2 id="recent-searches-title">Recent searches</h2>
        <p>Only this browser stores these searches. Clear them whenever you like.</p>
        <button className="button secondary" type="button" onClick={() => {
          try { window.localStorage.removeItem(STORAGE_KEY); } catch { /* browser storage may be blocked */ }
          setSearches([]);
        }}>Clear history</button>
      </div>
      <div className="report-history">
        {searches.map((search) => (
          <article className="report-card" key={search.href}>
            <h3><Link href={search.href}>{search.label}</Link></h3>
            <p className="field-help">Searched {dateFormatter.format(new Date(search.savedAt))}</p>
            <button className="text-link" type="button" onClick={() => save(searches.filter((item) => item.href !== search.href))} aria-label={"Remove search: " + search.label}>Remove</button>
          </article>
        ))}
      </div>
    </section>
  );
}