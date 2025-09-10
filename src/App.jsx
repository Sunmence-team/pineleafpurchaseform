import { Route, Routes } from "react-router-dom"
import Form from "./pages/Form"
import Login from "./pages/Login"
import Dashboard from "./pages/Dashboard"
import { Toaster } from "sonner"

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
          path="/dashboard"
          element={<Dashboard />}
        />
      </Routes>
    </>
  )
}

export default App
