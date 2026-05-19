import { FormEvent, useEffect, useState } from 'react'
import { api } from '../api/client'
import type { Product, ProductCreate } from '../types'

const emptyForm: ProductCreate = {
  name: '',
  description: '',
  price: 0,
  stockQuantity: 0,
}

export function ProductsPage() {
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [form, setForm] = useState<ProductCreate>(emptyForm)
  const [editingId, setEditingId] = useState<number | null>(null)
  const [showForm, setShowForm] = useState(false)

  async function load() {
    setLoading(true)
    setError('')
    try {
      const data = await api.get<Product[]>('/api/products')
      setProducts(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Yüklenemedi')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    load()
  }, [])

  function openCreate() {
    setEditingId(null)
    setForm(emptyForm)
    setShowForm(true)
  }

  function openEdit(p: Product) {
    setEditingId(p.id)
    setForm({
      name: p.name,
      description: p.description ?? '',
      price: p.price,
      stockQuantity: p.stockQuantity,
    })
    setShowForm(true)
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    setError('')

    const name = form.name.trim()
    if (!name) {
      setError('Ürün adı zorunludur.')
      return
    }
    if (!Number.isFinite(form.price) || form.price < 0) {
      setError('Geçerli bir fiyat girin.')
      return
    }
    if (!Number.isFinite(form.stockQuantity) || form.stockQuantity < 0) {
      setError('Geçerli bir stok miktarı girin.')
      return
    }

    const payload = {
      name,
      description: form.description?.trim() || null,
      price: form.price,
      stockQuantity: form.stockQuantity,
    }

    try {
      if (editingId) {
        await api.put(`/api/products/${editingId}`, payload)
      } else {
        await api.post('/api/products', payload)
      }
      setShowForm(false)
      await load()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Kayıt başarısız')
    }
  }

  async function handleDelete(id: number) {
    if (!confirm('Bu ürünü silmek istediğinize emin misiniz?')) return
    try {
      await api.delete(`/api/products/${id}`)
      await load()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Silinemedi')
    }
  }

  return (
    <div className="page">
      <header className="page-header row">
        <div>
          <h1>Ürünler</h1>
          <p>Ürün ekleme, düzenleme ve listeleme</p>
        </div>
        <button type="button" className="btn btn-primary" onClick={openCreate}>
          + Yeni ürün
        </button>
      </header>

      {error && <div className="alert alert-error">{error}</div>}

      {showForm && (
        <section className="card form-card">
          <h2>{editingId ? 'Ürünü düzenle' : 'Yeni ürün'}</h2>
          <form onSubmit={handleSubmit} className="form-grid">
            <label>
              Ad
              <input
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                required
              />
            </label>
            <label>
              Fiyat (₺)
              <input
                type="number"
                min={0}
                step="0.01"
                value={form.price}
                onChange={(e) => setForm({ ...form, price: Number(e.target.value) })}
                required
              />
            </label>
            <label>
              Stok
              <input
                type="number"
                min={0}
                value={form.stockQuantity}
                onChange={(e) =>
                  setForm({ ...form, stockQuantity: Number(e.target.value) })
                }
                required
              />
            </label>
            <label className="full">
              Açıklama
              <textarea
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
                rows={2}
              />
            </label>
            <div className="form-actions">
              <button type="button" className="btn btn-ghost" onClick={() => setShowForm(false)}>
                İptal
              </button>
              <button type="submit" className="btn btn-primary">
                Kaydet
              </button>
            </div>
          </form>
        </section>
      )}

      <section className="card">
        {loading ? (
          <p className="muted">Yükleniyor…</p>
        ) : (
          <table className="table">
            <thead>
              <tr>
                <th>Ad</th>
                <th>Fiyat</th>
                <th>Stok</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {products.map((p) => (
                <tr key={p.id}>
                  <td>
                    <strong>{p.name}</strong>
                    {p.description && <small className="block muted">{p.description}</small>}
                  </td>
                  <td>{p.price.toLocaleString('tr-TR', { style: 'currency', currency: 'TRY' })}</td>
                  <td>
                    <span className={p.stockQuantity < 10 ? 'text-warn' : ''}>{p.stockQuantity}</span>
                  </td>
                  <td className="actions">
                    <button type="button" className="btn btn-ghost btn-sm" onClick={() => openEdit(p)}>
                      Düzenle
                    </button>
                    <button
                      type="button"
                      className="btn btn-danger btn-sm"
                      onClick={() => handleDelete(p.id)}
                    >
                      Sil
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </section>
    </div>
  )
}
