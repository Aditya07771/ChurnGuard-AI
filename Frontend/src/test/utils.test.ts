import { describe, it, expect } from "vitest";
import {
  formatPercent,
  formatCurrency,
  formatNumber,
  formatTenure,
  formatProbabilityDiff,
  getRiskClasses,
  formatFileSize,
} from "@/lib/utils";

describe("Formatting and utility functions", () => {
  it("formats probability from 0-1 to percentage correctly", () => {
    expect(formatPercent(0.456)).toBe("45.6%");
    expect(formatPercent(0)).toBe("0.0%");
    expect(formatPercent(1)).toBe("100.0%");
    expect(formatPercent(null)).toBe("—");
    expect(formatPercent(undefined)).toBe("—");
  });

  it("formats currency to USD correctly", () => {
    expect(formatCurrency(79.85)).toBe("$79.85");
    expect(formatCurrency(0)).toBe("$0.00");
    expect(formatCurrency(null)).toBe("—");
  });

  it("formats numbers with comma separators", () => {
    expect(formatNumber(7043)).toBe("7,043");
    expect(formatNumber(0)).toBe("0");
    expect(formatNumber(null)).toBe("—");
  });

  it("formats tenure into readable human labels", () => {
    expect(formatTenure(0)).toBe("< 1 mo");
    expect(formatTenure(1)).toBe("1 month");
    expect(formatTenure(6)).toBe("6 months");
    expect(formatTenure(12)).toBe("1 year");
    expect(formatTenure(24)).toBe("2 years");
    expect(formatTenure(25)).toBe("2y 1m");
    expect(formatTenure(null)).toBe("—");
  });

  it("formats probability difference with signed percentage points", () => {
    expect(formatProbabilityDiff(0.125)).toBe("+12.5pp");
    expect(formatProbabilityDiff(-0.082)).toBe("-8.2pp");
    expect(formatProbabilityDiff(0)).toBe("0.0pp");
    expect(formatProbabilityDiff(null)).toBe("—");
  });

  it("returns distinct semantic classes for risk categories", () => {
    const high = getRiskClasses("High");
    expect(high.badge).toBe("risk-high");
    expect(high.text).toContain("rose");

    const medium = getRiskClasses("Medium");
    expect(medium.badge).toBe("risk-medium");
    expect(medium.text).toContain("amber");

    const low = getRiskClasses("Low");
    expect(low.badge).toBe("risk-low");
    expect(low.text).toContain("green");
  });

  it("formats file sizes correctly", () => {
    expect(formatFileSize(500)).toBe("500 B");
    expect(formatFileSize(2048)).toBe("2.0 KB");
    expect(formatFileSize(5 * 1024 * 1024)).toBe("5.0 MB");
  });
});
