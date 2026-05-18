import { NavLink, Outlet } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

export function Layout() {
  const { user, logout } = useAuth()

  return (
    <div className="app-shell">
      <aside className="sidebar">
        <div className="brand">
          <span className="brand-mark">M</span>
          <div>
            <strong>MiniERP</strong>
            <small>Stok & Ürün</small>
          </div>
        </div>

        <nav className="nav">
          <NavLink to="/" end className={({ isActive }) => (isActive ? 'active' : '')}>
            Özet
          </NavLink>
          <NavLink to="/products" className={({ isActive }) => (isActive ? 'active' : '')}>
            Ürünler
          </NavLink>
          <NavLink to="/stock" className={({ isActive }) => (isActive ? 'active' : '')}>
            Stok Hareketleri
          </NavLink>
        </nav>

        <div className="sidebar-footer">
          <div className="user-chip">
            <span className="avatar">{user?.fullName?.charAt(0) ?? '?'}</span>
            <div>
              <strong>{user?.fullName}</strong>
              <small>{user?.role}</small>
            </div>
          </div>
          <button type="button" className="btn btn-ghost btn-sm" onClick={logout}>
            Çıkış
          </button>
        </div>
      </aside>

      <main className="main">
        <Outlet />
      </main>
    </div>
  )
}
