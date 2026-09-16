/**
 * src/lib/analytics-events.ts
 *
 * Every custom analytics event name used by the site, in one place.
 *
 * Why constants instead of string literals at the call sites: event names are
 * a data contract. Renaming one silently orphans the history already collected
 * under the old name, and with the names scattered across components there is
 * no way to find all the call sites when that happens. Import from here.
 *
 * Conventions:
 *   • `snake_case`, `<area>_<object>_<action>`.
 *   • Event names describe an interaction that actually exists in the UI.
 *     This file is not a wish list — see the note on `docs/` below.
 *   • Properties must never carry PII. No email addresses, no webhook URLs,
 *     no Bark keys. Report the *outcome*, not the credential.
 *
 * The property key for outcomes is `status` with values:
 *   "success"      — the action completed
 *   "error"        — the action was attempted and failed
 *   "empty"        — client-side validation rejected the input
 *   "unconfigured" — the server has no provider key (the site is honest about
 *                    this rather than pretending the subscription worked)
 */

export const ANALYTICS_EVENTS = {
  /** Bark push channel — test notification requested from AlertModal. */
  ALERT_BARK_TEST_SUBMITTED: "alert_bark_test_submitted",

  /** Webhook channel — save-and-verify submitted from AlertModal. */
  ALERT_WEBHOOK_SUBMITTED: "alert_webhook_submitted",

  /** Email digest — subscription submitted from AlertModal. */
  EMAIL_SUBSCRIBE_SUBMITTED: "email_subscribe_submitted",

  /** ShareModal — status poster rendered and downloaded as PNG. */
  SHARE_POSTER_DOWNLOADED: "share_poster_downloaded",

  /** ShareModal — share text (domain + forecast) copied to the clipboard. */
  SHARE_TEXT_COPIED: "share_text_copied",

  /** Footer — iCalendar subscription link opened. */
  CALENDAR_SUBSCRIBE_CLICKED: "calendar_subscribe_clicked",

  /** Footer — public JSON API link opened. */
  API_JSON_OPENED: "api_json_opened",

  /** Footer — link out to the upstream announcement account on X. */
  TIBO_PROFILE_OPENED: "tibo_profile_opened",
} as const;

/** Union of every valid event name. */
export type AnalyticsEvent =
  (typeof ANALYTICS_EVENTS)[keyof typeof ANALYTICS_EVENTS];

/** Outcome values allowed in the `status` property. */
export const ANALYTICS_STATUS = {
  SUCCESS: "success",
  ERROR: "error",
  EMPTY: "empty",
  UNCONFIGURED: "unconfigured",
} as const;

export type AnalyticsStatus =
  (typeof ANALYTICS_STATUS)[keyof typeof ANALYTICS_STATUS];
