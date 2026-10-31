# Bore & Barrel

A dummy gunshop storefront built as a Progressive Web App. It runs offline
with an app shell, a web app manifest, and a service worker, and uses React +
Vite + Tailwind CSS.

## Setup

```bash
npm install
npm run dev      # dev server with HMR
```

Other scripts:

```bash
npm run build    # production build to dist/
npm run preview  # serve the production build
npm run lint     # oxlint
```

## Features

- Product details can be shared with a link using the `?gun=<product-id>` URL.
- Catalog, favorites, and profile pages load on demand; product and review GET
  requests use an in-memory cache that is invalidated after changes.
- The profile includes About, Contact, saved drafts, and a local archive with
  restore support. Name and bio are edited on a separate page.
- Reviews support editing and deletion by their author. Thumbs-up/down feedback
  is stored locally in the current browser.
- A separate merchandise-only catalog and persistent cart demonstrate local
  state with `createPersistentStore` and `useStore`. The cart accepts only the
  fixed merchandise IDs; products from the main catalog cannot be added.
- Merchandise cart checkout opens WhatsApp with a prefilled order message.

The cart and WhatsApp checkout are limited to the separate merchandise page.

## Structure

```
.
├── index.html              # HTML shell
├── vite.config.js          # Vite + vite-plugin-pwa (manifest + service worker)
├── public/                 # static assets served at /
│   ├── icon-192.png / icon-512.png / icon.svg
│   └── guns/               # product images
└── src/
    ├── main.jsx            # entry, mounts <App/>
    ├── App.jsx             # app shell: tab state, header/nav/content/footer
    ├── App.css             # app shell styles
    ├── index.css           # global styles
    ├── components/
    │   ├── Header.jsx      # brand + nav
    │   ├── GunCard.jsx     # single product card
    │   └── Footer.jsx
    ├── data/
    │   └── guns.js         # dummy product data
    └── pages/
        ├── Catalog.jsx     # product grid
        ├── About.jsx
        └── Contact.jsx
```
