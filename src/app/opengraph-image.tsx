import { ImageResponse } from "next/og";

export const alt = "StudyBuddy — AI tutor from your lecture notes";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OpenGraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          padding: 64,
          background: "linear-gradient(145deg, #081614 0%, #0c2420 45%, #134e4a 100%)",
          color: "#e8f5f1",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 20 }}>
          <div
            style={{
              width: 72,
              height: 72,
              borderRadius: 18,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              background: "linear-gradient(135deg, #14b8a6 0%, #0f766e 100%)",
            }}
          >
            <div
              style={{
                display: "flex",
                position: "relative",
                width: 44,
                height: 36,
                alignItems: "flex-end",
                justifyContent: "center",
              }}
            >
              <div
                style={{
                  width: 18,
                  height: 28,
                  background: "#f0fdfa",
                  borderRadius: "6px 2px 4px 8px",
                  transform: "skewY(-6deg)",
                  marginRight: -2,
                }}
              />
              <div
                style={{
                  width: 18,
                  height: 28,
                  background: "#ccfbf1",
                  borderRadius: "2px 6px 8px 4px",
                  transform: "skewY(6deg)",
                  marginLeft: -2,
                }}
              />
              <div
                style={{
                  position: "absolute",
                  top: -2,
                  right: -2,
                  width: 14,
                  height: 14,
                  borderRadius: 999,
                  background: "#fef9c3",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <div
                  style={{
                    width: 6,
                    height: 6,
                    borderRadius: 999,
                    background: "#0f766e",
                  }}
                />
              </div>
            </div>
          </div>
          <div style={{ display: "flex", fontSize: 42, fontWeight: 700, letterSpacing: -1 }}>
            <span>Study</span>
            <span style={{ color: "#5eead4" }}>Buddy</span>
          </div>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 16, maxWidth: 900 }}>
          <div
            style={{
              fontSize: 56,
              fontWeight: 700,
              letterSpacing: -1.5,
              lineHeight: 1.15,
            }}
          >
            AI tutor from your lecture notes
          </div>
          <div style={{ fontSize: 28, color: "#9eb8b1", lineHeight: 1.4 }}>
            Upload materials. Chat grounded in your docs. Practice with notes and quizzes.
          </div>
        </div>
      </div>
    ),
    { ...size },
  );
}
