import { ImageResponse } from "next/og";
import { company } from "@/lib/site-data";

export const runtime = "edge";
export const alt = company.name;
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          background: "#ffffff",
          color: "#123e2b",
          padding: 72,
          fontFamily: "Georgia",
        }}
      >
        <div style={{ fontSize: 80, lineHeight: 1, maxWidth: 850 }}>
          {company.name}
        </div>
        <div style={{ marginTop: 28, fontSize: 34, color: "#52645a" }}>
          Flores frescas, buquês e presentes em Piracicaba
        </div>
      </div>
    ),
    size,
  );
}
