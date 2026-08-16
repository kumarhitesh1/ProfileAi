import { Routes, Route } from 'react-router-dom'
import Home from './pages/Home'
import Login from './pages/Login'
import Register from './pages/Register'
import Profile from './pages/Profile'
import Dashboard from './pages/Dashboard'
import CreatePortfolio from './pages/CreatePortfolio'
import EditPortfolio from './pages/EditPortfolio'
import PublicPortfolio from './pages/PublicPortfolio'
import ProtectedRoute from './components/common/ProtectedRoute'

function App() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/view/:slug" element={<PublicPortfolio />} />
      
      {/* Protected Routes */}
      <Route element={<ProtectedRoute />}>
        <Route path="/profile" element={<Profile />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/portfolio/create" element={<CreatePortfolio />} />
        <Route path="/portfolio/:id/edit" element={<EditPortfolio />} />
      </Route>
    </Routes>
  )
}

export default App