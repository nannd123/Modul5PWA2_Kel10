import { MessageCircle, Minus, Plus, ShoppingBag, Trash2 } from 'lucide-react'
import { useCart } from '../hooks/useCart'
import { buildWhatsAppLink } from '../utils/whatsapp'

const formatRupiah = (amount) =>
  new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(amount)

export default function CartPage({ onShopMerchandise }) {
  const { items, total, setQty, removeItem, clear } = useCart()
  const checkoutLink = buildWhatsAppLink(items, formatRupiah)

  return (
    <div className="cart-page">
      <section className="masthead">
        <h1 className="display">Your cart.</h1>
        <p className="lede">Your cart contains shop merchandise only.</p>
      </section>
      {items.length === 0 ? (
        <div className="state-box">
          <ShoppingBag size={30} />
          <p>Your cart is empty.</p>
          <button type="button" className="btn btn--primary" onClick={onShopMerchandise}>Browse merchandise</button>
        </div>
      ) : (
        <section className="cart-panel">
          <ul className="cart-list">
            {items.map((item) => (
              <li className="cart-item" key={item.id}>
                <div className={`cart-item-art merch-art--${item.icon}`} aria-hidden="true"><ShoppingBag size={25} /></div>
                <div className="cart-item-info">
                  <strong>{item.name}</strong>
                  <span>{formatRupiah(item.price)} each</span>
                </div>
                <div className="cart-quantity">
                  <button type="button" className="icon-btn" onClick={() => setQty(item.id, item.qty - 1)} aria-label={`Decrease ${item.name} quantity`}><Minus size={15} /></button>
                  <span>{item.qty}</span>
                  <button type="button" className="icon-btn" onClick={() => setQty(item.id, item.qty + 1)} aria-label={`Increase ${item.name} quantity`}><Plus size={15} /></button>
                </div>
                <strong className="cart-line-total">{formatRupiah(item.qty * item.price)}</strong>
                <button type="button" className="icon-btn cart-remove" onClick={() => removeItem(item.id)} aria-label={`Remove ${item.name}`}><Trash2 size={16} /></button>
              </li>
            ))}
          </ul>
          <div className="cart-summary">
            <button type="button" className="btn btn--outline btn--sm" onClick={clear}>Clear cart</button>
            <div className="cart-checkout">
              <div className="cart-total"><span>Total</span><strong>{formatRupiah(total)}</strong></div>
              {checkoutLink && (
                <a className="btn btn--primary" href={checkoutLink} target="_blank" rel="noopener noreferrer">
                  <MessageCircle size={17} /> Checkout via WhatsApp
                </a>
              )}
            </div>
          </div>
        </section>
      )}
    </div>
  )
}
