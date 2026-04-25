import { Route, Routes } from "react-router-dom"
import Form from "./pages/Form"
import Login from "./pages/Login"
import Dashboard from "./pages/dashboard/Dashboard"
import { Toaster } from "sonner"
import ViewClient from "./pages/View"
import EditClient from "./pages/Edit"
import Success from "./pages/Success"
import { useEffect } from "react"
import BranchBreakDown from "./pages/dashboard/BranchBreakDown"
import { ClientsProvider } from "./context/ClientsContext"
import ManageUsers from "./pages/dashboard/hmanagement/users/ManageUsers"
import ViewUser from "./pages/dashboard/hmanagement/users/ViewUser"

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
      <ClientsProvider>
        <Routes>
          <Route
            index
            path="/"
            element={<Form />}
          />
          <Route
            path="/login"
            element={<Login />}
          />
          <Route
            path="/success"
            element={<Success />}
          />
          <Route
            path="/dashboard"
            element={<Dashboard />}
          />
          <Route
            path="/dashboard/branch/:branch"
            element={<BranchBreakDown />}
          />
          <Route
            path="/view-client/:id"
            element={<ViewClient />}
          />
          <Route
            path="/edit-client/:id"
            element={<EditClient />}
          />
          <Route
            path="/dashboard/manage/users"
            element={<ManageUsers />}
          />
          <Route
            path="/dashboard/manage/users/:id/view"
            element={<ViewUser />}
          />
        </Routes>
      </ClientsProvider>
    </>
  )
}

export default App
