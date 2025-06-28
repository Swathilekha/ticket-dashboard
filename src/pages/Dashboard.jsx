import { NavLink, Outlet } from 'react-router-dom'
import { supabase } from '../supabase'

export default function Dashboard() {
  const handleLogout = async () => {
    await supabase.auth.signOut()
    window.location.href = '/'
  }

  return (
    <div className="d-flex flex-column vh-100">
      {/* Header */}
      <nav className="navbar navbar-expand-lg px-4 shadow" style={{ backgroundColor: '#002147' }}>
        <span className="navbar-brand text-white fw-bold">
          <i className="bi bi-ticket-perforated-fill me-2 text-warning"></i>
          Ticket Dashboard
        </span>
        <button className="btn btn-outline-warning ms-auto" onClick={handleLogout}>
          <i className="bi bi-box-arrow-right me-2"></i>Logout
        </button>
      </nav>

      <div className="d-flex flex-grow-1">
        {/* Sidebar */}
        <aside
          className="p-3 text-white flex-shrink-0"
          style={{
            width: '220px',
            backgroundColor: '#1e293b',
          }}
        >
          <h6 className="text-warning mb-3">Menu</h6>
          <div className="nav flex-column">
            {[
              { to: '', label: 'Dashboard', icon: 'bi-house' },
              { to: 'voice', label: 'Voice', icon: 'bi-mic' },
              { to: 'chat', label: 'Chat', icon: 'bi-chat-dots' },
              { to: 'list', label: 'View List', icon: 'bi-list-check' },
              { to: 'billing', label: 'Billing', icon: 'bi-bar-chart-fill' }, // 🔹 New Link
            ].map(({ to, label, icon }) => (
              <NavLink
                key={to}
                to={to}
                end={to === ''}
                className={({ isActive }) =>
                  `nav-link px-3 py-2 mb-1 rounded ${
                    isActive ? 'bg-warning text-dark fw-semibold' : 'text-white'
                  } sidebar-link`
                }
              >
                <i className={`bi ${icon} me-2`}></i> {label}
              </NavLink>
            ))}

            <a
              href="https://mail.google.com/mail/?view=cm&fs=1&to=illain050@gmail.com"
              target="_blank"
              rel="noopener noreferrer"
              className="nav-link px-3 py-2 text-white rounded sidebar-link"
            >
              <i className="bi bi-envelope-fill me-2"></i> Mail
            </a>
          </div>
        </aside>

        {/* Main Content */}
        <main className="flex-grow-1 p-4" style={{ backgroundColor: '#f8fafc' }}>
          <Outlet />
        </main>
      </div>

      {/* Sidebar hover effect */}
      <style>{`
        .sidebar-link:hover {
          background-color: rgba(250, 202, 21, 0.15);
          color: #facc15 !important;
        }
        .sidebar-link:hover i {
          color: #facc15;
        }
      `}</style>
    </div>
  )
}
