import React from "react";
import { describe, expect, it } from "vitest";
import { StatCard } from "./StatCard";

describe("StatCard component", () => {
  it("creates a valid React element with required props", () => {
    const MockIcon = () => <span data-testid="icon" />;
    const element = (
      <StatCard
        title="Total PRs"
        value={42}
        subtitle="Across all lifts"
        icon={MockIcon}
        trend="up"
        trendValue="+12%"
        color="violet"
      />
    );

    expect(React.isValidElement(element)).toBe(true);
    expect(element.props.title).toBe("Total PRs");
    expect(element.props.value).toBe(42);
    expect(element.props.color).toBe("violet");
  });
});
