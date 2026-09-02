import React from "react";
import { describe, expect, it } from "vitest";
import {
  DetailPanelSkeleton,
  ExerciseCardSkeleton,
  LibraryGridSkeleton,
  Skeleton,
} from "./Skeleton";

describe("Skeleton components", () => {
  it("renders Skeleton primitives correctly", () => {
    expect(React.isValidElement(<Skeleton className="w-20 h-4" />)).toBe(true);
    expect(React.isValidElement(<ExerciseCardSkeleton />)).toBe(true);
    expect(React.isValidElement(<LibraryGridSkeleton count={4} />)).toBe(true);
    expect(React.isValidElement(<DetailPanelSkeleton />)).toBe(true);
  });
});
