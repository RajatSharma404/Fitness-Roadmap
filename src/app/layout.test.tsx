import React from "react";
(globalThis as any).React = React;
import { describe, expect, it, vi } from "vitest";
import RootLayout, { metadata } from "./layout";

vi.mock("next/font/google", () => ({
  Syne: () => ({ variable: "font-display" }),
  DM_Sans: () => ({ variable: "font-body" }),
  JetBrains_Mono: () => ({ variable: "font-mono" }),
}));

vi.mock("@/components/layout/AppShell", () => ({
  AppShell: ({ children }: any) => <div data-testid="app-shell">{children}</div>,
}));

vi.mock("@/components/providers/NextAuthProvider", () => ({
  NextAuthProvider: ({ children }: any) => <div data-testid="auth-provider">{children}</div>,
}));

describe("RootLayout component & metadata", () => {
  it("defines metadata properly", () => {
    expect(metadata.title).toContain("FitFlow");
    expect(metadata.description).toBeDefined();
  });

  it("renders RootLayout with child content", () => {
    const element = RootLayout({
      children: <div data-testid="page-content">Hello FitFlow</div>,
    });
    expect(React.isValidElement(element)).toBe(true);
  });
});
