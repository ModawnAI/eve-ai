import { ImageResponse } from "next/og";

export const runtime = "edge";

export const alt = "Eve AI - Intelligent Insurance Agency Automation";
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
          background: "#c96442",
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <div
          style={{
            fontSize: 120,
            fontWeight: 700,
            color: "#ffffff",
            letterSpacing: "-0.02em",
          }}
        >
          Eve AI
        </div>
      </div>
    ),
    {
      ...size,
    }
  );
}
