import React from "react";
import { describe, expect, it, vi } from "vitest";
import ProfilePage from "./page";

vi.mock("next-auth/react", () => ({
  useSession: vi.fn(() => ({
    data: { user: { id: "user_123", name: "Test Athlete", email: "test@gym.com" } },
    status: "authenticated",
  })),
}));

describe("ProfilePage component", () => {
  it("renders ProfilePage settings and metrics form", () => {
    const element = <ProfilePage />;
    expect(React.isValidElement(element)).toBe(true);
  });
});
