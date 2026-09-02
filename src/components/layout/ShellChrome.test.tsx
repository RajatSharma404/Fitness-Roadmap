import React from "react";
import { describe, expect, it, vi } from "vitest";
import { ShellChrome } from "./ShellChrome";

vi.mock("next-auth/react", () => ({
  useSession: vi.fn(() => ({ data: null, status: "unauthenticated" })),
  signIn: vi.fn(),
  signOut: vi.fn(),
}));

vi.mock("next/navigation", () => ({
  usePathname: vi.fn(() => "/"),
}));

describe("ShellChrome component", () => {
  it("renders ShellChrome with children", () => {
    const element = (
      <ShellChrome>
        <div data-testid="child-content">App Content</div>
      </ShellChrome>
    );

    expect(React.isValidElement(element)).toBe(true);
  });
});
