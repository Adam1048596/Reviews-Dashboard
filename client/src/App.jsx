import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Dashboard from './pages/Dashboard'
import ReviewDisplay from './pages/PropertyReviews';

function App() {

  return (
    <Router>
      <Routes>
        {/* Dashboard Route */}
        <Route path="/" element={<Dashboard />} />

        {/* Review Display Route */}
        <Route path="/reviews" element={<ReviewDisplay />} />
      </Routes>
    </Router>
  )
}

export default App