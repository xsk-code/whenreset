export type ResetType = "regular" | "banked";

/**
 * How a record entered the authoritative dataset.
 * `manual` = a human confirmed the announcement; `upstream` = it came from the
 * competitor API without human confirmation; `x_api` / `official_status` are
 * reserved for official sources.
 */
export type Provenance = "manual" | "upstream" | "x_api" | "official_status";

export interface ResetSource {
  type: "x_post" | "observed" | string;
  author?: string;
  url: string;
}

export interface ResetItem {
  id: string;
  reset_type: ResetType;
  announced_at: string;
  text: string;
  source: ResetSource;
  /**
   * Where this record came from. Every record the site serves states this,
   * because "the data comes from public announcements" is only auditable if
   * each row can be traced. Absent values on an upstream record are treated as
   * `upstream` by `reconcileResets()`.
   */
  provenance?: Provenance;
}

export interface StatusStats {
  total: number;
  last_reset_at: string;
  days_since_last: number;
  /** Plain arithmetic mean over all recorded gaps, droughts included. */
  avg_interval_days: number;
  /**
   * Median gap over the same (0, 90) day window the forecast uses.
   * This is the cadence figure shown on the page and fed to the forecast;
   * `avg_interval_days` must never be substituted for it.
   */
  median_interval_days: number;
  /** Longest recorded gap, as measured. Never floored to a hardcoded value. */
  longest_wait_days: number;
}

export interface ActiveWatch {
  level?: "calm" | "elevated" | "critical" | string;
  reset_chance_percent?: number;
  forecast_window?: string | null;
  observed_at?: string;
  expires_at?: string | null;
  text?: string;
  source?: ResetSource;
  active?: boolean;
  probability?: number;
  title?: string;
  description?: string;
}

export interface ScheduledReset {
  id: string;
  status: "scheduled" | string;
  reset_type: ResetType;
  announced_at: string;
  scheduled_for: string;
  text: string;
  source: ResetSource;
}

export interface StatusData {
  latest_reset: ResetItem;
  scheduled_reset: ScheduledReset | null;
  active_watch: ActiveWatch | null;
  stats: StatusStats;
}

export interface StatusResponse {
  data: StatusData;
  meta: {
    api_version: string;
    generated_at: string;
    is_fallback?: boolean;
  };
}

export interface ResetsResponse {
  data: ResetItem[];
  pagination: {
    has_more: boolean;
    next_cursor: string | null;
  };
  meta: {
    api_version: string;
    generated_at: string;
    is_fallback?: boolean;
  };
}
