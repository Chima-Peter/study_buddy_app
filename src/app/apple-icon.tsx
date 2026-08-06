import { ImageResponse } from "next/og";

export const size = { width: 180, height: 180 };
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
          background: "linear-gradient(135deg, #14b8a6 0%, #0d9488 55%, #0f766e 100%)",
          borderRadius: 40,
        }}
      >
        <div
          style={{
            display: "flex",
            position: "relative",
            width: 120,
            height: 100,
            alignItems: "flex-end",
            justifyContent: "center",
          }}
        >
          {/* Left page */}
          <div
            style={{
              width: 48,
              height: 78,
              background: "rgba(240, 253, 250, 0.95)",
              borderRadius: "10px 4px 8px 14px",
              transform: "skewY(-6deg)",
              marginRight: -4,
            }}
          />
          {/* Right page */}
          <div
            style={{
              width: 48,
              height: 78,
              background: "rgba(204, 251, 241, 0.92)",
              borderRadius: "4px 10px 14px 8px",
              transform: "skewY(6deg)",
              marginLeft: -4,
            }}
          />
          {/* Buddy spark */}
          <div
            style={{
              position: "absolute",
              top: 0,
              right: 8,
              width: 28,
              height: 28,
              borderRadius: 999,
              background: "#fef9c3",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <div
              style={{
                width: 12,
                height: 12,
                borderRadius: 999,
                background: "#0f766e",
              }}
            />
          </div>
        </div>
      </div>
    ),
    { ...size },
  );
}
