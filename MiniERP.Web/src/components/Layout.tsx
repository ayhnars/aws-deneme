import { useEffect, useState } from 'react'
import { NavLink, Outlet, useLocation } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

export function Layout() {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const { user, logout } = useAuth()
  const location = useLocation()

  useEffect(() => {
    setSidebarOpen(false)
  }, [location.pathname])

  return (
    <div className={`app-shell${sidebarOpen ? ' sidebar-open' : ''}`}>
      <button
        type="button"
        className="sidebar-backdrop"
        aria-label="Menüyü kapat"
        tabIndex={sidebarOpen ? 0 : -1}
        onClick={() => setSidebarOpen(false)}
      />

      <aside className="sidebar">
        <div className="sidebar-head">
          <div className="brand">
            <span className="brand-mark">M</span>
            <div>
              <strong>MiniERP</strong>
              <small>Stok & Ürün</small>
            </div>
          </div>
          <button
            type="button"
            className="btn btn-ghost btn-sm sidebar-close"
            aria-label="Menüyü kapat"
            onClick={() => setSidebarOpen(false)}
          >
            ✕
          </button>
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

      <div className="main-wrap">
        <header className="topbar">
          <button
            type="button"
            className="btn btn-ghost sidebar-toggle"
            aria-label={sidebarOpen ? 'Menüyü kapat' : 'Menüyü aç'}
            aria-expanded={sidebarOpen}
            onClick={() => setSidebarOpen((open) => !open)}
          >
            <span className="sidebar-toggle-icon" aria-hidden />
          </button>
          <span className="topbar-title">MiniERP</span>
        </header>

        <main className="main">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
