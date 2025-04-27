import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import RouteScrollToTop from "./helper/RouteScrollToTop";
import ProtectedRoute from "./components/ProtectedRoute";
import SignInPage from "./pages/SignInPage";
import HomePageTen from "./pages/HomePageTen";
import CleaningPage from "./pages/tickets/CleaningPage";
import ProfilePage from "./pages/ProfilePage";
import MaintenancePage from "./pages/tickets/MaintenancePage";
import AccidentPage from "./pages/tickets/AccidentPage";
import ClosedCleaningPage from "./pages/archive/ClosedCleaningPage";
import ClosedAccidentPage from "./pages/archive/ClosedAccidentPage";
import ClosedMaintenancePage from "./pages/archive/ClosedMaintenancePage";
import AssetsPage from "./pages/AssetsPage";
import TechniciansPage from "./pages/TechniciansPage";

function App() {
  return (
    <BrowserRouter>
      <RouteScrollToTop />
      <Routes>
        {/* Public routes */}
        <Route path="/sign-in" element={<SignInPage />} />

        {/* Protected routes with position checks */}
        <Route
          path="/"
          element={
            <ProtectedRoute allowedPositions={['admin', 'superadmin']}>
              <HomePageTen />
            </ProtectedRoute>
          }
        />
        <Route
          path="/technicians"
          element={
            <ProtectedRoute allowedPositions={['admin', 'superadmin']}>
              <TechniciansPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/profile"
          element={
            <ProtectedRoute allowedPositions={['admin', 'superadmin', 'tech']}>
              <ProfilePage />
            </ProtectedRoute>
          }
        />


        <Route
          path="/cleaning"
          element={
            <ProtectedRoute allowedPositions={['admin', 'superadmin', 'tech']}>
              <CleaningPage />
            </ProtectedRoute>
          }
        />

        <Route
          path="/accident"
          element={
            <ProtectedRoute allowedPositions={['admin', 'superadmin', 'tech']}>
              <AccidentPage />
            </ProtectedRoute>
          }
        />

        <Route
          path="/maintenance"
          element={
            <ProtectedRoute allowedPositions={['admin', 'superadmin', 'tech']}>
              <MaintenancePage />
            </ProtectedRoute>
          }
        />

        {/* Admin routes */}
        <Route
          path="/admin/closed-accident"
          element={
            <ProtectedRoute allowedPositions={['admin', 'superadmin']}>
              <ClosedAccidentPage />
            </ProtectedRoute>
          }
        />

        <Route
          path="/admin/closed-cleaning"
          element={
            <ProtectedRoute allowedPositions={['admin', 'superadmin']}>
              <ClosedCleaningPage />
            </ProtectedRoute>
          }
        />

        <Route
          path="/admin/closed-maintenance"
          element={
            <ProtectedRoute allowedPositions={['admin', 'superadmin']}>
              <ClosedMaintenancePage />
            </ProtectedRoute>
          }
        />

        <Route
          path="/admin/assets"
          element={
            <ProtectedRoute allowedPositions={['admin', 'superadmin']}>
              <AssetsPage />
            </ProtectedRoute>
          }
        />

        {/* Tech routes */}
        <Route
          path="/tech/dashboard"
          element={
            <ProtectedRoute allowedPositions={['tech']}>
              {/* <TechDashboard /> */}
            </ProtectedRoute>
          }
        />

        <Route
          path="/tech/*"
          element={
            <ProtectedRoute allowedPositions={['tech']}>
              {/* Tech specific components */}
            </ProtectedRoute>
          }
        />

        {/* Superadmin routes */}
        <Route
          path="/superadmin/*"
          element={
            <ProtectedRoute allowedPositions={['superadmin']}>
              {/* Superadmin specific components */}
            </ProtectedRoute>
          }
        />

        {/* Catch all route - redirect to signin if not authenticated */}
        <Route
          path="*"
          element={
            <ProtectedRoute>
              {({ user }) => (
                user ? (
                  <Navigate to={user.position === 'tech' ? '/tech/dashboard' : '/'} replace />
                ) : (
                  <Navigate to="/sign-in" replace />
                )
              )}
            </ProtectedRoute>
          }
        />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
