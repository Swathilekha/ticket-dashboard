import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Login from './pages/Login'
import Dashboard from './pages/Dashboard'
import Voice from './pages/Voice'
import Chat from './pages/Chat'
import List from './pages/List' // ✅ Import List page
import DashboardHome from './pages/DashboardHome' // Adjust the path as needed
import Billing from './pages/Billing'

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Public Route */}
        <Route path="/" element={<Login />} />

        {/* Protected Routes inside Dashboard */}
        <Route path="/dashboard" element={<Dashboard />}>
           <Route index element={<DashboardHome />} />
          <Route path="voice" element={<Voice />} />
          <Route path="chat" element={<Chat />} />
          <Route path="list" element={<List />} /> {/* ✅ Added List route */}
          <Route path="billing" element={<Billing />} />
        </Route>
      </Routes>
    </BrowserRouter>
  )
}

export default App
