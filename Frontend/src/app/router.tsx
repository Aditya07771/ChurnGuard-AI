import { createBrowserRouter, Navigate } from "react-router-dom";
import LandingPage from "@/pages/LandingPage";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import OverviewPage from "@/pages/dashboard/OverviewPage";
import CustomersPage from "@/pages/dashboard/CustomersPage";
import CustomerDetailPage from "@/pages/dashboard/CustomerDetailPage";
import PredictPage from "@/pages/dashboard/PredictPage";
import ScenariosPage from "@/pages/dashboard/ScenariosPage";
import BatchPage from "@/pages/dashboard/BatchPage";
import AnalyticsPage from "@/pages/dashboard/AnalyticsPage";
import ModelLabPage from "@/pages/dashboard/ModelLabPage";
import DatasetPage from "@/pages/dashboard/DatasetPage";
import HistoryPage from "@/pages/dashboard/HistoryPage";
import SystemPage from "@/pages/dashboard/SystemPage";
import NotFoundPage from "@/pages/NotFoundPage";

export const router = createBrowserRouter([
  {
    path: "/",
    element: <LandingPage />,
  },
  {
    path: "/dashboard",
    element: <DashboardLayout />,
    children: [
      {
        index: true,
        element: <Navigate to="/dashboard/overview" replace />,
      },
      {
        path: "overview",
        element: <OverviewPage />,
      },
      {
        path: "customers",
        element: <CustomersPage />,
      },
      {
        path: "customers/:customerId",
        element: <CustomerDetailPage />,
      },
      {
        path: "predict",
        element: <PredictPage />,
      },
      {
        path: "scenarios",
        element: <ScenariosPage />,
      },
      {
        path: "batch",
        element: <BatchPage />,
      },
      {
        path: "analytics",
        element: <AnalyticsPage />,
      },
      {
        path: "model-lab",
        element: <ModelLabPage />,
      },
      {
        path: "dataset",
        element: <DatasetPage />,
      },
      {
        path: "history",
        element: <HistoryPage />,
      },
      {
        path: "system",
        element: <SystemPage />,
      },
    ],
  },
  {
    path: "*",
    element: <NotFoundPage />,
  },
]);
