export type ResetType = "regular" | "banked";

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
}

export interface StatusStats {
  total: number;
  last_reset_at: string;
  days_since_last: number;
  avg_interval_days: number;
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

export interface StatusData {
  latest_reset: ResetItem;
  scheduled_reset: unknown | null;
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
