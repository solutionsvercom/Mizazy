import React, { Suspense, lazy } from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'
import { StoreProvider } from './store'
import './index.css'

const AdminApp = lazy(() => import('./admin/AdminApp'))
const isAdmin = /^\/admin(\/|$)/.test(window.location.pathname)

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    {isAdmin ? (
      <Suspense fallback={<div className="min-h-screen bg-[#050505]" />}>
        <AdminApp />
      </Suspense>
    ) : (
      <StoreProvider>
        <App />
      </StoreProvider>
    )}
  </React.StrictMode>,
)
