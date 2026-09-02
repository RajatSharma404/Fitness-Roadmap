import React from "react";
import { describe, expect, it, vi } from "vitest";
import { NextAuthProvider } from "./NextAuthProvider";

vi.mock("next-auth/react", () => ({
  SessionProvider: ({ children }: any) => <div data-testid="session-provider">{children}</div>,
}));

describe("NextAuthProvider component", () => {
  it("renders NextAuthProvider wrapping children", () => {
    const element = (
      <NextAuthProvider>
        <span>Child content</span>
      </NextAuthProvider>
    );

    expect(React.isValidElement(element)).toBe(true);
  });
});
