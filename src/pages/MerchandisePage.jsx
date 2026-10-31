import { useState } from 'react'
import { Award, Check, Shirt, ShoppingBag, Tags } from 'lucide-react'
import MERCHANDISE from '../data/merchandise'
import { useCart } from '../hooks/useCart'

const ICONS = { shirt: Shirt, cap: Award, stickers: Tags }
const formatRupiah = (amount) =>
  new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(amount)

export default function MerchandisePage() {
  const { addItem, count } = useCart()
  const [addedId, setAddedId] = useState('')

  const handleAdd = (item) => {
    if (!addItem(item)) return
    setAddedId(item.id)
    window.setTimeout(() => setAddedId(''), 1500)
  }

  return (
    <div className="merch-page">
      <section className="masthead">
        <h1 className="display">Shop merchandise.</h1>
        <p className="lede">Browse shop-branded apparel and accessories. These items are separate from the product catalog.</p>
      </section>
      <div className="list-head">
        <h2>Merchandise</h2>
        <span className="count">{count} item{count !== 1 ? 's' : ''} in cart</span>
      </div>
      <ul className="merch-grid">
        {MERCHANDISE.map((item) => {
          const Icon = ICONS[item.icon] || ShoppingBag
          return (
            <li className="merch-card" key={item.id}>
              <div className={`merch-art merch-art--${item.icon}`} aria-hidden="true">
                <Icon size={56} strokeWidth={1.4} />
              </div>
              <div className="merch-card-body">
                <span className="merch-type">{item.type}</span>
                <h3>{item.name}</h3>
                <p>{item.description}</p>
                <strong className="merch-price">{formatRupiah(item.price)}</strong>
                <button type="button" className="btn btn--primary" onClick={() => handleAdd(item)}>
                  {addedId === item.id ? <><Check size={16} /> Added</> : <><ShoppingBag size={16} /> Add to cart</>}
                </button>
              </div>
            </li>
          )
        })}
      </ul>
    </div>
  )
}
