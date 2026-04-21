import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import DashboardLayout from '../layouts/DashboardLayout';
import AuthLayout from '../layouts/AuthLayout';

// Auth pages
import Login from '../pages/auth/Login';
import Register from '../pages/auth/Register';

// Dashboard pages
import AdminDashboard from '../pages/dashboard/AdminDashboard';
import PassengerDashboard from '../pages/dashboard/PassengerDashboard';
import OfficerDashboard from '../pages/dashboard/OfficerDashboard';
import VendorDashboard from '../pages/dashboard/VendorDashboard';

// Feature pages
import ComplaintsPage from '../pages/complaints/ComplaintsPage';
import ComplaintDetail from '../pages/complaints/ComplaintDetail';
import SubmitComplaint from '../pages/complaints/SubmitComplaint';
import VendorsPage from '../pages/vendors/VendorsPage';
import VendorDetail from '../pages/vendors/VendorDetail';
import InspectionsPage from '../pages/inspections/InspectionsPage';
import InspectionDetail from '../pages/inspections/InspectionDetail';
import MessagesPage from '../pages/messages/MessagesPage';
import AlertsPage from '../pages/alerts/AlertsPage';
import PnrPage from '../pages/pnr/PnrPage';
import AnalyticsPage from '../pages/analytics/AnalyticsPage';
import UsersPage from '../pages/users/UsersPage';
import ProfilePage from '../pages/profile/ProfilePage';
import NotFound from '../pages/NotFound';
import AdminVendorsPage from '../pages/admin/AdminVendorsPage';
import AddVendorPage from '../pages/admin/AddVendorPage';

// ── Loading screen shown while auth state is being restored ──────────────────
const AuthLoading = () => (
  <div className="loading-screen">Restoring session…</div>
);

// ── Protected route — waits for auth to resolve before deciding ──────────────
const ProtectedRoute = ({ children, roles }) => {
  const { user, loading } = useAuth();

  // Still checking localStorage / calling /auth/me — don't redirect yet
  if (loading) return <AuthLoading />;

  // Not logged in → go to login
  if (!user) return <Navigate to="/login" replace />;

  // Logged in but wrong role → go to their own dashboard
  if (roles && !roles.includes(user.role)) {
    return <Navigate to="/dashboard" replace />;
  }

  return children;
};

// ── Public route — if already logged in, skip to dashboard ──────────────────
const PublicRoute = ({ children }) => {
  const { user, loading } = useAuth();
  if (loading) return <AuthLoading />;
  if (user) return <Navigate to="/dashboard" replace />;
  return children;
};

// ── Redirect to the correct role dashboard ───────────────────────────────────
const DashboardRedirect = () => {
  const { user } = useAuth();
  const map = {
    admin:     '/dashboard/admin',
    officer:   '/dashboard/officer',
    vendor:    '/dashboard/vendor',
    passenger: '/dashboard/passenger',
  };
  return <Navigate to={map[user?.role] || '/dashboard/passenger'} replace />;
};

// ── Routes ───────────────────────────────────────────────────────────────────
const AppRoutes = () => (
  <Routes>
    {/* ── Public (auth) routes ── */}
    <Route element={<AuthLayout />}>
      <Route path="/login"    element={<PublicRoute><Login /></PublicRoute>} />
      <Route path="/register" element={<PublicRoute><Register /></PublicRoute>} />
    </Route>

    {/* ── Protected routes ── */}
    <Route element={<ProtectedRoute><DashboardLayout /></ProtectedRoute>}>
      <Route path="/dashboard" element={<DashboardRedirect />} />

      {/* Role dashboards */}
      <Route path="/dashboard/admin"
        element={<ProtectedRoute roles={['admin']}><AdminDashboard /></ProtectedRoute>} />
      <Route path="/dashboard/passenger"
        element={<ProtectedRoute roles={['passenger']}><PassengerDashboard /></ProtectedRoute>} />
      <Route path="/dashboard/officer"
        element={<ProtectedRoute roles={['officer']}><OfficerDashboard /></ProtectedRoute>} />
      <Route path="/dashboard/vendor"
        element={<ProtectedRoute roles={['vendor']}><VendorDashboard /></ProtectedRoute>} />

      {/* Complaints */}
      <Route path="/complaints"     element={<ComplaintsPage />} />
      <Route path="/complaints/new" element={<ProtectedRoute roles={['passenger']}><SubmitComplaint /></ProtectedRoute>} />
      <Route path="/complaints/:id" element={<ComplaintDetail />} />

      {/* Vendors */}
      <Route path="/vendors"    element={<VendorsPage />} />
      <Route path="/vendors/:id" element={<VendorDetail />} />

      {/* Admin vendor management */}
      <Route path="/admin/vendors"
        element={<ProtectedRoute roles={['admin']}><AdminVendorsPage /></ProtectedRoute>} />
      <Route path="/admin/vendors/add"
        element={<ProtectedRoute roles={['admin']}><AddVendorPage /></ProtectedRoute>} />

      {/* Inspections */}
      <Route path="/inspections"
        element={<ProtectedRoute roles={['admin', 'officer']}><InspectionsPage /></ProtectedRoute>} />
      <Route path="/inspections/:id"
        element={<ProtectedRoute roles={['admin', 'officer']}><InspectionDetail /></ProtectedRoute>} />

      {/* Other */}
      <Route path="/messages" element={<MessagesPage />} />
      <Route path="/alerts"   element={<AlertsPage />} />
      <Route path="/pnr"      element={<PnrPage />} />
      <Route path="/analytics"
        element={<ProtectedRoute roles={['admin', 'officer']}><AnalyticsPage /></ProtectedRoute>} />
      <Route path="/users"
        element={<ProtectedRoute roles={['admin']}><UsersPage /></ProtectedRoute>} />
      <Route path="/profile"  element={<ProfilePage />} />
    </Route>

    {/* ── Fallbacks ── */}
    <Route path="/" element={<Navigate to="/dashboard" replace />} />
    <Route path="*" element={<NotFound />} />
  </Routes>
);

export default AppRoutes;
