import { FormEvent, useEffect, useState } from 'react'
import { api, API_PATHS } from '../api/client'
import type { Product, StockMovement, StockMovementCreate } from '../types'
import { isMovementIn, movementTypeToApi } from '../types'

export function StockPage() {
  const [movements, setMovements] = useState<StockMovement[]>([])
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [form, setForm] = useState<StockMovementCreate>({
    productId: 0,
    quantity: 1,
    movementType: 'In',
  })

  async function load() {
    setLoading(true)
    setError('')
    try {
      const [m, p] = await Promise.all([
        api.get<StockMovement[]>(API_PATHS.stockMovements),
        api.get<Product[]>(API_PATHS.products),
      ])
      setMovements(m)
      setProducts(p)
      if (p.length && !form.productId) setForm((f) => ({ ...f, productId: p[0].id }))
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Yüklenemedi')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    load()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    setError('')
    try {
      await api.post(API_PATHS.stockMovements, {
        productId: form.productId,
        quantity: form.quantity,
        movementType: movementTypeToApi(form.movementType),
      })
      setForm((f) => ({ ...f, quantity: 1 }))
      await load()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Hareket kaydedilemedi')
    }
  }

  return (
    <div className="page">
      <header className="page-header">
        <h1>Stok hareketleri</h1>
        <p>Stok giriş ve çıkış işlemleri</p>
      </header>

      {error && <div className="alert alert-error">{error}</div>}

      <section className="card form-card">
        <h2>Yeni hareket</h2>
        <form onSubmit={handleSubmit} className="form-grid stock-form">
          <label>
            Ürün
            <select
              value={form.productId}
              onChange={(e) => setForm({ ...form, productId: Number(e.target.value) })}
              required
            >
              {products.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name} (stok: {p.stockQuantity})
                </option>
              ))}
            </select>
          </label>
          <label>
            Hareket tipi
            <select
              value={form.movementType}
              onChange={(e) =>
                setForm({ ...form, movementType: e.target.value as 'In' | 'Out' })
              }
            >
              <option value="In">Giriş (In)</option>
              <option value="Out">Çıkış (Out)</option>
            </select>
          </label>
          <label>
            Miktar
            <input
              type="number"
              min={1}
              value={form.quantity}
              onChange={(e) => setForm({ ...form, quantity: Number(e.target.value) })}
              required
            />
          </label>
          <div className="form-actions align-end">
            <button type="submit" className="btn btn-primary">
              Kaydet
            </button>
          </div>
        </form>
      </section>

      <section className="card">
        <h2>Hareket geçmişi</h2>
        {loading ? (
          <p className="muted">Yükleniyor…</p>
        ) : movements.length === 0 ? (
          <p className="muted">Kayıt yok.</p>
        ) : (
          <table className="table">
            <thead>
              <tr>
                <th>Tarih</th>
                <th>Ürün</th>
                <th>Tip</th>
                <th>Miktar</th>
              </tr>
            </thead>
            <tbody>
              {movements.map((m) => (
                <tr key={m.id}>
                  <td>{new Date(m.createdAt).toLocaleString('tr-TR')}</td>
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
    </div>
  )
}
