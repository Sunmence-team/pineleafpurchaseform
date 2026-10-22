import { Route, Routes } from "react-router-dom";
import Form from "./pages/Form";

import { Toaster } from "sonner";
import EditClient from "./pages/Edit";
import Success from "./pages/Success";
import { useEffect } from "react";
import CreateProperties from "./pages/dashboard/hmanagement/houses/CreateProperties";
import ViewProperty from "./pages/dashboard/hmanagement/houses/ViewProperty";
import ManageProperties from "./pages/dashboard/hmanagement/houses/ManageProperties";
import ChangePassword from "./pages/ChangePassword";

import Login from "./pages/auth/Login";

import MainLayout from "./layout/MainLayout";
import ProtectedRoute from "./helpers/ProtectRoute";

import Dashboard from "./pages/dashboard/Dashboard";
import BranchBreakDown from "./pages/dashboard/BranchBreakDown";
import ViewClient from "./pages/View";
import ManageUsers from "./pages/dashboard/hmanagement/users/ManageUsers";
import ManageApplicants from "./pages/dashboard/hmanagement/users/applicants/ManageApplicants";
import ManagePurchases from "./pages/dashboard/hmanagement/purchases/ManagePurchases";
import ManageSubscriptions from "./pages/dashboard/hmanagement/subscriptions/ManageSubscriptions";
import ManageFlaggedAccounts from "./pages/dashboard/hmanagement/flaggedAccounts/ManageFlaggedAccounts";
import ManageRefunds from "./pages/dashboard/hmanagement/refunds/ManageRefunds";
import ViewApplicant from "./pages/dashboard/hmanagement/users/applicants/ViewApplicant";
import ViewRefund from "./pages/dashboard/hmanagement/refunds/ViewRefund";
import ViewPurchase from "./pages/dashboard/hmanagement/purchases/ViewPurchase";
import ViewUser from "./pages/dashboard/hmanagement/users/ViewUser";

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
          <Route path="/change-password" element={<ChangePassword />} />
          
          <Route element={<ProtectedRoute />}>
            <Route element={<MainLayout />}>
              <Route path="/dashboard/overview" element={<Dashboard />} />
              <Route
                path="/dashboard/branch/:branch"
                element={<BranchBreakDown />}
              />
              <Route path="/view-client/:id" element={<ViewClient />} />
              <Route path="/edit-client/:id" element={<EditClient />} />
              {/* User Management */}
              <Route path="/dashboard/manage/users" element={<ManageUsers />} />
              <Route
                path="/dashboard/manage/users/:id/view"
                element={<ViewUser />}
              />
              <Route
                path="/dashboard/manage/applicants"
                element={<ManageApplicants />}
              />
              <Route
                path="/dashboard/manage/applicants/:id/view"
                element={<ViewApplicant />}
              />

              {/* Property Management */}
              <Route
                path="/dashboard/manage/properties"
                element={<ManageProperties />}
              />
              <Route
                path="/dashboard/manage/properties/create"
                element={<CreateProperties />}
              />
              <Route
                path="/dashboard/manage/properties/:id/edit"
                element={<CreateProperties />}
              />
              <Route
                path="/dashboard/manage/properties/:id/view"
                element={<ViewProperty />}
              />

              {/* Purchase/Application Management */}
              <Route
                path="/dashboard/manage/purchases"
                element={<ManagePurchases />}
              />
              <Route
                path="/dashboard/manage/purchases/:id/view"
                element={<ViewPurchase />}
              />
              <Route
                path="/dashboard/manage/subscriptions"
                element={<ManageSubscriptions />}
              />
              <Route
                path="/dashboard/manage/flagged-accounts"
                element={<ManageFlaggedAccounts />}
              />
              <Route path="/dashboard/manage/refunds" element={<ManageRefunds />} />
              <Route
                path="/dashboard/manage/refunds/:id/view"
                element={<ViewRefund />}
              />
            </Route>
          </Route>
        </Routes>
      {/* </ClientsProvider> */}
    </>
  );
}

export default App;
