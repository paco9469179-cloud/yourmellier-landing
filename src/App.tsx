import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import { LoginPage } from './components/auth/LoginPage'
import { BetaProtectedOutlet } from './components/layout/ProtectedRoute'
import { Landing } from './pages/Landing'
import { Questionnaire } from './pages/Questionnaire'

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<LoginPage />} />
        <Route path="/beta" element={<BetaProtectedOutlet />}>
          <Route index element={<Landing />} />
          <Route path="questionnaire" element={<Questionnaire />} />
        </Route>
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App
