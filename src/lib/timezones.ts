/**
 * Time-zone helpers for the scheduled-reset countdown.
 *
 * Every conversion routes through `Intl.DateTimeFormat` with an explicit IANA
 * identifier — there is no offset arithmetic anywhere in this file. DST is
 * therefore handled by the runtime's own tz database: Europe/London resolves to
 * UTC+1 in September and UTC+0 in January without this code knowing either fact.
 */

export type Lang = "en" | "zh";

export interface ResetZone {
  /** IANA identifier; also used as the React key. */
  id: string;
  labelEn: string;
  labelZh: string;
  /** Set for the viewer's own zone, which gets hoisted to the front and highlighted. */
  isLocal?: boolean;
}

/**
 * The six zones covering most of the Codex developer population. Deliberately
 * short — this renders as one row of chips beneath the countdown, and a longer
 * list starts wrapping on laptops.
 */
export const RESET_ZONES: ReadonlyArray<ResetZone> = [
  { id: "Asia/Shanghai", labelEn: "Beijing", labelZh: "北京" },
  { id: "Asia/Tokyo", labelEn: "Tokyo", labelZh: "东京" },
  { id: "Europe/London", labelEn: "London", labelZh: "伦敦" },
  { id: "Europe/Berlin", labelEn: "Berlin", labelZh: "柏林" },
  { id: "America/New_York", labelEn: "New York", labelZh: "纽约" },
  { id: "America/Los_Angeles", labelEn: "Los Angeles", labelZh: "洛杉矶" },
];

/** Guards against a bogus browser zone id reaching `Intl`, which would throw. */
export function isValidTimeZone(zone: string): boolean {
  try {
    new Intl.DateTimeFormat("en-US", { timeZone: zone });
    return true;
  } catch {
    return false;
  }
}

/** "America/Argentina/Buenos_Aires" -> "Buenos Aires", for zones off the list. */
export function zoneCity(zone: string): string {
  return zone.split("/").pop()?.replace(/_/g, " ") ?? zone;
}

/** Wall-clock reading in a given zone, e.g. "9月16日 08:00" / "Sep 16, 08:00". */
export function formatZonedTime(date: Date, timeZone: string, lang: Lang): string {
  return new Intl.DateTimeFormat(lang === "zh" ? "zh-CN" : "en-US", {
    timeZone,
    month: lang === "zh" ? "numeric" : "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  }).format(date);
}

/**
 * DST-aware offset label, e.g. "UTC+8" / "UTC-7". Returns "" when the runtime
 * lacks `shortOffset` support (Safari < 16.4) so callers can simply omit it
 * rather than render a wrong number.
 */
export function formatZoneOffset(date: Date, timeZone: string): string {
  try {
    const part = new Intl.DateTimeFormat("en-US", {
      timeZone,
      timeZoneName: "shortOffset",
    })
      .formatToParts(date)
      .find((p) => p.type === "timeZoneName");
    if (!part) return "";
    // "GMT+8" -> "UTC+8"; a zero offset reads better as plain "UTC", which is
    // also what London genuinely observes in winter.
    return part.value.replace("GMT", "UTC").replace(/^UTC\+0$/, "UTC");
  } catch {
    return "";
  }
}

/**
 * Orders the zone list for display: the viewer's own zone first (badged as
 * "yours"), then the presets. A viewer in a zone outside the preset list gets
 * one extra chip prepended rather than a replacement list.
 */
export function orderZones(localZone: string | null): ResetZone[] {
  const preset = RESET_ZONES.map((z) => ({ ...z }));
  if (!localZone) return preset;

  const match = preset.find((z) => z.id === localZone);
  if (match) {
    return [
      { ...match, isLocal: true },
      ...preset.filter((z) => z.id !== localZone),
    ];
  }

  const city = zoneCity(localZone);
  return [{ id: localZone, labelEn: city, labelZh: city, isLocal: true }, ...preset];
}
