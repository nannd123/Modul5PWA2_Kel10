import { MERCHANDISE_BY_ID } from '../data/merchandise.js'

export const WHATSAPP_NUMBER = '6289606444700'

export const buildWhatsAppLink = (items, formatPrice) => {
  const orderItems = items.filter(
    (item) =>
      MERCHANDISE_BY_ID.has(item.id) &&
      Number.isSafeInteger(item.qty) &&
      item.qty > 0,
  )

  if (orderItems.length === 0) return null

  const lines = orderItems.map((item, index) => {
    const merchandise = MERCHANDISE_BY_ID.get(item.id)
    return `${index + 1}. ${merchandise.name} x${item.qty} - ${formatPrice(merchandise.price * item.qty)}`
  })
  const total = orderItems.reduce(
    (sum, item) => sum + MERCHANDISE_BY_ID.get(item.id).price * item.qty,
    0,
  )
  const message = `Halo, saya mau pesan merchandise:\n${lines.join('\n')}\n\nTotal: ${formatPrice(total)}`

  return `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`
}
