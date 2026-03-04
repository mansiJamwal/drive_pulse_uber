import { Routes, Route } from "react-router-dom"
import DriverDashboard from "./components/DriverDashboard"

function App() {

  return (

    <Routes>

      <Route
        path="/driver/:driverId"
        element={<DriverDashboard />}
      />

    </Routes>

  )

}

export default App