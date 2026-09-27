export const selfAssignableRoles = ["student", "owner"] as const;

export type SelfAssignableRole = (typeof selfAssignableRoles)[number];

export function parseSelfAssignableRole(value: FormDataEntryValue | null): SelfAssignableRole | null {
  return typeof value === "string" && selfAssignableRoles.includes(value as SelfAssignableRole)
    ? value as SelfAssignableRole
    : null;
}

export function parseRequiredText(value: FormDataEntryValue | null, maximumLength: number): string | null {
  if (typeof value !== "string") return null;
  const normalized = value.trim();
  return normalized.length > 0 && normalized.length <= maximumLength ? normalized : null;
}

export function parsePassword(value: FormDataEntryValue | null): string | null {
  return typeof value === "string" && value.length >= 8 && value.length <= 128 ? value : null;
}
