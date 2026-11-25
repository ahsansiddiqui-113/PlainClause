import { ImageResponse } from "next/og";

export const alt = "PlainClause: contract fine print in plain English";
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
          justifyContent: "center",
          padding: 80,
          background: "#0a0a0a",
          color: "#fafafa",
        }}
      >
        <div style={{ fontSize: 40, opacity: 0.7 }}>PlainClause</div>
        <div style={{ fontSize: 84, fontWeight: 700, lineHeight: 1.1, marginTop: 24 }}>
          Understand the fine print before you sign it
        </div>
      </div>
    ),
    size,
  );
}
