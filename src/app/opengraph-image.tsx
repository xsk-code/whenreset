import { ImageResponse } from "next/og";

export const runtime = "edge";
export const alt = "WhenReset: 8-Bit Retro Edition | OpenAI Codex Quota Reset Radar";
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
          backgroundColor: "#0F111A",
          padding: "36px 44px",
          fontFamily: 'monospace, "Courier New", sans-serif',
          border: "12px solid #E52521",
          boxSizing: "border-box",
          position: "relative",
        }}
      >
        {/* Inner Golden Border */}
        <div
          style={{
            position: "absolute",
            top: "8px",
            left: "8px",
            right: "8px",
            bottom: "8px",
            border: "4px solid #FBD000",
          }}
        />

        {/* Top Retro HUD */}
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            width: "100%",
            fontSize: "20px",
            fontWeight: "bold",
            letterSpacing: "2px",
            color: "#FFFFFF",
            borderBottom: "4px solid #242938",
            paddingBottom: "16px",
          }}
        >
          <div style={{ display: "flex", gap: "8px", color: "#FBD000" }}>
            <span>RADAR</span>
            <span style={{ color: "#FFFFFF" }}>099990</span>
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: "8px", color: "#FBD000" }}>
            <div
              style={{
                width: "18px",
                height: "18px",
                backgroundColor: "#FBD000",
                border: "2px solid #000000",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: "12px",
                color: "#000000",
                fontWeight: "bold",
              }}
            >
              $
            </div>
            <span>COINS x99</span>
          </div>

          <div style={{ display: "flex", gap: "8px" }}>
            <span style={{ color: "#5C94FC" }}>STAGE</span>
            <span>1-1</span>
          </div>

          <div style={{ display: "flex", gap: "8px", color: "#00A800" }}>
            <span>TIME</span>
            <span style={{ color: "#FFFFFF" }}>365</span>
          </div>
        </div>

        {/* Middle Main Content */}
        <div
          style={{
            display: "flex",
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "center",
            gap: "56px",
            padding: "20px 0",
          }}
        >
          {/* Pixel Question Block */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              width: "180px",
              height: "180px",
              backgroundColor: "#FBD000",
              border: "8px solid #000000",
              boxShadow: "10px 10px 0px #B84418, 14px 14px 0px #000000",
              position: "relative",
            }}
          >
            {/* 4 Corner Rivets */}
            <div
              style={{
                position: "absolute",
                top: "8px",
                left: "8px",
                width: "10px",
                height: "10px",
                backgroundColor: "#B84418",
              }}
            />
            <div
              style={{
                position: "absolute",
                top: "8px",
                right: "8px",
                width: "10px",
                height: "10px",
                backgroundColor: "#B84418",
              }}
            />
            <div
              style={{
                position: "absolute",
                bottom: "8px",
                left: "8px",
                width: "10px",
                height: "10px",
                backgroundColor: "#B84418",
              }}
            />
            <div
              style={{
                position: "absolute",
                bottom: "8px",
                right: "8px",
                width: "10px",
                height: "10px",
                backgroundColor: "#B84418",
              }}
            />

            {/* Pixel Question Mark */}
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                fontSize: "108px",
                fontWeight: "900",
                color: "#782E06",
                textShadow: "4px 4px 0px #FFFFFF",
                lineHeight: "1",
              }}
            >
              ?
            </div>
          </div>

          {/* Title & Info */}
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: "12px",
              maxWidth: "760px",
            }}
          >
            {/* Tag / Badge */}
            <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "8px",
                  backgroundColor: "#00A800",
                  color: "#FFFFFF",
                  padding: "4px 14px",
                  fontSize: "15px",
                  fontWeight: "900",
                  border: "2px solid #000000",
                  boxShadow: "3px 3px 0px #000000",
                }}
              >
                <div
                  style={{
                    width: "8px",
                    height: "8px",
                    backgroundColor: "#FFFFFF",
                  }}
                />
                <span>100% LIVE RETRO RADAR</span>
              </div>
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  backgroundColor: "#E52521",
                  color: "#FFFFFF",
                  padding: "4px 14px",
                  fontSize: "15px",
                  fontWeight: "900",
                  border: "2px solid #000000",
                  boxShadow: "3px 3px 0px #000000",
                }}
              >
                OPENAI CODEX
              </div>
            </div>

            {/* Main Title */}
            <div
              style={{
                display: "flex",
                fontSize: "62px",
                fontWeight: "900",
                color: "#FBD000",
                letterSpacing: "3px",
                textShadow: "6px 6px 0px #B84418, 9px 9px 0px #000000",
                lineHeight: "1.1",
              }}
            >
              WHENRESET 8-BIT
            </div>

            {/* Subtitle */}
            <div
              style={{
                display: "flex",
                fontSize: "30px",
                fontWeight: "800",
                color: "#FFFFFF",
                letterSpacing: "2px",
                textShadow: "3px 3px 0px #E52521",
              }}
            >
              CODEX QUOTA RADAR
            </div>

            {/* Features summary */}
            <div
              style={{
                display: "flex",
                gap: "14px",
                marginTop: "6px",
                fontSize: "15px",
                color: "#CBD5E1",
              }}
            >
              <div style={{ display: "flex", gap: "6px", color: "#FBD000" }}>
                <span>[+]</span>
                <span>26-WEEK HEATMAP</span>
              </div>
              <div style={{ display: "flex", gap: "6px", color: "#5C94FC" }}>
                <span>[+]</span>
                <span>COMMUNITY BETS</span>
              </div>
              <div style={{ display: "flex", gap: "6px", color: "#00A800" }}>
                <span>[+]</span>
                <span>1-UP COIN BLOCKS</span>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            width: "100%",
            backgroundColor: "#181B26",
            padding: "14px 20px",
            border: "3px solid #000000",
            boxShadow: "4px 4px 0px #000000",
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "8px",
              fontSize: "16px",
              color: "#00A800",
              fontWeight: "bold",
            }}
          >
            <div
              style={{
                width: "10px",
                height: "10px",
                backgroundColor: "#00A800",
                border: "1px solid #FFFFFF",
              }}
            />
            <span style={{ color: "#FFFFFF" }}>DOMAIN:</span>
            <span style={{ color: "#FBD000" }}>WHENRESET.TOP</span>
          </div>

          <div
            style={{
              display: "flex",
              fontSize: "14px",
              color: "#94A3B8",
              letterSpacing: "1px",
            }}
          >
            8-BIT RETRO PIXEL ARCADE TRACKER // ZERO SERVER DOWNTIME
          </div>
        </div>
      </div>
    ),
    {
      ...size,
    }
  );
}
