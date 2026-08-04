import { ImageResponse } from "next/og";

export const size = { width: 180, height: 180 };
export const contentType = "image/png";

export default function AppleIcon() {
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
        <div
          style={{
            background: "#ffffff",
            width: 112,
            height: 78,
            borderRadius: 24,
            display: "flex",
            position: "relative",
          }}
        />
      </div>
    ),
    { ...size },
  );
}
