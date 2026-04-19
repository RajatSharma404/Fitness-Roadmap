import { ImageResponse } from "next/og";
import { NextRequest } from "next/server";
import { z } from "zod";

export const runtime = "edge";

const profileSchema = z.object({
  name: z.string().optional(),
  goal: z.string().optional(),
  nodesCompleted: z.number().optional(),
  achievements: z.array(z.unknown()).optional(),
  bestLifts: z.record(z.string(), z.number()).optional(),
});

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get("userId");

    // Fetch user data
    const userRes = await fetch(
      `${process.env.NEXT_PUBLIC_APP_URL}/api/profile/${userId}`,
      {
        headers: {
          Authorization: `Bearer ${process.env.JWT_SECRET}`,
        },
      },
    );

    const rawUser = userRes.ok ? await userRes.json() : null;
    const parsedUser = profileSchema.safeParse(rawUser);
    const user = parsedUser.success ? parsedUser.data : null;

    return new ImageResponse(
      <div
        style={{
          background: "#08080f",
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          padding: "60px",
          fontFamily: "system-ui, sans-serif",
        }}
      >
        {/* Header */}
        <div style={{ display: "flex", alignItems: "center", gap: "20px" }}>
          <div
            style={{
              width: "80px",
              height: "80px",
              borderRadius: "20px",
              background: "#7c3aed",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <svg width="40" height="40" viewBox="0 0 24 24" fill="white">
              <path d="M20.57 14.86L22 13.43 20.57 12 17 15.57 8.43 7 12 3.43 10.57 2 9.14 3.43 7.71 2 5.57 4.14 4.14 2.71 2.71 4.14l1.43 1.43L2 7.71l1.43 1.43L2 10.57 3.43 12 7 8.43 15.57 17 12 20.57 13.43 22l1.43-1.43L16.29 22l2.14-2.14 1.43 1.43 1.43-1.43-1.43-1.43L22 16.29z" />
            </svg>
          </div>
          <div>
            <div
              style={{
                fontSize: "48px",
                fontWeight: "bold",
                color: "#ffffff",
              }}
            >
              {user?.name || "Fitness Athlete"}
            </div>
            <div style={{ fontSize: "24px", color: "#a1a1aa" }}>
              {user?.goal || "Strength"} • Fitness Roadmap
            </div>
          </div>
        </div>

        {/* Stats */}
        <div
          style={{
            display: "flex",
            gap: "40px",
            marginTop: "60px",
          }}
        >
          {[
            {
              label: "Nodes Unlocked",
              value: user?.nodesCompleted?.toString() || "0",
              color: "#7c3aed",
            },
            {
              label: "Best Lift",
              value: user?.bestLifts
                ? Object.entries(user.bestLifts)
                    .sort((a, b) => b[1] - a[1])[0]?.[1]
                    .toFixed(0) + "kg"
                : "-",
              color: "#06b6d4",
            },
            {
              label: "Achievements",
              value: user?.achievements?.length?.toString() || "0",
              color: "#f59e0b",
            },
          ].map((stat) => (
            <div
              key={stat.label}
              style={{
                background: "#18181b",
                borderRadius: "16px",
                padding: "30px 40px",
                minWidth: "180px",
              }}
            >
              <div
                style={{
                  fontSize: "20px",
                  color: "#a1a1aa",
                  marginBottom: "8px",
                }}
              >
                {stat.label}
              </div>
              <div
                style={{
                  fontSize: "36px",
                  fontWeight: "bold",
                  color: stat.color,
                }}
              >
                {stat.value}
              </div>
            </div>
          ))}
        </div>

        {/* Footer */}
        <div
          style={{
            marginTop: "auto",
            display: "flex",
            alignItems: "center",
            gap: "12px",
          }}
        >
          <div
            style={{
              width: "8px",
              height: "8px",
              borderRadius: "50%",
              background: "#10b981",
            }}
          />
          <span style={{ fontSize: "20px", color: "#a1a1aa" }}>
            fitness-roadmap.app
          </span>
        </div>
      </div>,
      {
        width: 1200,
        height: 630,
      },
    );
  } catch (e) {
    console.error(e);
    return new Response("Failed to generate image", { status: 500 });
  }
}
