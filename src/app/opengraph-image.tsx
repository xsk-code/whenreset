import { ImageResponse } from "next/og";

export const runtime = "edge";
export const alt = "WhenReset — Live OpenAI Codex & Claude Quota Reset Radar";
export const size = {
  width: 1200,
  height: 630,
};
export const contentType = "image/png";

export default async function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          backgroundColor: "#080B11",
          padding: "48px 56px",
          fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
          boxSizing: "border-box",
          position: "relative",
        }}
      >
        {/* Ambient background glows */}
        <div
          style={{
            position: "absolute",
            top: "-100px",
            right: "-100px",
            width: "500px",
            height: "500px",
            borderRadius: "50%",
            backgroundColor: "rgba(16, 185, 129, 0.12)",
            filter: "blur(120px)",
          }}
        />
        <div
          style={{
            position: "absolute",
            bottom: "-100px",
            left: "-100px",
            width: "450px",
            height: "450px",
            borderRadius: "50%",
            backgroundColor: "rgba(59, 130, 246, 0.08)",
            filter: "blur(100px)",
          }}
        />

        {/* Top Header Bar */}
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            width: "100%",
            zIndex: 10,
          }}
        >
          {/* Logo & Brand */}
          <div style={{ display: "flex", alignItems: "center", gap: "14px" }}>
            <div
              style={{
                width: "44px",
                height: "44px",
                borderRadius: "12px",
                backgroundColor: "rgba(16, 185, 129, 0.15)",
                border: "1.5px solid rgba(16, 185, 129, 0.4)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: "#10B981",
                fontFamily: "monospace",
                fontSize: "22px",
                fontWeight: "900",
              }}
            >
              {">_"}
            </div>
            <span
              style={{
                fontSize: "28px",
                fontWeight: "800",
                letterSpacing: "-0.5px",
                color: "#FFFFFF",
              }}
            >
              WhenReset
            </span>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "8px",
                backgroundColor: "rgba(16, 185, 129, 0.12)",
                border: "1px solid rgba(16, 185, 129, 0.3)",
                borderRadius: "9999px",
                padding: "6px 14px",
                marginLeft: "8px",
              }}
            >
              <div
                style={{
                  width: "8px",
                  height: "8px",
                  borderRadius: "50%",
                  backgroundColor: "#10B981",
                }}
              />
              <span
                style={{
                  fontSize: "13px",
                  fontWeight: "700",
                  color: "#10B981",
                  letterSpacing: "1px",
                }}
              >
                LIVE RADAR
              </span>
            </div>
          </div>

          {/* Model Coverage */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "10px",
              backgroundColor: "rgba(255, 255, 255, 0.05)",
              border: "1px solid rgba(255, 255, 255, 0.08)",
              borderRadius: "10px",
              padding: "8px 16px",
              fontSize: "14px",
              color: "#94A3B8",
              fontFamily: "monospace",
            }}
          >
            <span>OpenAI Codex</span>
            <span style={{ color: "#64748B" }}>•</span>
            <span>Claude Code</span>
            <span style={{ color: "#64748B" }}>•</span>
            <span>Grok</span>
          </div>
        </div>

        {/* Center Telemetry Card */}
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            backgroundColor: "rgba(15, 20, 32, 0.8)",
            border: "1px solid rgba(255, 255, 255, 0.1)",
            borderRadius: "24px",
            padding: "44px 50px",
            boxShadow: "0 20px 50px rgba(0, 0, 0, 0.5)",
            zIndex: 10,
          }}
        >
          {/* Left Column: Heading & Description */}
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: "16px",
              maxWidth: "640px",
            }}
          >
            <div
              style={{
                fontSize: "44px",
                fontWeight: "900",
                lineHeight: "1.15",
                color: "#FFFFFF",
                letterSpacing: "-1px",
              }}
            >
              AI Quota Reset Radar & Forecast Intelligence
            </div>
            <div
              style={{
                fontSize: "19px",
                lineHeight: "1.5",
                color: "#94A3B8",
              }}
            >
              Real-time usage limit tracking, statistical cadence forecasting, dynamic iCalendar subscriptions, and developer alert pipelines.
            </div>

            {/* Feature Badges */}
            <div
              style={{
                display: "flex",
                flexWrap: "wrap",
                gap: "12px",
                marginTop: "12px",
              }}
            >
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "6px",
                  backgroundColor: "rgba(255, 255, 255, 0.06)",
                  border: "1px solid rgba(255, 255, 255, 0.08)",
                  borderRadius: "8px",
                  padding: "6px 12px",
                  fontSize: "13px",
                  fontWeight: "600",
                  color: "#CBD5E1",
                }}
              >
                <span style={{ color: "#10B981" }}>●</span> 26-Week Heatmap
              </div>
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "6px",
                  backgroundColor: "rgba(255, 255, 255, 0.06)",
                  border: "1px solid rgba(255, 255, 255, 0.08)",
                  borderRadius: "8px",
                  padding: "6px 12px",
                  fontSize: "13px",
                  fontWeight: "600",
                  color: "#CBD5E1",
                }}
              >
                <span style={{ color: "#3B82F6" }}>●</span> Dynamic .ICS Sync
              </div>
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "6px",
                  backgroundColor: "rgba(255, 255, 255, 0.06)",
                  border: "1px solid rgba(255, 255, 255, 0.08)",
                  borderRadius: "8px",
                  padding: "6px 12px",
                  fontSize: "13px",
                  fontWeight: "600",
                  color: "#CBD5E1",
                }}
              >
                <span style={{ color: "#F59E0B" }}>●</span> Instant Bark & Webhook
              </div>
            </div>
          </div>

          {/* Right Column: Telemetry Gauge Widget */}
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              backgroundColor: "rgba(8, 11, 17, 0.8)",
              border: "1.5px solid rgba(16, 185, 129, 0.35)",
              borderRadius: "20px",
              padding: "32px 36px",
              width: "300px",
              boxShadow: "0 0 35px rgba(16, 185, 129, 0.15)",
            }}
          >
            <span
              style={{
                fontSize: "12px",
                fontWeight: "700",
                letterSpacing: "1.5px",
                color: "#10B981",
                marginBottom: "8px",
              }}
            >
              PROBABILISTIC FORECAST
            </span>
            <div
              style={{
                fontSize: "64px",
                fontWeight: "900",
                color: "#FFFFFF",
                lineHeight: "1",
                fontFamily: "monospace",
                display: "flex",
                alignItems: "baseline",
                gap: "4px",
              }}
            >
              <span>92</span>
              <span style={{ fontSize: "32px", color: "#10B981" }}>%</span>
            </div>
            <span
              style={{
                fontSize: "14px",
                fontWeight: "600",
                color: "#E2E8F0",
                marginTop: "10px",
              }}
            >
              Cadence Median: ~3.3d
            </span>
            <div
              style={{
                width: "100%",
                height: "6px",
                backgroundColor: "rgba(255, 255, 255, 0.1)",
                borderRadius: "9999px",
                marginTop: "16px",
                overflow: "hidden",
                display: "flex",
              }}
            >
              <div
                style={{
                  width: "92%",
                  height: "100%",
                  backgroundColor: "#10B981",
                  borderRadius: "9999px",
                }}
              />
            </div>
          </div>
        </div>

        {/* Bottom Status Bar */}
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            width: "100%",
            fontSize: "15px",
            color: "#64748B",
            zIndex: 10,
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <span style={{ color: "#E2E8F0", fontWeight: "600" }}>whenreset.top</span>
            <span>—</span>
            <span>OpenAI Official Incident Signal Powered</span>
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <span>100% Client-Side Privacy</span>
            <span>•</span>
            <span>Zero Server Downtime</span>
          </div>
        </div>
      </div>
    ),
    {
      ...size,
    }
  );
}
