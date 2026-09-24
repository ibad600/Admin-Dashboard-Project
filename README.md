# Product Admin Dashboard

#Links
- *GitHub Repository:* https://github.com/ibad600/Admin-Dashboard-Project
- *Live Demo:* admin-dashboard-project-phi.vercel.app

A responsive **Product Admin Dashboard** built with **Next.js**, **React**, **Tailwind CSS**, and **Axios**, powered by the [DummyJSON API](https://dummyjson.com).

---

## Tech Stack

| Technology   | Purpose                       |
| :----------- | :---------------------------- |
| Next.js      | React framework (App Router)  |
| React        | UI components                 |
| TypeScript   | Type safety                   |
| Tailwind CSS | Utility-first styling         |
| Axios        | HTTP client for all API calls |
| DummyJSON    | Backend REST API              |

---

## Features

### Authentication
- Login via `POST /auth/login` with credentials (`emilys` / `emilyspass`).
- Token stored in `localStorage` and attached to all Axios requests via interceptor.
- Protected routes redirect unauthenticated users to `/login`.
- Anti-double-click protection on login button.
- Logout clears session and redirects.

### Product List
- Desktop: clean data table layout.
- Mobile: responsive card grid layout.
- Displays: image, title, category, price, rating, stock status.

### Custom Pagination (No Libraries)
- Built entirely from scratch without any pagination library.
- Supports `limit` and `skip` query parameters.
- Page numbers with Previous / Next buttons.
- Page size selector: 10, 20, 50.
- Display text: `Showing 21–40 of 194`.
- Works correctly with search, filter, and sort.

### Search
- Debounced search input (400ms) to avoid excessive API calls.
- Uses `/products/search?q=` endpoint.
- Resets to page 1 on new search.
- **Race condition prevention**: Axios `AbortController` cancels stale in-flight requests so old results never overwrite new ones.

### Category Filter
- Fetches categories from `/products/categories`.
- Filters via `/products/category/{slug}`.

#### DummyJSON API Limitation & Decision

> **Decision:** The DummyJSON API does not support combining search (`/products/search?q=`) and category filtering (`/products/category/{slug}`) in a single request — they are mutually exclusive endpoints.
>
> **Chosen behavior:** When the user types a search query, the active category filter is automatically cleared. When the user selects a category, the search input is automatically cleared. This ensures predictable results and avoids silent data conflicts.

### Sorting
- Sort by: Price, Rating, Title.
- Sort direction: ascending or descending.
- Clear and predictable sorting behavior via URL query parameters.

### Product Details (`/products/[id]`)
- Full product page with image gallery, description, price, specs.
- Displays customer reviews with ratings.
- Shows warranty, shipping, and return policy info.
- Invalid product IDs show a proper "Not Found" page.

### Add / Edit / Delete Products
- **Add**: Modal form with validation. Calls `POST /products/add`.
- **Edit**: Pre-populated modal form. Calls `PUT /products/{id}`.
- **Delete**: Confirmation dialog before deletion. Calls `DELETE /products/{id}`.
- Since DummyJSON does not persist mutations, all changes are tracked in a local optimistic state store (`ProductContext`) so they remain visible during the session.

### Loading / Empty / Error States
- **Loading**: Animated spinner with contextual message.
- **Empty**: "No products found" with reset filters button.
- **Error**: Error message with a **Retry** button to re-fetch data.

### Shared Axios Setup
- Single shared Axios instance in `services/api.ts`.
- Base URL: `https://dummyjson.com`.
- Request interceptor: attaches `Authorization: Bearer <token>`.
- Response interceptor: handles 401 errors globally (clears session, redirects to login).
- All API calls use this shared instance — no duplicated configuration.

### Separate API Logic from UI
- API calls are isolated in `services/` directory (`auth.ts`, `products.ts`).
- Components call service functions, never raw Axios logic.

### URL State
- `page`, `limit`, `search`, `category`, `sortBy`, `order` are all synced in the URL.
- Refreshing the page preserves all state.
- Sharing the URL reproduces the same view.
- Invalid URL params (`?page=abc`, `?page=999`) are handled safely without breaking the app.

### Responsive Design
- Desktop: admin dashboard layout with data table.
- Mobile: card-based product display.
- Fully responsive with Tailwind CSS.

---

## Project Structure

```
src/
├── app/
│   ├── layout.tsx              # Root layout (AuthProvider + ProductProvider)
│   ├── page.tsx                # Redirects to /products
│   ├── globals.css             # Global styles & animations
│   ├── login/
│   │   └── page.tsx            # Login page
│   └── products/
│       ├── page.tsx            # Product list dashboard
│       └── [id]/
│           └── page.tsx        # Product details page
├── components/
│   ├── layout/
│   │   └── Header.tsx          # Top navigation bar
│   ├── products/
│   │   ├── ProductTable.tsx    # Desktop table view
│   │   ├── ProductCards.tsx    # Mobile card view
│   │   ├── ProductFilter.tsx   # Search, category, sort toolbar
│   │   ├── Pagination.tsx      # Custom pagination (no library)
│   │   ├── ProductFormModal.tsx # Add/Edit product modal
│   │   └── DeleteConfirmModal.tsx # Delete confirmation dialog
│   └── ui/
│       ├── Loader.tsx          # Loading spinner
│       ├── EmptyState.tsx      # Empty results state
│       └── ErrorState.tsx      # Error state with Retry button
├── context/
│   ├── AuthContext.tsx         # Authentication state management
│   └── ProductContext.tsx      # Local optimistic product state
├── hooks/
│   └── useDebounce.ts          # Custom debounce hook
├── services/
│   ├── api.ts                  # Shared Axios instance & interceptors
│   ├── auth.ts                 # Auth API service
│   └── products.ts             # Products API service
└── types/
    ├── auth.ts                 # Auth TypeScript interfaces
    └── product.ts              # Product TypeScript interfaces
```

---

## Getting Started

```bash
# Install dependencies
npm install

# Run development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### Login Credentials

| Field    | Value       |
| :------- | :---------- |
| Username | `emilys`    |
| Password | `emilyspass`|

---

## Restrictions Followed

- ❌ No React Query / SWR
- ❌ No ready-made table libraries
- ❌ No ready-made pagination libraries
- ❌ No Express / custom backend
- ❌ No MongoDB / MySQL / PostgreSQL
- ✅ Only DummyJSON API as the backend
- ✅ All HTTP calls use Axios exclusively

---

## 🧩 Problem Faced

### Stale Search Results

While implementing product search, multiple requests could be in progress at the same time. A slower previous request could return after a newer request and display outdated results.

### Solution

I implemented a debounced search and used Axios request cancellation with `AbortController`. When a new search request is triggered, the previous in-flight request is cancelled so that stale results do not overwrite the latest search results.

---

## 🤖 AI Usage

AI tools were used as a development and learning assistant for:

- Understanding Next.js concepts
- Understanding Axios and API integration
- Reviewing implementation approaches
- Debugging development issues
- Understanding edge cases
- Improving code structure

All generated suggestions were reviewed, tested, and understood before being included in the project.
