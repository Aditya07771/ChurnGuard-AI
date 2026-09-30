import { describe, it, expect } from "vitest";
import { resolveDownloadUrl, ApiError, API_BASE } from "@/api/client";

describe("API Client and URL helpers", () => {
  it("resolves relative download paths against API origin", () => {
    const origin = new URL(API_BASE).origin;
    const relative = "/api/v1/predictions/batch/123/download";
    const resolved = resolveDownloadUrl(relative);
    expect(resolved).toBe(`${origin}${relative}`);
  });

  it("preserves absolute download URLs unchanged", () => {
    const absolute = "https://storage.example.com/exports/123.csv";
    expect(resolveDownloadUrl(absolute)).toBe(absolute);
  });

  it("creates ApiError instances with status codes and structured details", () => {
    const err = new ApiError({
      message: "Model unavailable",
      status: 503,
      code: "MODEL_UNAVAILABLE",
      details: { reason: "Missing model.pkl" },
    });
    expect(err.name).toBe("ApiError");
    expect(err.message).toBe("Model unavailable");
    expect(err.status).toBe(503);
    expect(err.code).toBe("MODEL_UNAVAILABLE");
    expect(err.details).toEqual({ reason: "Missing model.pkl" });
  });

  it("handles field-level validation errors on ApiError", () => {
    const err = new ApiError({
      message: "Validation failed",
      status: 422,
      fieldErrors: { MonthlyCharges: ["Field required"] },
    });
    expect(err.status).toBe(422);
    expect(err.fieldErrors?.MonthlyCharges).toContain("Field required");
  });
});
