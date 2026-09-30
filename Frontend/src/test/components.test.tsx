import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { RiskBadge, PredictionBadge, StatusDot } from "@/components/data-display/Badges";
import { KpiCard } from "@/components/data-display/KpiCard";
import { EmptyState } from "@/components/feedback/EmptyState";
import { ErrorState } from "@/components/feedback/ErrorState";

describe("UI Display and Feedback Components", () => {
  it("renders RiskBadge with proper text and aria-label", () => {
    render(<RiskBadge category="High" />);
    const badge = screen.getByLabelText("Risk category: High");
    expect(badge).toBeInTheDocument();
    expect(badge).toHaveTextContent("High");
  });

  it("renders PredictionBadge distinguishing churn versus retain", () => {
    const { rerender } = render(<PredictionBadge predicted="Yes" />);
    expect(screen.getByText("Will Churn")).toBeInTheDocument();

    rerender(<PredictionBadge predicted="No" />);
    expect(screen.getByText("Will Retain")).toBeInTheDocument();
  });

  it("renders StatusDot indicator with correct label", () => {
    render(<StatusDot status="ok" label="Backend Online" />);
    expect(screen.getByText("Backend Online")).toBeInTheDocument();
  });

  it("renders KpiCard with title, value, description and note", () => {
    render(
      <KpiCard
        title="Historical Customers"
        value="7,043"
        description="Dataset rows"
        note="Static Kaggle snapshot"
      />
    );
    expect(screen.getByText("Historical Customers")).toBeInTheDocument();
    expect(screen.getByText("7,043")).toBeInTheDocument();
    expect(screen.getByText("Dataset rows")).toBeInTheDocument();
    expect(screen.getByText("Static Kaggle snapshot")).toBeInTheDocument();
  });

  it("renders EmptyState with title and description", () => {
    render(
      <EmptyState
        title="No records found"
        description="Try adjusting your filter options."
      />
    );
    expect(screen.getByText("No records found")).toBeInTheDocument();
    expect(screen.getByText("Try adjusting your filter options.")).toBeInTheDocument();
  });

  it("renders ErrorState with error message", () => {
    render(
      <ErrorState
        error={new Error("Failed to fetch customer")}
        title="Error Loading Record"
      />
    );
    expect(screen.getByText("Error Loading Record")).toBeInTheDocument();
    expect(screen.getByText("Failed to fetch customer")).toBeInTheDocument();
  });
});
