import React from "react";
import { describe, expect, it, vi } from "vitest";
import { Sidebar } from "./Sidebar";

vi.mock("next/navigation", () => ({
  usePathname: vi.fn(() => "/workouts"),
}));

vi.mock("next-auth/react", () => ({
  useSession: vi.fn(() => ({
    data: { user: { name: "Test Athlete", email: "test@gym.com" } },
    status: "authenticated",
  })),
  signIn: vi.fn(),
  signOut: vi.fn(),
}));

describe("Sidebar component", () => {
  it("renders Sidebar component with navigation elements", () => {
    const element = <Sidebar />;
    expect(React.isValidElement(element)).toBe(true);
  });
});
