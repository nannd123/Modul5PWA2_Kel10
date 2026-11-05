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
  requests use a short-lived in-memory cache that is invalidated after changes.
- Catalog images load lazily in the product grid and are cached by the service
  worker for repeat visits.
- The profile includes About, Contact, saved drafts, and a local archive with
  restore, permanent deletion, and separate name/bio editing.
- Reviews support editing and deletion by their author. Thumbs-up/down feedback
  is stored locally in the current browser.
- Catalog products support multiple uploaded images.

For Supabase, apply `supabase/migrations/20261105000000_add_product_images.sql`
before using multi-image uploads. The alternate REST API must also accept and
return an `images` array on product create, update, and fetch responses.

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
