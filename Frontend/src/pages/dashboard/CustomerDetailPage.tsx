import { useParams, Link } from "react-router-dom";
import {
  ArrowLeft,
  User,
  ShieldAlert,
  CreditCard,
  Wifi,
  Calendar,
  AlertCircle,
} from "lucide-react";
import { PageHeader } from "@/components/layout/PageHeader";
import { RiskBadge } from "@/components/data-display/Badges";
import { ErrorState } from "@/components/feedback/ErrorState";
import { KpiCard } from "@/components/data-display/KpiCard";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";

import { useCustomer, useCustomerPrediction } from "@/hooks/queries/useCustomers";
import {
  formatPercent,
  formatCurrency,
  formatTenure,
} from "@/lib/utils";

export default function CustomerDetailPage() {
  const { customerId = "" } = useParams<{ customerId: string }>();

  const {
    data: customer,
    isLoading: customerLoading,
    error: customerError,
    refetch: refetchCustomer,
  } = useCustomer(customerId);

  const isEligibleForPrediction = customer?.Churn === "No";

  const {
    data: prediction,
  } = useCustomerPrediction(customerId, isEligibleForPrediction);

  if (customerLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-6 w-32" />
        <Skeleton className="h-10 w-64" />
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-28 rounded-xl" />
          ))}
        </div>
        <Skeleton className="h-96 rounded-xl" />
      </div>
    );
  }

  if (customerError || !customer) {
    return (
      <div className="py-12 space-y-4">
        <Button asChild variant="ghost" size="sm">
          <Link to="/dashboard/customers">
            <ArrowLeft className="h-4 w-4 mr-1" /> Back to Risk Explorer
          </Link>
        </Button>
        <ErrorState
          error={customerError}
          onRetry={() => void refetchCustomer()}
          title={`Customer ${customerId} Not Found`}
        />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Back button and Header */}
      <div>
        <Button asChild variant="ghost" size="sm" className="mb-2">
          <Link to="/dashboard/customers">
            <ArrowLeft className="h-4 w-4 mr-1" /> Back to Risk Explorer
          </Link>
        </Button>
        <PageHeader
          title={`Customer Profile: ${customer.customerID}`}
          description="Detailed account profile, contract terms, service configurations, and risk analysis"
          icon={User}
          actions={
            <div className="flex items-center gap-2">
              <Button asChild size="sm" variant="outline">
                <Link to="/dashboard/predict">Test with Similar Attributes</Link>
              </Button>
            </div>
          }
        />
      </div>

      {/* Target Churn vs Model Risk Notice */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Actual historical ground truth */}
        <KpiCard
          title="Historical Target Label"
          value={
            <span className={customer.Churn === "Yes" ? "text-rose-600 font-bold" : "text-green-600 font-bold"}>
              Churn = {customer.Churn}
            </span>
          }
          description="Ground truth outcome in snapshot"
          icon={Calendar}
          note="Historical Kaggle Telco label"
        />

        {/* Model Prediction / Active Risk */}
        <KpiCard
          title="Predicted Risk Band"
          value={
            customer.Churn === "Yes" ? (
              <span className="text-sm font-semibold text-muted-foreground">Historical Churner</span>
            ) : customer.risk_category ? (
              <RiskBadge category={customer.risk_category} />
            ) : prediction ? (
              <RiskBadge category={prediction.risk_category} />
            ) : (
              "—"
            )
          }
          description={
            customer.Churn === "Yes"
              ? "Not scored in active pool"
              : prediction?.churn_probability !== undefined
              ? `${formatPercent(prediction.churn_probability)} predicted probability`
              : customer.churn_probability !== undefined
              ? `${formatPercent(customer.churn_probability)} predicted probability`
              : "Inference result"
          }
          icon={ShieldAlert}
        />

        <KpiCard
          title="Monthly Recurring Charge"
          value={formatCurrency(customer.MonthlyCharges)}
          description={`Total: ${formatCurrency(customer.TotalCharges)}`}
          icon={CreditCard}
        />

        <KpiCard
          title="Account Tenure"
          value={formatTenure(customer.tenure)}
          description={`${customer.tenure} total months`}
          icon={User}
        />
      </div>

      {/* Historical Churner Ineligible State Warning */}
      {customer.Churn === "Yes" && (
        <div className="rounded-xl border border-amber-500/20 bg-amber-500/10 p-4 text-amber-900 dark:text-amber-200">
          <div className="flex items-start gap-3">
            <AlertCircle className="h-5 w-5 text-amber-600 shrink-0 mt-0.5" />
            <div>
              <h4 className="text-sm font-semibold">Excluded from Active Scoring Pipeline (409 Condition)</h4>
              <p className="text-xs mt-1 leading-relaxed text-amber-800/90 dark:text-amber-300">
                This customer had already churned at the time of the historical snapshot. The active retention scoring engine focuses exclusively on retained customers (<code className="font-mono">Churn = No</code>) who are currently at risk.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Attribute Groups */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Customer Demographics */}
        <div className="rounded-xl border border-border bg-card p-5 shadow-sm space-y-4">
          <div className="flex items-center gap-2 border-b border-border pb-3">
            <User className="h-4 w-4 text-primary" />
            <h3 className="text-sm font-semibold text-foreground">Demographics & Profile</h3>
          </div>
          <dl className="grid grid-cols-2 gap-3 text-xs">
            <div>
              <dt className="text-muted-foreground">Gender</dt>
              <dd className="font-medium text-foreground mt-0.5">{customer.gender}</dd>
            </div>
            <div>
              <dt className="text-muted-foreground">Senior Citizen</dt>
              <dd className="font-medium text-foreground mt-0.5">
                {customer.SeniorCitizen === 1 ? "Yes" : "No"}
              </dd>
            </div>
            <div>
              <dt className="text-muted-foreground">Partner</dt>
              <dd className="font-medium text-foreground mt-0.5">{customer.Partner}</dd>
            </div>
            <div>
              <dt className="text-muted-foreground">Dependents</dt>
              <dd className="font-medium text-foreground mt-0.5">{customer.Dependents}</dd>
            </div>
          </dl>
        </div>

        {/* Telephony & Internet Services */}
        <div className="rounded-xl border border-border bg-card p-5 shadow-sm space-y-4">
          <div className="flex items-center gap-2 border-b border-border pb-3">
            <Wifi className="h-4 w-4 text-primary" />
            <h3 className="text-sm font-semibold text-foreground">Subscribed Services</h3>
          </div>
          <dl className="grid grid-cols-2 gap-3 text-xs">
            <div>
              <dt className="text-muted-foreground">Phone Service</dt>
              <dd className="font-medium text-foreground mt-0.5">{customer.PhoneService}</dd>
            </div>
            <div>
              <dt className="text-muted-foreground">Multiple Lines</dt>
              <dd className="font-medium text-foreground mt-0.5">{customer.MultipleLines}</dd>
            </div>
            <div>
              <dt className="text-muted-foreground">Internet Service</dt>
              <dd className="font-medium text-foreground mt-0.5">{customer.InternetService}</dd>
            </div>
            <div>
              <dt className="text-muted-foreground">Online Security</dt>
              <dd className="font-medium text-foreground mt-0.5">{customer.OnlineSecurity}</dd>
            </div>
            <div>
              <dt className="text-muted-foreground">Online Backup</dt>
              <dd className="font-medium text-foreground mt-0.5">{customer.OnlineBackup}</dd>
            </div>
            <div>
              <dt className="text-muted-foreground">Device Protection</dt>
              <dd className="font-medium text-foreground mt-0.5">{customer.DeviceProtection}</dd>
            </div>
            <div>
              <dt className="text-muted-foreground">Tech Support</dt>
              <dd className="font-medium text-foreground mt-0.5">{customer.TechSupport}</dd>
            </div>
            <div>
              <dt className="text-muted-foreground">Streaming TV</dt>
              <dd className="font-medium text-foreground mt-0.5">{customer.StreamingTV}</dd>
            </div>
            <div>
              <dt className="text-muted-foreground">Streaming Movies</dt>
              <dd className="font-medium text-foreground mt-0.5">{customer.StreamingMovies}</dd>
            </div>
          </dl>
        </div>

        {/* Contract & Financial Terms */}
        <div className="rounded-xl border border-border bg-card p-5 shadow-sm space-y-4">
          <div className="flex items-center gap-2 border-b border-border pb-3">
            <CreditCard className="h-4 w-4 text-primary" />
            <h3 className="text-sm font-semibold text-foreground">Billing & Contract</h3>
          </div>
          <dl className="grid grid-cols-2 gap-3 text-xs">
            <div className="col-span-2">
              <dt className="text-muted-foreground">Contract Agreement</dt>
              <dd className="font-medium text-foreground mt-0.5 text-sm">{customer.Contract}</dd>
            </div>
            <div className="col-span-2">
              <dt className="text-muted-foreground">Payment Method</dt>
              <dd className="font-medium text-foreground mt-0.5">{customer.PaymentMethod}</dd>
            </div>
            <div>
              <dt className="text-muted-foreground">Paperless Billing</dt>
              <dd className="font-medium text-foreground mt-0.5">{customer.PaperlessBilling}</dd>
            </div>
            <div>
              <dt className="text-muted-foreground">Account Age</dt>
              <dd className="font-medium text-foreground mt-0.5">{formatTenure(customer.tenure)}</dd>
            </div>
            <div>
              <dt className="text-muted-foreground">Monthly Charges</dt>
              <dd className="font-medium text-foreground mt-0.5 font-semibold text-sm">
                {formatCurrency(customer.MonthlyCharges)}
              </dd>
            </div>
            <div>
              <dt className="text-muted-foreground">Total Invoiced</dt>
              <dd className="font-medium text-foreground mt-0.5">
                {formatCurrency(customer.TotalCharges)}
              </dd>
            </div>
          </dl>
        </div>
      </div>
    </div>
  );
}
