import { BrowserRouter, Routes, Route, Navigate } from 'react-router'
import { ThemeProvider } from './components/ThemeProvider'
import { ProtectedRoute } from './components/layout/ProtectedRoute'
import { DashboardLayout } from './components/layout/DashboardLayout'

// Auth Pages
import { LoginPage } from './features/auth/LoginPage'
import { RegisterPage } from './features/auth/RegisterPage'

// Core Entity Pages
import { ProductsListPage } from './features/products/ProductsListPage'
import { CustomersListPage } from './features/customers/CustomersListPage'
import { SuppliersListPage } from './features/suppliers/SuppliersListPage'

// Transaction Pages
import { PurchasesListPage } from './features/purchases/PurchasesListPage'
import { SalesListPage } from './features/sales/SalesListPage'

// Dashboard & Reports
import { DashboardOverviewPage } from './features/dashboard/DashboardOverviewPage'
import { ReportsOverviewPage } from './features/reports/ReportsOverviewPage'

function App() {
  return (
    <ThemeProvider defaultTheme="system" storageKey="erp-theme">
      <BrowserRouter>
        <Routes>
          {/* Public Routes */}
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />

          {/* Protected Routes */}
          <Route element={<ProtectedRoute />}>
            <Route element={<DashboardLayout />}>
              <Route path="/" element={<Navigate to="/dashboard" replace />} />
              <Route path="/dashboard" element={<DashboardOverviewPage />} />
              <Route path="/reports" element={<ReportsOverviewPage />} />
              
              <Route path="/products" element={<ProductsListPage />} />
              <Route path="/customers" element={<CustomersListPage />} />
              <Route path="/suppliers" element={<SuppliersListPage />} />
              
              <Route path="/purchases" element={<PurchasesListPage />} />
              <Route path="/sales" element={<SalesListPage />} />
            </Route>
          </Route>
        </Routes>
      </BrowserRouter>
    </ThemeProvider>
  )
}

export default App
