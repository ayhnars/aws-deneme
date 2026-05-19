import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { api, API_PATHS } from '../api/client'
import type { Product, StockMovement } from '../types'
import { isMovementIn } from '../types'

export function DashboardPage() {
  const [products, setProducts] = useState<Product[]>([])
  const [movements, setMovements] = useState<StockMovement[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    Promise.all([
      api.get<Product[]>(API_PATHS.products),
      api.get<StockMovement[]>(API_PATHS.stockMovements),
    ])
      .then(([p, m]) => {
        setProducts(p)
        setMovements(m.slice(0, 5))
      })
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [])

  const totalStock = products.reduce((s, p) => s + p.stockQuantity, 0)
  const lowStock = products.filter((p) => p.stockQuantity < 10)

  if (loading) return <p className="muted">Yükleniyor…</p>

  return (
    <div className="page">
      <header className="page-header">
        <h1>Özet</h1>
        <p>Genel durum ve son hareketler</p>
      </header>

      <div className="stats-grid">
        <div className="stat-card">
          <span className="stat-label">Ürün sayısı</span>
          <strong className="stat-value">{products.length}</strong>
        </div>
        <div className="stat-card">
          <span className="stat-label">Toplam stok</span>
          <strong className="stat-value">{totalStock}</strong>
        </div>
        <div className="stat-card warn">
          <span className="stat-label">Düşük stok (&lt;10)</span>
          <strong className="stat-value">{lowStock.length}</strong>
        </div>
        <div className="stat-card">
          <span className="stat-label">Hareket kaydı</span>
          <strong className="stat-value">{movements.length}+</strong>
        </div>
      </div>

      <div className="grid-2">
        <section className="card">
          <div className="card-head">
            <h2>Son stok hareketleri</h2>
            <Link to="/stock" className="link">
              Tümü →
            </Link>
          </div>
          {movements.length === 0 ? (
            <p className="muted">Henüz hareket yok.</p>
          ) : (
            <table className="table">
              <thead>
                <tr>
                  <th>Ürün</th>
                  <th>Tip</th>
                  <th>Miktar</th>
                </tr>
              </thead>
              <tbody>
                {movements.map((m) => (
                  <tr key={m.id}>
                    <td>{m.productName}</td>
                    <td>
                      <span className={`badge ${isMovementIn(m.movementType) ? 'in' : 'out'}`}>
                        {isMovementIn(m.movementType) ? 'Giriş' : 'Çıkış'}
                      </span>
                    </td>
                    <td>{m.quantity}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </section>

        <section className="card">
          <div className="card-head">
            <h2>Düşük stoklu ürünler</h2>
            <Link to="/products" className="link">
              Ürünler →
            </Link>
          </div>
          {lowStock.length === 0 ? (
            <p className="muted">Tüm ürünler yeterli stokta.</p>
          ) : (
            <ul className="list">
              {lowStock.map((p) => (
                <li key={p.id}>
                  <span>{p.name}</span>
                  <strong>{p.stockQuantity} adet</strong>
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>
    </div>
  )
}
