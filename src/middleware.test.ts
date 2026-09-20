import { describe, expect, it } from "vitest";
import { middleware } from "./middleware";

describe("middleware security headers", () => {
  it("injects expected security headers on responses", () => {
    const response = middleware();
    expect(response.headers.get("X-Frame-Options")).toBe("DENY");
    expect(response.headers.get("X-Content-Type-Options")).toBe("nosniff");
    expect(response.headers.get("Referrer-Policy")).toBe("strict-origin-when-cross-origin");
    expect(response.headers.get("Permissions-Policy")).toContain("camera=()");
  });
});
