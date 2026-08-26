import { useEffect } from 'react'
import { BrowserRouter } from 'react-router-dom'
import { AuthProvider } from './context/AuthContext'
import { ToastProvider } from './context/ToastContext'
import { AppRoutes } from './routes/AppRoutes'
import { initFirebaseMessaging } from './services/firebase.service'

function App() {
  useEffect(() => {
    initFirebaseMessaging().catch((err) => {
      console.error("[FCM] Startup initialization error:", err);
    });
  }, []);

  return (
    <BrowserRouter>
      <AuthProvider>
        <ToastProvider>
          <AppRoutes />
        </ToastProvider>
      </AuthProvider>
    </BrowserRouter>
  )
}

export default App


