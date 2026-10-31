import { GUN_BY_ID } from '../data/guns.js'

export const WHATSAPP_NUMBER = '6289606444700'

export const buildWhatsAppLink = (items, formatPrice) => {
  const orderItems = items.filter(
    (item) =>
      GUN_BY_ID.has(item.id) &&
      Number.isSafeInteger(item.qty) &&
      item.qty > 0,
  )

  if (orderItems.length === 0) return null

  const lines = orderItems.map((item, index) => {
    const gun = GUN_BY_ID.get(item.id)
    return `${index + 1}. ${gun.name} x${item.qty} - ${formatPrice(gun.price * item.qty)}`
  })
  const total = orderItems.reduce(
    (sum, item) => sum + GUN_BY_ID.get(item.id).price * item.qty,
    0,
  )
  const message = `Halo, saya mau pesan merchandise:\n${lines.join('\n')}\n\nTotal: ${formatPrice(total)}`

  return `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`
}
