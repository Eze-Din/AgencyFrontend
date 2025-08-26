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
            <DashboardLayout />
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
    </Routes>
  );
}

export default App;