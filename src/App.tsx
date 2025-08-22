import { Routes, Route } from 'react-router-dom';
import Login from './pages/Login';
import ForgotPassword from './pages/ForgotPassword';
import DashboardLayout from './layouts/DashboardLayout';
import Dashboard from './pages/Dashboard';
import AddPartner from './pages/AddPartner';
import CreateCv from './pages/CreateCv';
import CvLists from './pages/CvLists';
import SelectedCvs from './pages/SelectedCvs';
import InactiveCvs from './pages/InactiveCvs';
import PartnerDashboardLayout from './layouts/PartnerDashboardLayout';
import PartnerDashboard from './pages/partners/PartnerDashboard';
import PartnerSelectedCvs from './pages/partners/SelectedCvs';
import RequireAuth from './components/RequireAuth';
import RequireRole from './components/RequireRole';

function App() {
  return (
    <Routes>
      <Route path="/" element={<Login />} />
      <Route path="/forgot-password" element={<ForgotPassword />} />
      {/* Admin routes */}
      <Route
        path="/dashboard"
        element={
          <RequireAuth>
            <RequireRole role="admin">
              <DashboardLayout />
            </RequireRole>
          </RequireAuth>
        }
      >
        <Route index element={<Dashboard />} />
        <Route path="add-partner" element={<AddPartner />} />
        <Route path="create-cv" element={<CreateCv />} />
        <Route path="cv-lists" element={<CvLists />} />
        <Route path="selected-cvs" element={<SelectedCvs />} />
        <Route path="inactive-cvs" element={<InactiveCvs />} />
      </Route>
      {/* Partner routes */}
      <Route
        path="/partner-dashboard"
        element={
          <RequireAuth>
            <RequireRole role="user">
              <PartnerDashboardLayout />
            </RequireRole>
          </RequireAuth>
        }
      >
        <Route index element={<PartnerDashboard />} />
        <Route path="cv-lists" element={<CvLists />} /> {/* Shared page */}
        <Route path="selected-cvs" element={<PartnerSelectedCvs />} />
      </Route>
    </Routes>
  );
}

export default App;