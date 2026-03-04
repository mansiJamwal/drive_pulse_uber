import { Routes, Route } from "react-router-dom"
import DriverDashboard from "./components/DriverDashboard"
import Landing from "./components/Landing"

function App() {

  return (

    <Routes>

      <Route path="/" element={<Landing />} />
      <Route path="/driver/:driverId" element={<DriverDashboard />} />

    </Routes>

  )

}

export default App