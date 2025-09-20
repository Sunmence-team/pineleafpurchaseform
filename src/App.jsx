import { Route, Routes } from "react-router-dom"
import Form from "./pages/Form"
import Login from "./pages/Login"
import Dashboard from "./pages/Dashboard"
import { Toaster } from "sonner"
import ViewClient from "./pages/View"
import EditClient from "./pages/Edit"
import Success from "./pages/Success"

function App() {

  return (
    <>
      <Toaster />
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
          path="/view-client/:id"
          element={<ViewClient />}
        />
        <Route
          path="/edit-client/:id"
          element={<EditClient />}
        />
      </Routes>
    </>
  )
}

export default App
