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
import RequireAuth from './components/RequireAuth';

function NotFound() {
  return <div className="p-8">Page not found</div>;
}

function App() {
  return (
    <Routes>
      <Route path="/" element={<Login />} />
      <Route path="/forgot-password" element={<ForgotPassword />} />
      {/* Protected routes */}
      <Route
        path="/dashboard"
        element={
          <RequireAuth>
            <DashboardLayout />
          </RequireAuth>
        }
      >
        <Route index element={<Dashboard />} />
        {/* Owner-only */}
        <Route
          path="add-partner"
          element={
            <RequireAuth roles={["admin"]}>
              <AddPartner />
            </RequireAuth>
          }
        />
        <Route
          path="create-cv"
          element={
            <RequireAuth roles={["admin"]}>
              <CreateCv />
            </RequireAuth>
          }
        />
        <Route path="cv-lists" element={<CvLists />} />
        <Route path="selected-cvs" element={<SelectedCvs />} />
        <Route
          path="inactive-cvs"
          element={
            <RequireAuth roles={["admin"]}>
              <InactiveCvs />
            </RequireAuth>
          }
        />
      </Route>
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}

export default App;