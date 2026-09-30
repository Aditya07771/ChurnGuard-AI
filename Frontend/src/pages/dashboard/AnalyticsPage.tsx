import { useState } from "react";
import {
  BarChart3,
  Calendar,
  CreditCard,
  Wifi,
  Users,
  ShieldAlert,
} from "lucide-react";
import { PageHeader } from "@/components/layout/PageHeader";
import { ChartShell } from "@/components/charts/ChartShell";
import {
  ChurnRateBar,
  GenericBarChart,
  RiskDistributionBars,
} from "@/components/charts/DomainCharts";
import { ChartSkeleton } from "@/components/feedback/LoadingSkeletons";

import {
  useChurnByContract,
  useChurnByTenure,
  useChurnByPaymentMethod,
  useChurnByInternetService,
  useChurnByService,
  useChargesDistribution,
  useChurnByDemographics,
  useTenureDistribution,
  useCustomerDistribution,
  useRiskDistribution,
} from "@/hooks/queries/useAnalytics";

export default function AnalyticsPage() {
  const [activeTab, setActiveTab] = useState<"contract" | "billing" | "services" | "demographics" | "risk">("contract");

  const contractQuery = useChurnByContract();
  const tenureQuery = useChurnByTenure();
  const tenureDistQuery = useTenureDistribution();
  const paymentQuery = useChurnByPaymentMethod();
  const chargesDistQuery = useChargesDistribution();
  const internetQuery = useChurnByInternetService();
  const serviceQuery = useChurnByService();
  const demoQuery = useChurnByDemographics();
  const customerDistQuery = useCustomerDistribution();
  const riskDistQuery = useRiskDistribution();

  return (
    <div className="space-y-6 max-w-6xl">
      <PageHeader
        title="Analytics Studio"
        description="Exploratory customer segmentation, contract commitments, service adoptions, and billing churn patterns"
        icon={BarChart3}
      />

      {/* Analytics Tabs */}
      <div className="flex items-center gap-2 border-b border-border pb-px overflow-x-auto">
        <button
          onClick={() => setActiveTab("contract")}
          className={`flex items-center gap-1.5 px-3 py-2 text-xs font-semibold border-b-2 transition-colors whitespace-nowrap ${
            activeTab === "contract"
              ? "border-primary text-primary"
              : "border-transparent text-muted-foreground hover:text-foreground"
          }`}
        >
          <Calendar className="h-3.5 w-3.5" /> Contracts & Longevity
        </button>
        <button
          onClick={() => setActiveTab("billing")}
          className={`flex items-center gap-1.5 px-3 py-2 text-xs font-semibold border-b-2 transition-colors whitespace-nowrap ${
            activeTab === "billing"
              ? "border-primary text-primary"
              : "border-transparent text-muted-foreground hover:text-foreground"
          }`}
        >
          <CreditCard className="h-3.5 w-3.5" /> Billing & Payment
        </button>
        <button
          onClick={() => setActiveTab("services")}
          className={`flex items-center gap-1.5 px-3 py-2 text-xs font-semibold border-b-2 transition-colors whitespace-nowrap ${
            activeTab === "services"
              ? "border-primary text-primary"
              : "border-transparent text-muted-foreground hover:text-foreground"
          }`}
        >
          <Wifi className="h-3.5 w-3.5" /> Telephony & Services
        </button>
        <button
          onClick={() => setActiveTab("demographics")}
          className={`flex items-center gap-1.5 px-3 py-2 text-xs font-semibold border-b-2 transition-colors whitespace-nowrap ${
            activeTab === "demographics"
              ? "border-primary text-primary"
              : "border-transparent text-muted-foreground hover:text-foreground"
          }`}
        >
          <Users className="h-3.5 w-3.5" /> Demographics
        </button>
        <button
          onClick={() => setActiveTab("risk")}
          className={`flex items-center gap-1.5 px-3 py-2 text-xs font-semibold border-b-2 transition-colors whitespace-nowrap ${
            activeTab === "risk"
              ? "border-primary text-primary"
              : "border-transparent text-muted-foreground hover:text-foreground"
          }`}
        >
          <ShieldAlert className="h-3.5 w-3.5" /> Risk Distribution
        </button>
      </div>

      {/* Tab 1: Contracts & Tenure */}
      {activeTab === "contract" && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 animate-in fade-in-50">
          <ChartShell
            title="Churn Rate by Contract Commitment"
            description="Comparing month-to-month volatility against annual and biennial retention"
            empty={!contractQuery.data?.data?.length}
          >
            {contractQuery.isLoading ? (
              <ChartSkeleton />
            ) : contractQuery.data ? (
              <ChurnRateBar chart={contractQuery.data} height={280} />
            ) : null}
          </ChartShell>

          <ChartShell
            title="Churn Rate by Tenure Group"
            description="Historical churn rates stratified across account tenure intervals"
            empty={!tenureQuery.data?.data?.length}
          >
            {tenureQuery.isLoading ? (
              <ChartSkeleton />
            ) : tenureQuery.data ? (
              <ChurnRateBar chart={tenureQuery.data} height={280} />
            ) : null}
          </ChartShell>

          <div className="lg:col-span-2">
            <ChartShell
              title="Customer Tenure Distribution (Population Volume)"
              description="Frequency histogram of customer counts across tenure bands"
              empty={!tenureDistQuery.data?.data?.length}
            >
              {tenureDistQuery.isLoading ? (
                <ChartSkeleton />
              ) : tenureDistQuery.data ? (
                <GenericBarChart chart={tenureDistQuery.data} height={260} />
              ) : null}
            </ChartShell>
          </div>
        </div>
      )}

      {/* Tab 2: Billing & Payment */}
      {activeTab === "billing" && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 animate-in fade-in-50">
          <ChartShell
            title="Churn by Payment Instrument"
            description="Retention variance across electronic check, mailed check, and automatic billing"
            empty={!paymentQuery.data?.data?.length}
          >
            {paymentQuery.isLoading ? (
              <ChartSkeleton />
            ) : paymentQuery.data ? (
              <ChurnRateBar chart={paymentQuery.data} height={280} />
            ) : null}
          </ChartShell>

          <ChartShell
            title="Monthly Charge Distribution Bands"
            description="Distribution of customer charges and churn concentrations across price tiers"
            empty={!chargesDistQuery.data?.data?.length}
          >
            {chargesDistQuery.isLoading ? (
              <ChartSkeleton />
            ) : chargesDistQuery.data ? (
              <GenericBarChart chart={chargesDistQuery.data} height={280} />
            ) : null}
          </ChartShell>
        </div>
      )}

      {/* Tab 3: Services */}
      {activeTab === "services" && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 animate-in fade-in-50">
          <ChartShell
            title="Churn by Internet Service Architecture"
            description="Fiber optic vs DSL vs No Internet service retention comparison"
            empty={!internetQuery.data?.data?.length}
          >
            {internetQuery.isLoading ? (
              <ChartSkeleton />
            ) : internetQuery.data ? (
              <ChurnRateBar chart={internetQuery.data} height={280} />
            ) : null}
          </ChartShell>

          <ChartShell
            title="Service Line Churn Rates"
            description="Attrition rates across add-on product bundles (Security, Backup, Streaming, Tech Support)"
            empty={!serviceQuery.data?.data?.length}
          >
            {serviceQuery.isLoading ? (
              <ChartSkeleton />
            ) : serviceQuery.data ? (
              <ChurnRateBar chart={serviceQuery.data} height={280} />
            ) : null}
          </ChartShell>
        </div>
      )}

      {/* Tab 4: Demographics */}
      {activeTab === "demographics" && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 animate-in fade-in-50">
          <ChartShell
            title="Subgroup Descriptive Churn Rates"
            description="Aggregated descriptive comparisons across Partner, Dependents, and Senior Citizen categories"
            empty={!demoQuery.data?.data?.length}
            note="Descriptive aggregate snapshot only. Demographic correlation does not imply causality."
          >
            {demoQuery.isLoading ? (
              <ChartSkeleton />
            ) : demoQuery.data ? (
              <ChurnRateBar chart={demoQuery.data} height={280} />
            ) : null}
          </ChartShell>

          <ChartShell
            title="Gender Distribution Breakdown"
            description="Overall population mix from customer-distribution endpoint"
            empty={!customerDistQuery.data?.charts?.gender?.data?.length}
          >
            {customerDistQuery.isLoading ? (
              <ChartSkeleton />
            ) : customerDistQuery.data?.charts?.gender ? (
              <GenericBarChart chart={customerDistQuery.data.charts.gender} height={280} />
            ) : null}
          </ChartShell>
        </div>
      )}

      {/* Tab 5: Risk Distribution */}
      {activeTab === "risk" && (
        <div className="animate-in fade-in-50 space-y-6">
          <ChartShell
            title="Eligible Active Customer Risk Classification"
            description="Breakdown of retained population scored into Low, Medium, and High risk categories"
            unavailable={riskDistQuery.data?.status === "unavailable"}
            unavailableReason={riskDistQuery.data?.reason}
            empty={!riskDistQuery.data?.data?.length}
          >
            {riskDistQuery.isLoading ? (
              <ChartSkeleton />
            ) : riskDistQuery.data?.data ? (
              <div className="py-4">
                <RiskDistributionBars data={riskDistQuery.data.data} />
              </div>
            ) : null}
          </ChartShell>
        </div>
      )}
    </div>
  );
}
