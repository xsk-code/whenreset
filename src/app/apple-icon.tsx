import { ImageResponse } from "next/og";

export const runtime = "edge";
export const size = {
  width: 180,
  height: 180,
};
export const contentType = "image/png";

export default function AppleIcon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          backgroundColor: "#080B11",
          boxSizing: "border-box",
          padding: 16,
        }}
      >
        <div
          style={{
            width: "100%",
            height: "100%",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            backgroundColor: "#0F1420",
            borderRadius: 32,
            border: "2.5px solid #10B981",
            boxSizing: "border-box",
            position: "relative",
            boxShadow: "0 0 25px rgba(16, 185, 129, 0.25)",
          }}
        >
          {/* Top-right telemetry pulse beacon */}
          <div
            style={{
              position: "absolute",
              top: 14,
              right: 14,
              width: 14,
              height: 14,
              borderRadius: "50%",
              backgroundColor: "#10B981",
              border: "2px solid #A7F3D0",
            }}
          />

          {/* Center Terminal prompt */}
          <div
            style={{
              fontSize: 72,
              fontWeight: 900,
              color: "#10B981",
              lineHeight: 1,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontFamily: "monospace",
              letterSpacing: -4,
              marginLeft: -4,
            }}
          >
            {">_"}
          </div>
        </div>
      </div>
    ),
    {
      ...size,
    }
  );
}
