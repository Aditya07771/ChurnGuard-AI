import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import {
  Users,
  Search,
  X,
  ExternalLink,
} from "lucide-react";
import { PageHeader } from "@/components/layout/PageHeader";
import { Pagination } from "@/components/data-display/Pagination";
import { RiskBadge, PredictionBadge } from "@/components/data-display/Badges";
import { ErrorState } from "@/components/feedback/ErrorState";
import { TableSkeleton } from "@/components/feedback/LoadingSkeletons";
import { EmptyState } from "@/components/feedback/EmptyState";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

import { useCustomers } from "@/hooks/queries/useCustomers";
import type { CustomerFilters, RiskCategory } from "@/types/api";
import { formatPercent, formatCurrency, formatTenure } from "@/lib/utils";

export default function CustomersPage() {
  const [searchInput, setSearchInput] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [riskCategory, setRiskCategory] = useState<RiskCategory | "">("");
  const [contract, setContract] = useState("");
  const [sortBy, setSortBy] = useState("churn_probability");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");
  const [offset, setOffset] = useState(0);
  const limit = 20;

  // Debounce search
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchInput);
      setOffset(0);
    }, 400);
    return () => clearTimeout(timer);
  }, [searchInput]);

  const filters: CustomerFilters = {
    limit,
    offset,
    search: debouncedSearch || undefined,
    risk_category: riskCategory || undefined,
    contract: contract || undefined,
    sort_by: sortBy,
    sort_order: sortOrder,
  };

  const { data, isLoading, error, refetch } = useCustomers(filters);

  const handleFilterChange = () => {
    setOffset(0);
  };

  const clearAllFilters = () => {
    setSearchInput("");
    setDebouncedSearch("");
    setRiskCategory("");
    setContract("");
    setSortBy("churn_probability");
    setSortOrder("desc");
    setOffset(0);
  };

  const hasActiveFilters = Boolean(
    debouncedSearch || riskCategory || contract || sortBy !== "churn_probability" || sortOrder !== "desc"
  );

  return (
    <div className="space-y-6">
      <PageHeader
        title="Risk Explorer"
        description="Search, filter, and prioritize eligible historically retained customers by model-predicted churn risk"
        icon={Users}
      />

      {/* Kaggle dataset disclaimer notice */}
      <div className="rounded-lg bg-muted/50 border border-border px-4 py-2.5 text-xs text-muted-foreground">
        <p>
          <span className="font-semibold text-foreground">Data integrity notice:</span> Showing accounts with historical Churn = No from the static Kaggle Telco snapshot. Historical churners are excluded from default scoring.
        </p>
      </div>

      {/* Filter and Search Bar */}
      <div className="rounded-xl border border-border bg-card p-4 shadow-sm space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
          {/* Search */}
          <div className="relative lg:col-span-2">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              type="text"
              placeholder="Search by Customer ID..."
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              className="pl-9 text-sm"
            />
          </div>

          {/* Risk Band Select */}
          <div>
            <select
              value={riskCategory}
              onChange={(e) => {
                setRiskCategory(e.target.value as RiskCategory | "");
                handleFilterChange();
              }}
              className="w-full h-8 rounded-lg border border-input bg-background px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              <option value="">All Risk Bands</option>
              <option value="High">High Risk</option>
              <option value="Medium">Medium Risk</option>
              <option value="Low">Low Risk</option>
            </select>
          </div>

          {/* Contract Select */}
          <div>
            <select
              value={contract}
              onChange={(e) => {
                setContract(e.target.value);
                handleFilterChange();
              }}
              className="w-full h-8 rounded-lg border border-input bg-background px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              <option value="">All Contracts</option>
              <option value="Month-to-month">Month-to-month</option>
              <option value="One year">One year</option>
              <option value="Two year">Two year</option>
            </select>
          </div>

          {/* Sort By */}
          <div>
            <select
              value={`${sortBy}-${sortOrder}`}
              onChange={(e) => {
                const [sb, so] = e.target.value.split("-");
                setSortBy(sb);
                setSortOrder(so as "asc" | "desc");
                handleFilterChange();
              }}
              className="w-full h-8 rounded-lg border border-input bg-background px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              <option value="churn_probability-desc">Probability (High to Low)</option>
              <option value="churn_probability-asc">Probability (Low to High)</option>
              <option value="tenure-asc">Tenure (Shortest first)</option>
              <option value="tenure-desc">Tenure (Longest first)</option>
              <option value="MonthlyCharges-desc">Charges (Highest first)</option>
              <option value="MonthlyCharges-asc">Charges (Lowest first)</option>
              <option value="customerID-asc">Customer ID (A-Z)</option>
            </select>
          </div>
        </div>

        {/* Active filter chips */}
        {hasActiveFilters && (
          <div className="flex items-center justify-between border-t border-border pt-3 flex-wrap gap-2">
            <div className="flex items-center gap-2 flex-wrap text-xs">
              <span className="text-muted-foreground font-medium">Active filters:</span>
              {debouncedSearch && (
                <span className="inline-flex items-center gap-1 rounded bg-muted px-2 py-0.5">
                  ID: "{debouncedSearch}"
                </span>
              )}
              {riskCategory && (
                <span className="inline-flex items-center gap-1 rounded bg-muted px-2 py-0.5">
                  Risk: {riskCategory}
                </span>
              )}
              {contract && (
                <span className="inline-flex items-center gap-1 rounded bg-muted px-2 py-0.5">
                  Contract: {contract}
                </span>
              )}
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={clearAllFilters}
              className="h-7 text-xs text-muted-foreground hover:text-foreground gap-1"
            >
              <X className="h-3.5 w-3.5" /> Clear all
            </Button>
          </div>
        )}
      </div>

      {/* Data Table */}
      {isLoading ? (
        <TableSkeleton rows={limit} cols={8} />
      ) : error ? (
        <ErrorState
          error={error}
          onRetry={() => void refetch()}
          title="Failed to load customer records"
        />
      ) : !data?.data?.length ? (
        <EmptyState
          icon={Users}
          title={hasActiveFilters ? "No matching customers found" : "No customer records"}
          description={
            hasActiveFilters
              ? "Try adjusting your search criteria or clearing filters."
              : "No active eligible customers are available in the dataset."
          }
          action={
            hasActiveFilters ? (
              <Button variant="outline" size="sm" onClick={clearAllFilters}>
                Clear Filters
              </Button>
            ) : undefined
          }
        />
      ) : (
        <div className="space-y-4">
          <div className="rounded-xl border border-border bg-card shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="bg-muted/50 border-b border-border text-xs text-muted-foreground uppercase font-semibold">
                  <tr>
                    <th className="px-4 py-3">Customer ID</th>
                    <th className="px-4 py-3">Predicted Risk</th>
                    <th className="px-4 py-3">Probability</th>
                    <th className="px-4 py-3">Class</th>
                    <th className="px-4 py-3">Tenure</th>
                    <th className="px-4 py-3">Contract</th>
                    <th className="px-4 py-3">Monthly Charges</th>
                    <th className="px-4 py-3">Internet Service</th>
                    <th className="px-4 py-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {data.data.map((c) => (
                    <tr key={c.customerID} className="hover:bg-muted/30 transition-colors">
                      <td className="px-4 py-3 font-mono text-xs font-semibold">
                        <Link
                          to={`/dashboard/customers/${c.customerID}`}
                          className="hover:text-primary transition-colors hover:underline"
                        >
                          {c.customerID}
                        </Link>
                      </td>
                      <td className="px-4 py-3">
                        <RiskBadge category={c.risk_category} size="sm" />
                      </td>
                      <td className="px-4 py-3 font-semibold tabular-nums text-foreground">
                        {formatPercent(c.churn_probability)}
                      </td>
                      <td className="px-4 py-3">
                        <PredictionBadge predicted={c.prediction?.predicted_churn ?? (c.churn_probability !== undefined && c.churn_probability >= 0.5 ? "Yes" : "No")} />
                      </td>
                      <td className="px-4 py-3 text-xs text-muted-foreground">
                        {formatTenure(c.tenure)}
                      </td>
                      <td className="px-4 py-3 text-xs">{c.Contract}</td>
                      <td className="px-4 py-3 font-medium tabular-nums">
                        {formatCurrency(c.MonthlyCharges)}
                      </td>
                      <td className="px-4 py-3 text-xs text-muted-foreground">
                        {c.InternetService}
                      </td>
                      <td className="px-4 py-3 text-right">
                        <Button asChild variant="ghost" size="sm" className="h-7 px-2 text-xs">
                          <Link to={`/dashboard/customers/${c.customerID}`}>
                            Inspect <ExternalLink className="h-3 w-3 ml-1" />
                          </Link>
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Pagination Controls */}
          <Pagination
            total={data.pagination.total}
            limit={limit}
            offset={offset}
            onPageChange={(newOffset) => setOffset(newOffset)}
          />
        </div>
      )}
    </div>
  );
}
