import { Award, Shirt, ShoppingBag, Tags } from 'lucide-react'
import MERCHANDISE from '../data/merchandise'

const ICONS = { shirt: Shirt, cap: Award, stickers: Tags }
const formatRupiah = (amount) =>
  new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(amount)

export default function MerchandisePage() {
  return (
    <div className="merch-page">
      <section className="masthead">
        <h1 className="display">Shop merchandise.</h1>
        <p className="lede">Browse shop-branded apparel and accessories. These items are separate from the product catalog.</p>
      </section>
      <div className="list-head">
        <h2>Merchandise</h2>
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
              </div>
            </li>
          )
        })}
      </ul>
    </div>
  )
}
