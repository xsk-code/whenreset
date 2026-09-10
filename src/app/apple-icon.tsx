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
          backgroundColor: "#0F111A",
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
            backgroundColor: "#FBD000",
            border: "6px solid #000000",
            boxSizing: "border-box",
            position: "relative",
            boxShadow: "6px 6px 0px #000000",
          }}
        >
          {/* Highlight Top/Left */}
          <div
            style={{
              position: "absolute",
              top: 0,
              left: 0,
              right: 0,
              height: 10,
              backgroundColor: "#FFF587",
            }}
          />
          <div
            style={{
              position: "absolute",
              top: 0,
              left: 0,
              bottom: 0,
              width: 10,
              backgroundColor: "#FFF587",
            }}
          />

          {/* Shadow Bottom/Right */}
          <div
            style={{
              position: "absolute",
              bottom: 0,
              left: 0,
              right: 0,
              height: 10,
              backgroundColor: "#B84418",
            }}
          />
          <div
            style={{
              position: "absolute",
              top: 0,
              right: 0,
              bottom: 0,
              width: 10,
              backgroundColor: "#B84418",
            }}
          />

          {/* 4 Corner Rivets */}
          <div
            style={{
              position: "absolute",
              top: 14,
              left: 14,
              width: 12,
              height: 12,
              backgroundColor: "#000000",
            }}
          />
          <div
            style={{
              position: "absolute",
              top: 14,
              right: 14,
              width: 12,
              height: 12,
              backgroundColor: "#000000",
            }}
          />
          <div
            style={{
              position: "absolute",
              bottom: 14,
              left: 14,
              width: 12,
              height: 12,
              backgroundColor: "#000000",
            }}
          />
          <div
            style={{
              position: "absolute",
              bottom: 14,
              right: 14,
              width: 12,
              height: 12,
              backgroundColor: "#000000",
            }}
          />

          {/* Center Pixel Question Mark */}
          <div
            style={{
              fontSize: 100,
              fontWeight: 900,
              color: "#000000",
              lineHeight: 1,
              textShadow: "4px 4px 0px #B84418",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontFamily: "monospace",
            }}
          >
            ?
          </div>
        </div>
      </div>
    ),
    {
      ...size,
    }
  );
}
