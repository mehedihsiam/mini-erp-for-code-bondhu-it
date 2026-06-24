# Mini ERP for Code Bondhu IT

A robust, type-safe, and highly optimized Enterprise Resource Planning (ERP) web application designed specifically for inventory management, sales tracking, supplier management, and reporting. 

Built with modern web technologies, this project enforces strict architectural patterns and 100% type safety to ensure long-term maintainability, rapid feature development, and flawless user experiences.

**Live URL**: [https://codebondhu-mini-erp-mehedi.onrender.com](https://codebondhu-mini-erp-mehedi.onrender.com)

---

## Table of Contents

1. [Project Overview](#project-overview)
2. [Key Features](#key-features)
3. [Technology Stack](#technology-stack)
4. [Project Architecture & Structure](#project-architecture--structure)
5. [Architectural Decisions & Reasoning](#architectural-decisions--reasoning)
6. [Setup & Installation Instructions](#setup--installation-instructions)
7. [Environment Variables](#environment-variables)
8. [Available Scripts](#available-scripts)

---

## Project Overview

The **Mini ERP** serves as a centralized hub to monitor business health. It tracks product inventory, handles complex transactions (Purchases and Sales) dynamically updating stock quantities, logs customer/supplier data, and generates highly readable table reports capable of CSV exports. It includes secure authentication and role management built seamlessly over Supabase.

---

## Key Features

- **Secure Authentication**: Complete Login and Registration flows backed by Supabase Auth with secure session persistence.
- **Interactive Dashboard**: A high-level overview featuring real-time statistical cards and dynamic sales charts (Monthly/Daily toggles).
- **Inventory Management (Products)**: Track stock quantities, prices, SKUs, and general product information.
- **Stakeholder Management**: Maintain dedicated CRM-like databases for both **Customers** and **Suppliers**.
- **Sales & Purchases (Transactions)**: 
  - Dynamic forms that handle multiple items per transaction.
  - Generates automated printable PDF invoices for Sales.
  - Automatically calculates real-time total amounts using strict caching protocols.
- **Reporting & Data Export**: Aggregated data grids displaying real-time stock limits, purchase histories, and sales logs, featuring one-click **CSV Exports**.

---

## Technology Stack

- **Framework**: [React 19](https://react.dev/) + [Vite](https://vitejs.dev/)
- **Routing**: [React Router v8](https://reactrouter.com/)
- **Backend & Database**: [Supabase](https://supabase.com/) (PostgreSQL + Auth)
- **State Management & Caching**: [TanStack React Query](https://tanstack.com/query)
- **Forms & Validation**: [React Hook Form](https://react-hook-form.com/) + [Zod](https://zod.dev/)
- **Styling**: [Tailwind CSS v4](https://tailwindcss.com/)
- **UI Components**: [Shadcn UI](https://ui.shadcn.com/) (Accessible Radix primitives)

---

## Project Architecture & Structure

This project completely abandons the traditional "file-type" folder structure (e.g., placing all hooks in one folder, all components in another) in favor of a highly scalable **Feature-Driven Architecture**. 

```text
src/
├── assets/             # Static assets (images, logos)
├── components/         # Shared, global UI components (Shadcn UI, layouts, ThemeProviders)
├── constants/          # Application-wide static variables and configurations
├── features/           # CORE DOMAIN MODULES
│   ├── auth/           # Login/Register Pages, Auth logic
│   ├── customers/      # Customer list, forms, schemas
│   ├── dashboard/      # Overview page, charts, statistic cards
│   ├── products/       # Inventory tracking, product forms
│   ├── purchases/      # Purchase transactions, dynamic item forms
│   ├── reports/        # Data grids, CSV exporters
│   ├── sales/          # Sales transactions, Invoice generator
│   └── suppliers/      # Supplier tracking, forms
├── hooks/              # Global data-fetching hooks wrapping TanStack Query
├── lib/                # Library initializers (Supabase client, utility classes)
├── types/              # Global TypeScript declarations (Supabase Database definitions)
├── App.tsx             # Main Router definition
└── main.tsx            # React root mount
```

---

## Architectural Decisions & Reasoning

For the human reviewer, here is an explanation of *why* the codebase is structured and written the way it is:

### 1. Feature-Driven Modularity
**Reasoning**: As an ERP scales, finding files becomes tedious. By grouping files by their domain (e.g., putting the `ProductForm`, `ProductsListPage`, and `schemas.ts` all inside `/features/products`), we ensure that modifying a specific business domain does not accidentally impact others.

### 2. 100% Strict Type Safety (Zero `any`)
**Reasoning**: Business applications cannot afford runtime data mapping errors.
- **Supabase Generics**: All data tables utilize the rigorously generated `Database["public"]["Tables"][...]` types.
- **Zod Resolvers**: Forms are strictly typed using Zod schemas. This ensures that a user cannot submit a string to a database column expecting an integer. We specifically enforce `valueAsNumber: true` on inputs bound to numerical Zod schemas to align React Hook Form with TypeScript generics gracefully.

### 3. Aggressive React Compiler Optimization
**Reasoning**: ERP applications process huge tables and complex nested forms. To prevent UI lag and "stale closures":
- **`useMemo`**: All Data Table column configurations (`columns`) and heavy mathematical reductions (like `totalAmount` in transaction forms) are memoized so they do not recalculate on trivial re-renders.
- **`useCallback`**: All event handlers (e.g., `handleSubmit`, `handleExportCSV`) are securely wrapped to prevent child components from unmounting and remounting aggressively.
- **`useWatch` over `watch()`**: We explicitly utilize React Hook Form's `useWatch` hook instead of destructuring `watch` from `useForm()`. This allows the upcoming React 19 Compiler to safely memoize components without being blocked by dynamic internal subscriptions.

### 4. TanStack React Query for Server State
**Reasoning**: Instead of relying on raw `useEffect` fetches, React Query handles caching, background refetching, and cache invalidation natively. When a "Purchase" or "Sale" is created, we immediately call `queryClient.invalidateQueries(["products"])`, triggering an instant, background UI refresh of stock quantities across the entire app without full page reloads.

---

## Setup & Installation Instructions

### Prerequisites
- [Node.js](https://nodejs.org/en/) (v18+ recommended)
- Git

### 1. Clone the repository
```bash
git clone git@github.com:mehedihsiam/mini-erp-for-code-bondhu-it.git
cd mini-erp-for-code-bondhu-it
```

### 2. Install dependencies
```bash
yarn install
```

### 3. Setup Environment Variables
Create a `.env` file in the root of the project and populate it with your Supabase credentials:
```env
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

### 4. Start the Development Server
```bash
yarn dev
```

The app will compile and become available locally (usually at `http://localhost:5173`).

---

## Available Scripts

- `yarn dev` - Starts the Vite development server.
- `yarn build` - Compiles TypeScript and builds the production bundle.
- `yarn lint` - Runs ESLint to check for code quality and strict type adherence.
- `yarn preview` - Boots up a local web server to preview the production build.
