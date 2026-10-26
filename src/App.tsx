import { Route, Routes } from "react-router-dom";
import { useEffect } from "react";
import { Toaster } from "sonner";

import Login from "./pages/auth/Login";

import MainLayout from "./layout/MainLayout";
import ProtectedRoute from "./helpers/ProtectRoute";

import Form from "./pages/form/Form";
import EditClient from "./pages/form/Edit";
import Success from "./pages/form/Success";

import Dashboard from "./pages/dashboard/Dashboard";
import BranchBreakDown from "./pages/dashboard/BranchBreakDown";

import ManageEntries from "./pages/dashboard/entries/ManageEntries";
import UnassignedEntries from "./pages/dashboard/entries/UnassignedEntries";
import OfflineEntries from "./pages/dashboard/entries/OfflineEntries";
import OldRecords from "./pages/dashboard/entries/OldRecords";
import ViewFormEntry from "./pages/dashboard/entries/ViewFormEntry";

import CreateProperties from "./pages/dashboard/hmanagement/houses/CreateProperties";
import ManageProperties from "./pages/dashboard/hmanagement/houses/ManageProperties";
import ViewProperty from "./pages/dashboard/hmanagement/houses/ViewProperty";

import ManageUsers from "./pages/dashboard/hmanagement/users/ManageUsers";
import ViewUser from "./pages/dashboard/hmanagement/users/ViewUser";
import ManageApplicants from "./pages/dashboard/hmanagement/users/applicants/ManageApplicants";
import ViewApplicant from "./pages/dashboard/hmanagement/users/applicants/ViewApplicant";

import ManagePurchases from "./pages/dashboard/hmanagement/purchases/ManagePurchases";
import ViewPurchase from "./pages/dashboard/hmanagement/purchases/ViewPurchase";

import ManageSubscriptions from "./pages/dashboard/hmanagement/subscriptions/ManageSubscriptions";
import ManageFlaggedAccounts from "./pages/dashboard/hmanagement/flaggedAccounts/ManageFlaggedAccounts";

import ManageRefunds from "./pages/dashboard/hmanagement/refunds/ManageRefunds";
import ViewRefund from "./pages/dashboard/hmanagement/refunds/ViewRefund";

import Properties from "./pages/dashboard/properties/Properties";
import DocumentLibrary from "./pages/dashboard/documents/DocumentLibrary";

import Settings from "./pages/dashboard/Settings";
import DownloadedEntries from "./pages/dashboard/entries/DownloadedEntries";

function App() {
  useEffect(() => {
    const hasRefreshed = localStorage.getItem("hard_refresh_done");

    if (!hasRefreshed) {
      localStorage.setItem("hard_refresh_done", "yes");

      const currentUrl = window.location.href;
      const separator = currentUrl.includes("?") ? "&" : "?";

      window.location.replace(`${currentUrl}${separator}fresh=${Date.now()}`);
    }
  }, []);

  return (
    <>
      <Toaster />
      {/* <ClientsProvider> */}
      <Routes>
        <Route index path="/" element={<Form />} />
        <Route path="/login" element={<Login />} />
        <Route path="/success" element={<Success />} />

        <Route element={<ProtectedRoute />}>
          <Route path="/dashboard" element={<MainLayout />}>
            <Route path="overview" element={<Dashboard />} />

            <Route path="records" element={<ManageEntries />} />
            <Route path="records/view/:id" element={<ViewFormEntry endpointType="applications" />} />
            <Route path="old-records" element={<OldRecords />} />
            <Route path="old-records/view/:id" element={<ViewFormEntry endpointType="clients" />} />
            <Route path="records/edit/:id" element={<EditClient />} />
            <Route path="records/unassigned" element={<UnassignedEntries />} />
            <Route path="records/offline" element={<OfflineEntries />} />
            <Route path="records/downloaded" element={<DownloadedEntries />} />

            <Route path="properties" element={<Properties />} />
            <Route path="documents" element={<DocumentLibrary />} />

            <Route path="branch/:branch" element={<BranchBreakDown />} />

            {/* User Management */}
            <Route path="manage/users" element={<ManageUsers />} />
            <Route path="manage/users/:id/view" element={<ViewUser />} />
            <Route path="manage/applicants" element={<ManageApplicants />} />
            <Route
              path="manage/applicants/:id/view"
              element={<ViewApplicant />}
            />

            {/* Property Management */}
            <Route path="manage/properties" element={<ManageProperties />} />
            <Route
              path="manage/properties/create"
              element={<CreateProperties />}
            />
            <Route
              path="manage/properties/:id/edit"
              element={<CreateProperties />}
            />
            <Route
              path="manage/properties/:id/view"
              element={<ViewProperty />}
            />

            {/* Purchase/Application Management */}
            <Route path="manage/purchases" element={<ManagePurchases />} />
            <Route
              path="manage/purchases/:id/view"
              element={<ViewPurchase />}
            />
            <Route
              path="manage/subscriptions"
              element={<ManageSubscriptions />}
            />
            <Route
              path="manage/flagged-accounts"
              element={<ManageFlaggedAccounts />}
            />
            <Route path="manage/refunds" element={<ManageRefunds />} />
            <Route path="manage/refunds/:id/view" element={<ViewRefund />} />
            <Route path="settings" element={<Settings />} />
          </Route>
        </Route>
      </Routes>
      {/* </ClientsProvider> */}
    </>
  );
}

export default App;
