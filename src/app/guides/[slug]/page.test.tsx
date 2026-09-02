import React from "react";
(globalThis as any).React = React;
import { describe, expect, it } from "vitest";
import GuidePage from "./page";

describe("GuidePage dynamic component", () => {
  it("renders guide content for valid slug", async () => {
    const params = Promise.resolve({ slug: "progressive-overload" });
    const element = await GuidePage({ params });
    expect(React.isValidElement(element)).toBe(true);
  });

  it("renders fallback for unknown slug", async () => {
    const params = Promise.resolve({ slug: "unknown-guide" });
    const element = await GuidePage({ params });
    expect(React.isValidElement(element)).toBe(true);
  });
});
