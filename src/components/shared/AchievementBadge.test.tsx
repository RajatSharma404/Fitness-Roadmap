import React from "react";
import { describe, expect, it } from "vitest";
import { AchievementBadge } from "./AchievementBadge";

describe("AchievementBadge component", () => {
  it("renders AchievementBadge element with label and icon", () => {
    const element = (
      <AchievementBadge
        type="first_pr"
        label="First PR"
        earnedAt={new Date()}
        size="md"
      />
    );

    expect(React.isValidElement(element)).toBe(true);
    expect(element.props.label).toBe("First PR");
  });
});
