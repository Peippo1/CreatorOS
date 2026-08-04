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
        <div
          style={{
            background: "#ffffff",
            width: 20,
            height: 14,
            borderRadius: 5,
            display: "flex",
            position: "relative",
          }}
        />
      </div>
    ),
    { ...size },
  );
}
