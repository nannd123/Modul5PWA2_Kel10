import { createPersistentStore } from '../utils/persistentStore'
import { useStore } from './useStore'
import { GUNS_BY_ID } from '../data/guns.js'

const STORAGE_KEY = 'bore_barrel_guns_cart_v1'

const isValidCart = (items) =>
  Array.isArray(items) &&
  items.every(
    (item) =>
      item &&
      GUNS_BY_ID.has(item.id) &&
      Number.isSafeInteger(item.qty) &&
      item.qty > 0,
  )

const store = createPersistentStore(STORAGE_KEY, [], { validate: isValidCart })

export function useCart() {
  const items = useStore(store)

  const addItem = (item) => {
    const gun = item && GUNS_BY_ID.get(item.id)
    if (!gun) return false

    store.set((current) => {
      const existing = current.find((cartItem) => cartItem.id === gun.id)
      if (existing) {
        return current.map((cartItem) =>
          cartItem.id === gun.id ? { ...cartItem, qty: cartItem.qty + 1 } : cartItem,
        )
      }
      return [...current, { id: gun.id, qty: 1 }]
    })
    return true
  }

  const setQty = (id, qty) => {
    if (!GUNS_BY_ID.has(id) || !Number.isSafeInteger(qty)) return
    store.set((current) =>
      qty < 1
        ? current.filter((item) => item.id !== id)
        : current.map((item) => (item.id === id ? { ...item, qty } : item)),
    )
  }

  const removeItem = (id) => {
    if (GUNS_BY_ID.has(id)) {
      store.set((current) => current.filter((item) => item.id !== id))
    }
  }

  const clear = () => store.set([])
  const cartItems = items.map((item) => ({ ...GUNS_BY_ID.get(item.id), qty: item.qty }))
  const count = cartItems.reduce((sum, item) => sum + item.qty, 0)
  const total = cartItems.reduce((sum, item) => sum + item.qty * item.price, 0)

  return { items: cartItems, count, total, addItem, setQty, removeItem, clear }
}
