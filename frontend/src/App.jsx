import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { useAuthStore } from './stores/authStore'
import Layout from './components/Layout'
import LoginPage from './pages/LoginPage'
import RegisterPage from './pages/RegisterPage'
import DashboardHome from './pages/DashboardHome'
import SurveysPage from './pages/SurveysPage'
import SurveyBuilderPage from './pages/SurveyBuilderPage'
import SurveyAnalyticsPage from './pages/SurveyAnalyticsPage'
import SurveyKioskPage from './pages/SurveyKioskPage'
import DatasetsPage from './pages/DatasetsPage'
import DatasetDetailPage from './pages/DatasetDetailPage'
import DashboardsPage from './pages/DashboardsPage'
import DashboardBuilderPage from './pages/DashboardBuilderPage'
import PublicSurveyPage from './pages/PublicSurveyPage'

function ProtectedRoute({ children }) {
  const { token } = useAuthStore()
  return token ? children : <Navigate to="/login" replace />
}

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Public */}
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/s/:token" element={<PublicSurveyPage />} />

        {/* Protected */}
        <Route path="/" element={<ProtectedRoute><Layout /></ProtectedRoute>}>
          <Route index element={<DashboardHome />} />
          <Route path="surveys" element={<SurveysPage />} />
          <Route path="surveys/new" element={<SurveyBuilderPage />} />
          <Route path="surveys/:id/edit" element={<SurveyBuilderPage />} />
          <Route path="surveys/:id/analytics" element={<SurveyAnalyticsPage />} />
          <Route path="surveys/:id/kiosk" element={<SurveyKioskPage />} />
          <Route path="datasets" element={<DatasetsPage />} />
          <Route path="datasets/:id" element={<DatasetDetailPage />} />
          <Route path="dashboards" element={<DashboardsPage />} />
          <Route path="dashboards/new" element={<DashboardBuilderPage />} />
          <Route path="dashboards/:id" element={<DashboardBuilderPage />} />
        </Route>
      </Routes>
    </BrowserRouter>
  )
}
