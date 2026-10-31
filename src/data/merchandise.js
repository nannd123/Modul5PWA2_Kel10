const MERCHANDISE = [
  {
    id: 'merch-shirt',
    name: 'Bore & Barrel T-Shirt',
    description: 'Everyday cotton tee with the shop logo.',
    type: 'Apparel',
    price: 180000,
    icon: 'shirt',
  },
  {
    id: 'merch-cap',
    name: 'Bore & Barrel Cap',
    description: 'A casual cap for sunny days.',
    type: 'Apparel',
    price: 120000,
    icon: 'cap',
  },
  {
    id: 'merch-stickers',
    name: 'Logo Sticker Pack',
    description: 'A set of durable shop logo stickers.',
    type: 'Accessories',
    price: 35000,
    icon: 'stickers',
  },
]

export const MERCHANDISE_BY_ID = new Map(MERCHANDISE.map((item) => [item.id, item]))

export default MERCHANDISE
