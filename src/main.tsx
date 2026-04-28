import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import { Toaster as HotToaster } from 'react-hot-toast'
import { Toaster as SonnerToaster } from 'sonner'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { AuthProvider } from '@/hooks/useAuth'
import { LanguageProvider } from '@/hooks/useTranslation'
import App from '@/App'
import { initCapacitor } from '@/services/capacitor'
import './index.css'
import './styles/mobile-responsive.css'

// Initialize Capacitor on native platforms
initCapacitor();

// Create a client
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 minutes
      retry: 1,
    },
  },
})

import { ThemeProvider } from 'next-themes'

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <ThemeProvider attribute="class" defaultTheme="light" enableSystem={false}>
          <LanguageProvider>
            <AuthProvider>
              <App />
              <HotToaster position="top-center" toastOptions={{ style: { marginTop: '16px' } }} />
              <SonnerToaster richColors position="top-center" offset={16} />
            </AuthProvider>
          </LanguageProvider>
        </ThemeProvider>
      </BrowserRouter>
    </QueryClientProvider>
  </React.StrictMode>,
)
