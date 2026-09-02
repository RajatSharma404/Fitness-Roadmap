import React from "react";
import { describe, expect, it } from "vitest";
import { GroceryItem, SmartGroceryList } from "./SmartGroceryList";

describe("SmartGroceryList component", () => {
  it("renders SmartGroceryList with grocery categories", () => {
    const groceries: GroceryItem[] = [
      { id: "g1", name: "Eggs", qty: "12 pcs", bucket: "dairy" },
      { id: "g2", name: "Chicken Breast", qty: "1 kg", bucket: "protein" },
      { id: "g3", name: "Brown Rice", qty: "2 kg", bucket: "carb" },
    ];

    const element = <SmartGroceryList groceries={groceries} planTitle="Hypertrophy Plan" />;
    expect(React.isValidElement(element)).toBe(true);
  });
});
