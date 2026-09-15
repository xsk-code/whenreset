import { ImageResponse } from "next/og";

export const runtime = "edge";
export const size = {
  width: 32,
  height: 32,
};
export const contentType = "image/png";

export default function Icon() {
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
          borderRadius: "7px",
          border: "1.5px solid #10B981",
          boxSizing: "border-box",
          position: "relative",
        }}
      >
        {/* Live telemetry pulse indicator */}
        <div
          style={{
            position: "absolute",
            top: 3,
            right: 3,
            width: 4,
            height: 4,
            borderRadius: "50%",
            backgroundColor: "#34D399",
          }}
        />

        {/* Terminal prompt symbol */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            color: "#10B981",
            fontFamily: "monospace",
            fontSize: 16,
            fontWeight: 900,
            letterSpacing: -1,
            marginLeft: -1,
          }}
        >
          {">_"}
        </div>
      </div>
    ),
    {
      ...size,
    }
  );
}
