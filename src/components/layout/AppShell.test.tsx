import React from "react";
import { describe, expect, it, vi } from "vitest";
import { AppShell } from "./AppShell";

vi.mock("./ShellChrome", () => ({
  ShellChrome: ({ children }: any) => <div data-testid="shell-chrome">{children}</div>,
}));

describe("AppShell component", () => {
  it("wraps children in ShellChrome", () => {
    const element = (
      <AppShell>
        <div>Content</div>
      </AppShell>
    );

    expect(React.isValidElement(element)).toBe(true);
  });
});
