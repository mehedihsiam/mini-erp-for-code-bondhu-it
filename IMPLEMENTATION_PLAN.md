# Mini ERP System - Implementation Plan

## Overview
This document outlines the architecture, database schema, and step-by-step implementation plan for the Mini ERP System. The project uses React + Vite, TypeScript, Tailwind CSS, Shadcn UI for the frontend, and Supabase (PostgreSQL + Auth) for the backend.

## 1. Tech Stack
- **Frontend Framework:** React 19 + Vite
- **Language:** TypeScript
- **Styling:** Tailwind CSS v4 + Shadcn UI
- **Backend & Database:** Supabase (PostgreSQL, Authentication, Row Level Security)
- **Routing:** React Router DOM
- **State Management & Fetching:** TanStack Query (React Query) + Supabase JS Client
- **Form Handling:** React Hook Form + Zod
- **Icons:** Lucide React
- **Invoice Generation:** `jspdf` and `jspdf-autotable`

---

## 2. Database Architecture (Supabase PostgreSQL)

### 2.1 Tables
- **`users`**: Extends Supabase auth.users for profile data.
- **`products`**: `id`, `name`, `sku`, `description`, `price`, `stock_quantity`, `created_at`.
- **`customers`**: `id`, `name`, `email`, `phone`, `address`, `created_at`.
- **`suppliers`**: `id`, `name`, `email`, `phone`, `address`, `created_at`.
- **`purchases`**: `id`, `supplier_id`, `total_amount`, `purchase_date`, `status`, `created_at`.
- **`purchase_items`**: `id`, `purchase_id`, `product_id`, `quantity`, `unit_price`, `total_price`.
- **`sales`**: `id`, `customer_id`, `total_amount`, `sale_date`, `status`, `created_at`.
- **`sale_items`**: `id`, `sale_id`, `product_id`, `quantity`, `unit_price`, `total_price`.

### 2.2 Database Triggers & Functions (Stock Management)
To handle the "Stock Auto Update" and "Stock Auto Deduction" requirements reliably, we will use PostgreSQL triggers in Supabase:
- **`update_stock_on_purchase`**: Trigger on `purchase_items` insert/delete to automatically **increase** `products.stock_quantity`.
- **`update_stock_on_sale`**: Trigger on `sale_items` insert/delete to automatically **decrease** `products.stock_quantity`.

---

## 3. Frontend Architecture

### 3.1 Directory Structure
```
src/
├── components/
│   ├── ui/             # Shadcn UI reusable components
│   └── layout/         # DashboardLayout, Sidebar, Navbar, ProtectedRoute
├── features/           # Feature-based modules
│   ├── auth/           # Login, Registration
│   ├── dashboard/      # Overview metrics
│   ├── products/       # Product CRUD
│   ├── customers/      # Customer CRUD
│   ├── suppliers/      # Supplier CRUD
│   ├── purchases/      # Purchase creation and listing
│   ├── sales/          # Sales creation, listing, invoice generation
│   └── reports/        # Data grids and export
├── lib/
│   ├── supabase.ts     # Supabase client setup
│   └── utils.ts        # Helper functions
├── hooks/              # Custom hooks (useAuth, etc.)
├── types/              # TypeScript types and Zod schemas
└── App.tsx             # Application routing
```

### 3.2 Routing
- `/login`, `/register` (Public)
- `/` (Redirect to Dashboard)
- `/dashboard` (Protected)
- `/products`, `/customers`, `/suppliers` (Protected)
- `/purchases`, `/sales` (Protected)
- `/reports` (Protected)

---

## 4. Implementation Phases

### Phase 1: Project Setup & Initialization
- Initialize Shadcn UI and add foundational components (Button, Input, Table, Dialog, Form, etc.).
- Set up Supabase project, retrieve API keys, and configure `lib/supabase.ts`.
- Set up React Router and create the main dashboard layout with a sidebar navigation.

### Phase 2: Authentication Module
- Set up Supabase Authentication (Email/Password).
- Create Login and Registration pages.
- Implement an Auth Provider to manage session state and protect routes.

### Phase 3: Core Entities Management
- **Database:** Create `products`, `customers`, and `suppliers` tables with Row Level Security (RLS) policies.
- **Frontend:** Build data tables with pagination/search, and forms (create/edit) using React Hook Form + Zod for validation.
- Implement full CRUD operations for Products, Customers, and Suppliers.

### Phase 4: Transactions (Purchases & Sales)
- **Database:** Create `purchases`, `purchase_items`, `sales`, and `sale_items` tables.
- **Database Triggers:** Write SQL functions and triggers for stock auto-update and auto-deduction.
- **Frontend:** Build master-detail forms for creating purchases and sales.
  - Users select a supplier/customer, then add multiple products with quantities.
- Implement Invoice Generation for sales using PDF libraries.

### Phase 5: Dashboard & Reports
- **Dashboard:** Fetch aggregate data from Supabase (Total Products, Total Customers, Total Suppliers, Total Sales, Total Revenue) and display using Shadcn UI Cards and charts (e.g., Recharts).
- **Reports:** Build read-only data tables aggregating data across products, customers, suppliers, purchases, and sales. Add filtering and basic CSV/PDF export options.

### Phase 6: Polish, Testing & Deployment
- Comprehensive UI/UX review (toast notifications for actions, loading states, error boundaries).
- Ensure mobile responsiveness for the dashboard.
- Final testing of the stock triggers to ensure data integrity.
- Production build testing.
