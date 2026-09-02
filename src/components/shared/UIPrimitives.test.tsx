import React from "react";
import { describe, expect, it, vi } from "vitest";
import {
  ActionButton,
  Card,
  MetricTile,
  SectionHeader,
  TodayStackPanel,
} from "./UIPrimitives";

describe("UIPrimitives components", () => {
  it("renders Card, SectionHeader, MetricTile, ActionButton, and TodayStackPanel", () => {
    expect(
      React.isValidElement(
        <Card level="elevated">
          <span>Card Content</span>
        </Card>
      )
    ).toBe(true);

    expect(
      React.isValidElement(
        <SectionHeader kicker="Kicker" title="Title" description="Description" />
      )
    ).toBe(true);

    expect(
      React.isValidElement(
        <MetricTile label="Total Reps" value="150" note="This week" intent="progress" />
      )
    ).toBe(true);

    expect(
      React.isValidElement(
        <ActionButton variant="primary" onClick={vi.fn()}>
          Click Me
        </ActionButton>
      )
    ).toBe(true);

    expect(
      React.isValidElement(
        <TodayStackPanel
          items={[
            { id: "1", title: "Warmup", detail: "5 min stretch", state: "done" },
            { id: "2", title: "Squats", detail: "4x8 reps", state: "in_progress" },
          ]}
          onStateChange={vi.fn()}
        />
      )
    ).toBe(true);
  });
});
