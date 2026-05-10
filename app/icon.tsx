import { ImageResponse } from "next/og";

export const size = { width: 32, height: 32 };
export const contentType = "image/png";

export default function Icon() {
  return new ImageResponse(
    (
      <div
        style={{
          background: "#111111",
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          borderRadius: "20%",
        }}
      >
        <span
          style={{
            color: "#ffffff",
            fontSize: 20,
            fontWeight: 700,
            fontFamily: "sans-serif",
            lineHeight: 1,
          }}
        >
          C
        </span>
      </div>
    ),
    { ...size },
  );
}
