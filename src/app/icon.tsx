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
          backgroundColor: "#FBD000",
          border: "2px solid #000000",
          boxSizing: "border-box",
          position: "relative",
        }}
      >
        {/* Top/Left Highlight */}
        <div
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            height: 2,
            backgroundColor: "#FFF587",
          }}
        />
        <div
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            bottom: 0,
            width: 2,
            backgroundColor: "#FFF587",
          }}
        />

        {/* Bottom/Right Shadow */}
        <div
          style={{
            position: "absolute",
            bottom: 0,
            left: 0,
            right: 0,
            height: 2,
            backgroundColor: "#B84418",
          }}
        />
        <div
          style={{
            position: "absolute",
            top: 0,
            right: 0,
            bottom: 0,
            width: 2,
            backgroundColor: "#B84418",
          }}
        />

        {/* 4 Corner Rivets */}
        <div
          style={{
            position: "absolute",
            top: 3,
            left: 3,
            width: 2,
            height: 2,
            backgroundColor: "#000000",
          }}
        />
        <div
          style={{
            position: "absolute",
            top: 3,
            right: 3,
            width: 2,
            height: 2,
            backgroundColor: "#000000",
          }}
        />
        <div
          style={{
            position: "absolute",
            bottom: 3,
            left: 3,
            width: 2,
            height: 2,
            backgroundColor: "#000000",
          }}
        />
        <div
          style={{
            position: "absolute",
            bottom: 3,
            right: 3,
            width: 2,
            height: 2,
            backgroundColor: "#000000",
          }}
        />

        {/* Pixel Question Mark */}
        <div
          style={{
            fontSize: 20,
            fontWeight: 900,
            color: "#000000",
            lineHeight: 1,
            textShadow: "1px 1px 0px #B84418",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontFamily: "monospace",
          }}
        >
          ?
        </div>
      </div>
    ),
    {
      ...size,
    }
  );
}
