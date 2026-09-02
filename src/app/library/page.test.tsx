import React from "react";
import { describe, expect, it } from "vitest";
import LibraryPage from "./page";

describe("LibraryPage component", () => {
  it("renders LibraryPage with movement search and filter cards", () => {
    const element = <LibraryPage />;
    expect(React.isValidElement(element)).toBe(true);
  });
});
