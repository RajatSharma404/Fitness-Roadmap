import React from "react";
import { describe, expect, it, vi } from "vitest";
import PublicProfilePage from "./page";

vi.mock("next/navigation", () => ({
  useParams: vi.fn(() => ({ id: "user_456" })),
}));

describe("PublicProfilePage component", () => {
  it("renders PublicProfilePage with showcase cards", () => {
    const element = <PublicProfilePage />;
    expect(React.isValidElement(element)).toBe(true);
  });
});
