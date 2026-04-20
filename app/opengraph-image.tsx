import { ImageResponse } from "next/og";

export const runtime = "edge";
export const alt = "Discord Community Analytics";
export const size = {
  width: 1200,
  height: 630
};

export default async function OpenGraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          background: "#0d1117",
          padding: "56px",
          color: "#e6edf3"
        }}
      >
        <div style={{ fontSize: 26, color: "#67e8f9" }}>Discord Community Analytics</div>
        <div style={{ fontSize: 72, lineHeight: 1.1, maxWidth: "980px", fontWeight: 700 }}>
          Know who drives engagement and predict churn before it happens
        </div>
        <div style={{ fontSize: 28, color: "#94a3b8" }}>
          Top contributors • Message trends • Churn risk • Hot topics
        </div>
      </div>
    ),
    {
      ...size
    }
  );
}
