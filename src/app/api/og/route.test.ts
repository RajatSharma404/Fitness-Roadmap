import { describe, expect, it } from "vitest";
import { GET, runtime } from "./route";

describe("og route export", () => {
  it("exports GET handler and edge runtime", () => {
    expect(GET).toBeDefined();
    expect(runtime).toBe("edge");
  });
});
